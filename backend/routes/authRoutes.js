const express = require('express');
const router = express.Router();

// 1. Import the controller functions that contain the business logic
const {
    registerUser,
    authUser,
} = require('../controllers/authController.js');

// 2. Define the routes and connect them to the controller functions

// @route   POST /api/auth/register
// @desc    Handles the registration of a new user.
//          It takes user details (name, email, password) in the request body.
router.post('/register', registerUser);


// @route   POST /api/auth/login
// @desc    Handles the login for an existing user.
//          It takes credentials (email, password) in the request body.
router.post('/login', authUser);


// 3. Export the router to be used in the main server.js file
module.exports = router;