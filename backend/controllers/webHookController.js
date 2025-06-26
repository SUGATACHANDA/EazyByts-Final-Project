const { Paddle, EventName, Environment } = require('@paddle/paddle-node-sdk');
const Event = require('../models/Event.js');
const Booking = require('../models/Booking.js');

// Initialize the Paddle SDK, making it aware of the environment.
// In production, process.env.NODE_ENV will be 'production', so it uses the default (live) environment.
const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.NODE_ENV === 'production' ? undefined : Environment.sandbox,
});

/**
 * Handles incoming webhooks from Paddle.
 * This is the single source of truth for fulfilling an order after a successful payment.
 */
const handlePaddleWebhook = async (req, res) => {
    try {
        // --- STEP 1: SECURE SIGNATURE VERIFICATION ---
        const signature = req.headers['paddle-signature'];
        const requestBody = req.body; // This is the raw Buffer from `express.raw()`

        // A webhook without a signature is immediately rejected as invalid.
        if (!signature) {
            console.error("Webhook Rejected: Request is missing the 'paddle-signature' header.");
            return res.status(400).send("Signature header missing.");
        }

        // The `unmarshal` function is the core of verification. It will THROW AN ERROR
        // if the signature is invalid, which will be caught by the `catch` block below.
        // If it succeeds, it returns a parsed event object with camelCase properties.
        const event = paddle.webhooks.unmarshal(requestBody, signature, process.env.PADDLE_WEBHOOK_SECRET);

        // If we reach this line, the webhook is authentic.
        console.log(`✅ Webhook Authenticated & Parsed. Event Type: ${event.eventType}`);


        // --- STEP 2: FULFILLMENT LOGIC ---
        if (event.eventType === EventName.CheckoutCompleted) {
            const { custom_data, transaction_id, line_items } = event.data;
            const { event_id: eventId, user_id: userId } = custom_data || {};
            const ticketsPurchased = line_items?.[0]?.quantity || 1;

            // Guard Clause: If the webhook doesn't contain our internal IDs, we can't process it.
            if (!eventId || !userId) {
                console.warn(`Webhook Acknowledged [No Action]: Missing custom_data for tx: ${transaction_id}`);
                return res.status(200).send("Webhook acknowledged, but missing critical data.");
            }

            // Idempotency Check: Prevent duplicate processing if Paddle resends the webhook.
            const existingBooking = await Booking.findOne({ transactionId: transaction_id });
            if (existingBooking) {
                console.log(`Webhook Acknowledged [Duplicate]: Transaction ${transaction_id} already fulfilled.`);
                return res.status(200).send("Webhook acknowledged, duplicate transaction.");
            }

            // Data Validation and Business Logic
            const eventToUpdate = await Event.findById(eventId);
            if (!eventToUpdate) {
                console.error(`Webhook Fulfillment FATAL: Event with ID ${eventId} not found for tx: ${transaction_id}.`);
                return res.status(200).send("Acknowledged, but related event not found.");
            }

            if (eventToUpdate.availableTickets < ticketsPurchased) {
                console.error(`Webhook Fulfillment FATAL: OVERSOLD! Not enough tickets for event ${eventId}. Tx: ${transaction_id}.`);
                // In a real app, this should trigger an alert to administrators.
                return res.status(200).send("Acknowledged, but inventory check failed.");
            }

            // Perform database mutations now that all checks have passed.
            eventToUpdate.availableTickets -= ticketsPurchased;
            await eventToUpdate.save();

            const newBooking = new Booking({
                user: userId,
                event: eventId,
                tickets: ticketsPurchased,
                transactionId: transaction_id,
            });
            await newBooking.save();

            console.log(`✅ Fulfillment Complete for tx ${transaction_id}.`);

        } else {
            console.log(`➡️  Unhandled Webhook Event Type: ${event.eventType}`);
        }

        // Acknowledge that the valid webhook was processed.
        res.status(200).send("Webhook processed successfully.");

    } catch (err) {
        // This centralized catch block handles any failure.
        console.error(`❌ Webhook processing failed: ${err.message}`);

        // Differentiate the error type for the response.
        if (err.message.includes('Invalid webhook signature')) {
            // If signature validation failed, it's a client error (bad request).
            return res.status(400).send("Webhook signature verification failed.");
        } else {
            // For any other error (e.g., database unavailable), it's our server's fault.
            // We send a 500 but this could also be a 200 to prevent Paddle from retrying.
            // For clarity during debugging, 500 is fine.
            return res.status(500).send("Internal server error during webhook fulfillment.");
        }
    }
};

module.exports = { handlePaddleWebhook };