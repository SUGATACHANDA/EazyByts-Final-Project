const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

router.post('/paddle', async (req, res) => {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    const signature = req.headers['paddle-signature'];
    const requestBody = req.body;

    if (!signature) {
        return res.status(400).send('No signature provided.');
    }


    try {
        const hmac = crypto.createHmac('sha256', secret);
        const [tsPart, h1Part] = signature.split(';');
        if (!tsPart || !h1Part) throw new Error('Invalid signature format');
        const signed_payload = `${tsPart.split('=')[1]}:${requestBody}`;
        const expectedSignature = hmac.update(signed_payload).digest('hex');

        if (expectedSignature !== h1Part.split('=')[1]) {
            console.warn('[Webhook] Invalid Signature');
            return res.status(401).send('Invalid signature');
        }
    } catch (err) {
        console.error('[Webhook] Signature verification error:', err.message);
        return res.status(400).send('Signature verification failed.');
    }

    const eventData = JSON.parse(requestBody.toString());


    if (eventData.event_type !== 'transaction.completed') {
        return res.status(200).send('Webhook received but not processed.');
    }


    const { custom_data, id: paddleTransactionId } = eventData.data;
    const { eventId, userId, quantity } = custom_data;

    if (!eventId || !userId || !quantity) {
        console.error('[Webhook] Missing custom data', custom_data);
        return res.status(400).send('Webhook processed but missing required custom data.');
    }
    const purchasedQuantity = parseInt(quantity, 10);

    try {

        const event = await Event.findOneAndUpdate(
            { _id: eventId, ticketsRemaining: { $gte: purchasedQuantity } },
            { $inc: { ticketsRemaining: -purchasedQuantity } },
            { new: true }
        );
        if (!event) {

            console.error(`[CRITICAL] Oversell attempt or event not found. EventID: ${eventId}, Qty: ${purchasedQuantity}`);

        } else {

            await Booking.create({
                event: eventId,
                user: userId,
                quantity: purchasedQuantity,
                totalPrice: event.price * purchasedQuantity,
                paddleTransactionId,
            });
            console.log(`[Success] Booking created for User ${userId}, Event ${eventId}`);
        }
    } catch (dbError) {
        console.error('[Webhook] Database update failed:', dbError);

        return res.status(500).send('Database update error.');
    }


    res.status(200).send('Webhook processed successfully.');
});

module.exports = router;