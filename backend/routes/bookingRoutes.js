const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyBookings, verifyPurchase } = require('../controllers/bookingController');

router.route('/mybookings').get(protect, getMyBookings);

router.route('/verify-purchase/:token').get(protect, verifyPurchase);

module.exports = router;