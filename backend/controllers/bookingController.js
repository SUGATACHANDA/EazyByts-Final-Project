const Booking = require('../models/Booking');

const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('event', 'name date location imageUrl') // Populate event details
        .sort({ createdAt: -1 });
    res.json(bookings);
};

const getLatestBooking = async (req, res) => {
    // --- Extensive Logging for Debugging ---
    console.log("--- [getLatestBooking] CONTROLLER HIT ---");
    try {
        // 1. Log incoming data
        const { event_id } = req.query;
        const userId = req.user._id;
        console.log(`[getLatestBooking] Searching for booking with Event ID: ${event_id} and User ID: ${userId}`);

        if (!event_id) {
            console.log("[getLatestBooking] FAILED: Event ID is missing from query.");
            return res.status(400).json({ message: 'Event ID is required.' });
        }

        // 2. Perform the database query
        // We'll also populate the event name, as the frontend needs it.
        const latestBooking = await Booking.findOne({
            user: userId,
            event: event_id,
        })
            .sort({ createdAt: -1 })
            .populate('event', 'name');

        // 3. Log the result of the query
        if (!latestBooking) {
            console.log("[getLatestBooking] FAILED: No matching booking found in the database. Returning 404.");
            return res.status(404).json({ message: 'Booking confirmation not found yet.' });
        }

        // 4. Log success and send data
        console.log("[getLatestBooking] SUCCESS: Found booking. Transaction ID:", latestBooking.paddleTransactionId);
        res.json(latestBooking);

    } catch (error) {
        console.error("[getLatestBooking] FATAL ERROR:", error);
        res.status(500).json({ message: 'Server error while fetching latest booking.' });
    }
    console.log("--- [getLatestBooking] CONTROLLER END ---");
};

module.exports = { getMyBookings, getLatestBooking };