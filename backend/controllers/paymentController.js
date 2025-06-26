const { Paddle, Environment } = require('@paddle/paddle-node-sdk');
const Event = require('../models/Event.js');

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: Environment.sandbox,
});

const initiateCheckout = async (req, res) => {
    const { eventId, ticketCount } = req.body;
    const userId = req.user._id;

    if (!eventId || !ticketCount) {
        return res.status(400).json({ message: 'Event ID and ticket count are required.' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });
        if (event.availableTickets < ticketCount) return res.status(400).json({ message: 'Not enough tickets available.' });

        // Step 1: Create a product dynamically. This part is correct.
        const product = await paddle.products.create({
            name: `Ticket: ${event.title}`,
            taxCategory: 'standard',
        });
        console.log(`Dynamically created product with ID: ${product.id}`);


        // --- FIX APPLIED HERE ---
        // Step 2: Create a price for that product.
        // The SDK expects ONE object containing all price attributes.
        // The `productId` is passed inside this object, not as a separate argument.
        const price = await paddle.prices.create({
            productId: product.id, // <-- Pass product.id INSIDE the object
            description: `Event Entry for ${event.title}`,
            unitPrice: {
                amount: Math.round(event.price * 100).toString(),
                currencyCode: 'USD',
            },
            // You can add customData to the price if needed, but it's often better
            // to add it to the checkout session on the frontend.
        });
        console.log(`Dynamically created price with ID: ${price.id}`);


        // Step 3: Return the necessary data to the frontend.
        res.status(200).json({
            priceId: price.id,
            customerEmail: req.user.email,
            customData: {
                user_id: userId,
                event_id: eventId,
            },
        });

    } catch (error) {
        console.error('CRASH in initiateCheckout:', error);
        if (error.body && error.body.errors) {
            console.error('Paddle API Error Details:', error.body.errors);
        }
        res.status(500).json({ message: 'Error initializing payment session.' });
    }
};

module.exports = { initiateCheckout };