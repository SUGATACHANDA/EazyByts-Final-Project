const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createEvent, getAllEventsForAdmin, getPublicEvents, getEventById, deleteEvent, getCloudinarySignature, updateEvent
} = require('../controllers/eventController');

router.route('/').get(getEvents).post(protect, admin, createEvent);
router.get('/cloudinary-signature', protect, admin, getCloudinarySignature);
router.route('/:id').get(getEventById).delete(protect, admin, deleteEvent).put(protect, admin, updateEvent);
router.route('/admin/all')
    .get(protect, admin, getAllEventsForAdmin);

module.exports = router;