const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getEvents, // <-- The single, unified controller function
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getCloudinarySignature
} = require('../controllers/eventController');

// This single route handles BOTH public pagination and admin "get all".
// The logic is determined by query parameters inside the `getEvents` controller.
router.route('/')
    .get(getEvents)
    .post(protect, admin, createEvent);

// The rest of the routes remain the same
router.get('/cloudinary-signature', protect, admin, getCloudinarySignature);

router.route('/:id')
    .get(getEventById)
    .put(protect, admin, updateEvent)
    .delete(protect, admin, deleteEvent);

module.exports = router;