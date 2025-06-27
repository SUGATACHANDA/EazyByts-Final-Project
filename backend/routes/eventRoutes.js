const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getCloudinarySignature
} = require('../controllers/eventController');


router.route('/')
    .get(getEvents)
    .post(protect, admin, createEvent);


router.get('/cloudinary-signature', protect, admin, getCloudinarySignature);

router.route('/:id')
    .get(getEventById)
    .put(protect, admin, updateEvent)
    .delete(protect, admin, deleteEvent);

module.exports = router;