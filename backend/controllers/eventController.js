const Event = require("../models/Event");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// --- Configure Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Configure Paddle API ---
const PADDLE_API_URL =
    process.env.PADDLE_ENVIRONMENT === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";
const paddleApi = axios.create({
    baseURL: PADDLE_API_URL,
    headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
});

// @desc    Get a signature for Cloudinary upload
// @route   GET /api/events/cloudinary-signature
// @access  Admin
const getCloudinarySignature = (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { timestamp: timestamp, folder: 'eventive_events', },
        process.env.CLOUDINARY_API_SECRET
    );
    res.json({
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    });
};

// @desc    Create an event
// @route   POST /api/events
// @access  Admin
const createEvent = async (req, res) => {
    const {
        name,
        description,
        date,
        location,
        price,
        totalTickets,
        imageUrl,
        cloudinaryId,
    } = req.body;
    try {
        // 1. Create Paddle Product & Price
        const productResponse = await paddleApi.post('/products', {
            name,
            tax_category: 'standard'
        });
        const productId = productResponse.data.data.id;
        const priceResponse = await paddleApi.post('/prices', {
            product_id: productId,
            description: name, // or a more descriptive string
            unit_price: {
                amount: (price * 100).toString(),
                currency_code: 'USD'
            }
        });
        const paddlePriceId = priceResponse.data.data.id;

        // 2. Create Event in DB
        const event = new Event({
            name,
            description,
            date,
            location,
            price,
            totalTickets,
            ticketsRemaining: totalTickets,
            imageUrl,
            cloudinaryId,
            paddlePriceId: paddlePriceId,
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(
            "Event Creation Error:",
            error.response?.data || error.message
        );
        res.status(500).json({ message: "Server error during event creation" });
    }
};

// @desc    Get events with pagination
// @route   GET /api/events
// @access  Public
const getPublicEvents = async (req, res) => {
    // Set anti-caching headers.
    res.setHeader('Cache-Control', 'no-store');

    try {
        const pageSize = 6;
        const page = Number(req.query.page) || 1;

        // Filter for events from the beginning of today onwards.
        const query = { date: { $gte: new Date().setHours(0, 0, 0, 0) } };

        const count = await Event.countDocuments(query);
        const events = await Event.find(query)
            .sort({ date: 'asc' }) // Sort by soonest event date
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // This response shape is now GUARANTEED for this route.
        res.json({
            events,
            page,
            pages: Math.ceil(count / pageSize),
        });

    } catch (error) {
        console.error("Error fetching public events:", error);
        res.status(500).json({ message: 'Server error while fetching events' });
    }
};

const getAllEventsForAdmin = async (req, res) => {
    // Set anti-caching headers.
    res.setHeader('Cache-Control', 'no-store');

    try {
        // Fetch all documents. No filters, no pagination.
        // Sort by creation date so the newest events admin created appear at the top.
        const events = await Event.find({}).sort({ createdAt: -1 });

        // This response shape is guaranteed for this route.
        res.json({ events });

    } catch (error) {
        console.error("Error fetching admin events:", error);
        res.status(500).json({ message: 'Server error while fetching events for admin' });
    }
};

const getEventById = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ message: "Event not found" });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event) {
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(event.cloudinaryId);
        await event.deleteOne(); // Mongoose 7+
        res.json({ message: "Event removed" });
    } else {
        res.status(404).json({ message: "Event not found" });
    }
};

const updateEvent = async (req, res) => {
    // Now accepting price and totalTickets in the request body
    const { name, description, date, location, price, totalTickets } = req.body;

    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        let newPaddlePriceId = event.paddlePriceId;
        if (price && price !== event.price) {
            console.log(`Price changed for event ${event.name}. Old: ${event.price}, New: ${price}. Updating Paddle Price.`);

            // 1. Get the Product ID from the old Price ID
            const oldPriceDetails = await paddleApi.get(`/prices/${event.paddlePriceId}`);
            const paddleProductId = oldPriceDetails.data.data.product_id;

            // 2. Archive the old price (deactivates it)
            await paddleApi.patch(`/prices/${event.paddlePriceId}`, { status: 'archived' });

            // 3. Create a new price for the same product
            const newPriceResponse = await paddleApi.post('/prices', {
                product_id: paddleProductId,
                description: name || event.name,
                unit_price: {
                    amount: (price * 100).toString(),
                    currency_code: 'USD'
                }
            });
            newPaddlePriceId = newPriceResponse.data.data.id;
            console.log(`New Paddle Price created: ${newPaddlePriceId}`);
        }


        // --- Update Informational Fields ---
        event.name = name || event.name;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.price = price || event.price; // Update price in our DB
        event.paddlePriceId = newPaddlePriceId; // Update with the new price ID if it changed


        // --- Handle Ticket Count Update (if totalTickets has changed) ---
        if (totalTickets && totalTickets !== event.totalTickets) {
            const ticketsSold = event.totalTickets - event.ticketsRemaining;

            // The new remaining count is the new total minus tickets already sold.
            // We must ensure this doesn't result in a negative number.
            const newTicketsRemaining = totalTickets - ticketsSold;

            if (newTicketsRemaining < 0) {
                return res.status(400).json({ message: 'Update failed: New total ticket count cannot be less than the number of tickets already sold.' });
            }

            event.totalTickets = totalTickets;
            event.ticketsRemaining = newTicketsRemaining;
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);

    } catch (error) {
        console.error("Event Update Error:", error.response ? error.response.data : error.message);
        res.status(400).json({ message: 'Event update failed.', error: error.message });
    }
};


module.exports = {
    createEvent,
    getAllEventsForAdmin,
    getPublicEvents,
    getEventById,
    deleteEvent,
    getCloudinarySignature,
    updateEvent
};
