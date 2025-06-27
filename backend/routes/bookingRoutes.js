const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyBookings } = require('../controllers/bookingController');

router.route('/mybookings').get(protect, getMyBookings);

module.exports = router;