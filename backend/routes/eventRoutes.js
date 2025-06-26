const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createEvent, getEvents, getEventById, deleteEvent, getCloudinarySignature, updateEvent
} = require('../controllers/eventController');

router.route('/').get(getEvents).post(protect, admin, createEvent);
router.get('/cloudinary-signature', protect, admin, getCloudinarySignature);
router.route('/:id').get(getEventById).delete(protect, admin, deleteEvent).put(protect, admin, updateEvent);

module.exports = router;