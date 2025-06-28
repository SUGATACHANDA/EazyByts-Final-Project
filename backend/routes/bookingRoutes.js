const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyBookings, getLatestBooking } = require('../controllers/bookingController');

router.route('/mybookings').get(protect, getMyBookings);
router.route('/latest').get(protect, getLatestBooking);

module.exports = router;