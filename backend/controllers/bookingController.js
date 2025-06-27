const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('event', 'name date location imageUrl') // Populate event details
        .sort({ createdAt: -1 });
    res.json(bookings);
};

const verifyPurchase = async (req, res) => {
    const { token } = req.params;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(`Purchase token verified for User ID: ${decoded.userId}, Event ID: ${decoded.eventId}`);

        res.redirect('/payment-success');

    } catch (error) {

        console.error("Purchase verification failed:", error.message);

        res.status(401).redirect('/?purchase=failed');
    }
};

module.exports = { getMyBookings, verifyPurchase };