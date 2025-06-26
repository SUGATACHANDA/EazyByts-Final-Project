const express = require('express');
const router = express.Router();
const { initiateCheckout } = require('../controllers/paymentController.js');
const { protect } = require('../middleware/authMiddleware.js');

// This route must be protected so only logged-in users can start a payment
router.post('/initiate-checkout', protect, initiateCheckout);

module.exports = router;