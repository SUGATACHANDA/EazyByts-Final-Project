const Event = require('../models/Event');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// --- Configure Cloudinary ---
// Ensure your .env file has these values.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Configure Paddle API (for creating products) ---
const paddleApi = axios.create({
    baseURL: 'https://sandbox-api.paddle.com', // Or 'https://api.paddle.com' for live
    headers: { 'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` }
});


// ===============================================
// === 1. GET EVENTS (Public & Admin Combined) ===
// ===============================================
/**
 * @desc    Get events: paginated for public, all for admin.
 * @route   GET /api/events
 * @query   ?view=admin - Triggers admin mode to fetch all events.
 * @query   ?page=<num> - For public pagination.
 */
const getEvents = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    try {
        const isAdminView = req.query.view === 'admin';

        if (isAdminView) {
            // ADMIN LOGIC: Fetch all events, sorted by newest created.
            console.log("Serving request for Admin View (all events)");
            const events = await Event.find({}).sort({ createdAt: -1 });
            return res.json({ events });

        } else {
            // PUBLIC LOGIC: Fetch paginated, upcoming events.
            console.log(`Serving request for Public View (page ${req.query.page || 1})`);
            const pageSize = 3;
            const page = Number(req.query.page) || 1;

            const query = { date: { $gte: new Date().setHours(0, 0, 0, 0) } };
            const count = await Event.countDocuments(query);

            const events = await Event.find(query)
                .sort({ date: 'asc' })
                .limit(pageSize)
                .skip(pageSize * (page - 1));

            return res.json({ events, page, pages: Math.ceil(count / pageSize) });
        }
    } catch (error) {
        console.error("Error in getEvents controller:", error);
        return res.status(500).json({ message: 'Server error while fetching events' });
    }
};


// ==========================================
// === 2. GET SINGLE EVENT BY ID (Public) ===
// ==========================================
const getEventById = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Event not found' });
    }
};


// ======================================
// === 3. CREATE NEW EVENT (Admin) ===
// ======================================
const createEvent = async (req, res) => {
    const { name, description, date, location, price, totalTickets, imageUrl, cloudinaryId } = req.body;
    try {
        // Create Paddle Product & Price first
        const productRes = await paddleApi.post('/products', { name, tax_category: 'standard' });
        const productId = productRes.data.data.id;

        const priceRes = await paddleApi.post('/prices', {
            product_id: productId,
            description: name,
            unit_price: { amount: (price * 100).toString(), currency_code: 'USD' }
        });
        const paddlePriceId = priceRes.data.data.id;

        // Then create the event in our database
        const event = new Event({
            name, description, date, location, price, totalTickets,
            ticketsRemaining: totalTickets, imageUrl, cloudinaryId, paddlePriceId,
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);

    } catch (error) {
        console.error('Event Creation Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error during event creation' });
    }
};


// ====================================
// === 4. UPDATE EVENT (Admin) ===
// ====================================
const updateEvent = async (req, res) => {
    const { name, description, date, location, price, totalTickets } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Handle price update via Paddle if the price has changed
        let newPaddlePriceId = event.paddlePriceId;
        if (price && parseFloat(price) !== event.price) {
            const oldPriceDetails = await paddleApi.get(`/prices/${event.paddlePriceId}`);
            const paddleProductId = oldPriceDetails.data.data.product_id;
            await paddleApi.patch(`/prices/${event.paddlePriceId}`, { status: 'archived' });
            const newPriceRes = await paddleApi.post('/prices', {
                product_id: paddleProductId, description: name || event.name,
                unit_price: { amount: (price * 100).toString(), currency_code: 'USD' }
            });
            newPaddlePriceId = newPriceRes.data.data.id;
        }

        // Update standard fields
        event.name = name || event.name;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.price = price || event.price;
        event.paddlePriceId = newPaddlePriceId;

        // Smartly update ticket counts
        if (totalTickets && parseInt(totalTickets) !== event.totalTickets) {
            const ticketsSold = event.totalTickets - event.ticketsRemaining;
            const newTicketsRemaining = parseInt(totalTickets) - ticketsSold;
            if (newTicketsRemaining < 0) {
                return res.status(400).json({ message: 'New total tickets cannot be less than tickets already sold.' });
            }
            event.totalTickets = parseInt(totalTickets);
            event.ticketsRemaining = newTicketsRemaining;
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);

    } catch (error) {
        console.error("Event Update Error:", error.response ? error.response.data : error.message);
        res.status(400).json({ message: 'Event update failed.', error: error.message });
    }
};


// ===================================
// === 5. DELETE EVENT (Admin) ===
// ===================================
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            await cloudinary.uploader.destroy(event.cloudinaryId);
            await Event.deleteOne({ _id: req.params.id });
            res.json({ message: 'Event removed successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting event' });
    }
};


// ===========================================
// === 6. CLOUDINARY SIGNATURE (Admin) ===
// ===========================================
const getCloudinarySignature = (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'eventive_events';
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.json({ timestamp, folder, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
};


// --- EXPORTS ---
module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getCloudinarySignature,
};