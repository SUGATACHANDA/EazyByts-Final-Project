const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Event = require('../models/Event');
const Order = require('../models/Order');

const router = express.Router();

const PADDLE_API_URL = process.env.PADDLE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com';

console.log(`[PADDLE] Mode: ${process.env.PADDLE_ENVIRONMENT}. API URL: ${PADDLE_API_URL}`);

const paddleApi = axios.create({
    baseURL: PADDLE_API_URL,
    headers: { 'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` }
});

// CREATE a new event and Paddle product/price
router.post('/events', async (req, res) => {
    const { name, description, date, location, time, price, totalTickets } = req.body;

    try {
        const productResponse = await paddleApi.post('/products', { data: { name } });
        const productId = productResponse.data.data.id;

        const priceResponse = await paddleApi.post('/prices', {
            data: {
                product_id: productId,
                description: name,
                unit_price: { amount: (price * 100).toString(), currency_code: 'USD' }
            }
        });
        const priceId = priceResponse.data.data.id;

        const newEvent = new Event({
            name, description, date, location, time, price, totalTickets,
            ticketsRemaining: totalTickets,
            paddlePriceId: priceId,
        });

        await newEvent.save();
        res.status(201).json(newEvent);

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to create event in Paddle.', error: error.response?.data });
    }
});

// GET all events
router.get('/events', async (req, res) => {
    try {
        // Sort by date, newest first
        const events = await Event.find().sort({ date: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PADDLE WEBHOOK for processing orders
router.post('/paddle-webhook', async (req, res) => {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    const signature = req.headers['paddle-signature'];
    const requestBody = req.body; // Raw buffer

    try { // Signature Verification
        const [tsPart, h1Part] = signature.split(';');
        const timestamp = tsPart.split('=')[1];
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${timestamp}:${requestBody}`);
        if (crypto.timingSafeEqual(Buffer.from(hmac.digest('hex')), Buffer.from(h1Part.split('=')[1]))) {
            console.log('[Webhook] Signature validated.');
        } else {
            console.warn('[Webhook] Invalid signature.');
            return res.status(401).send('Invalid signature.');
        }
    } catch (err) { return res.status(400).send('Signature verification failed.'); }

    const eventData = JSON.parse(requestBody.toString());
    if (eventData.event_type !== 'transaction.completed') {
        return res.status(200).send('Event received, but not processed.');
    }

    const { custom_data, id: paddleTransactionId, customer, items } = eventData.data;
    const { eventId, quantity } = custom_data;
    const purchasedQuantity = parseInt(quantity, 10);

    if (!eventId || !purchasedQuantity) return res.status(400).send('Webhook missing custom data.');

    try { // Atomically update DB
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, ticketsRemaining: { $gte: purchasedQuantity } },
            { $inc: { ticketsRemaining: -purchasedQuantity } },
            { new: true }
        );

        if (!updatedEvent) {
            console.error(`[OVERSOLD] Event ${eventId} lacked ${purchasedQuantity} tickets.`);
        } else {
            await Order.create({ eventId, quantity: purchasedQuantity, customerEmail: customer.email, paddleTransactionId });
            console.log(`[Success] Event ${eventId} tickets updated. Left: ${updatedEvent.ticketsRemaining}.`);
        }
    } catch (dbError) {
        console.error('[DB Error] Webhook DB update failed:', dbError);
        return res.status(500).send('DB error during webhook processing.'); // Fail for Paddle to retry
    }

    res.status(200).send('Webhook processed successfully.');
});

module.exports = router;