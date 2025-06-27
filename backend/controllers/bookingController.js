const Booking = require('../models/Booking');

const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('event', 'name date location imageUrl') // Populate event details
        .sort({ createdAt: -1 });
    res.json(bookings);
};

module.exports = { getMyBookings };