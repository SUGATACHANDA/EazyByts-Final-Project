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
        { timestamp: timestamp },
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
const getEvents = async (req, res) => {
    const pageSize = 3;
    const page = Number(req.query.page) || 1;
    const count = await Event.countDocuments({ date: { $gte: new Date() } }); // Only future events
    const events = await Event.find({ date: { $gte: new Date() } })
        .sort({ date: "asc" })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    res.json({ events, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
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

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    deleteEvent,
    getCloudinarySignature,
};
