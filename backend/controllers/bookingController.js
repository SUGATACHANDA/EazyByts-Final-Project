const Booking = require('../models/Booking');

// @desc    Get paginated list of the logged-in user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    // Set an anti-caching header to ensure fresh data
    res.setHeader('Cache-Control', 'no-store');

    try {
        const pageSize = 4;
        const page = Number(req.query.page) || 1;
        const userId = req.user._id;

        const count = await Booking.countDocuments({ user: userId });

        const bookings = await Booking.find({ user: userId })
            .populate('event', 'name date location imageUrl')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));


        res.json({
            bookings,
            page,
            pages: Math.ceil(count / pageSize),
        });

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Server error while fetching bookings." });
    }
};

module.exports = { getMyBookings };