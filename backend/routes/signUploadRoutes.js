const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware.js');
const cloudinary = require('../config/cloudinary.js');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

router.get('/', protect, admin, (req, res) => {
    try {
        // 1. Define the parameters that we are going to sign.
        // The timestamp is essential to make the signature expire.
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Add any other parameters you want to be part of the upload validation.
        // For a simple upload, timestamp is enough. If you add a folder here,
        // you MUST also add it to the FormData on the frontend.
        const paramsToSign = {
            timestamp: timestamp,
            // Example: If you wanted to force uploads into a folder, you'd add:
            // folder: 'event_images' 
        };

        // 2. Check if environment variables are loaded correctly
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!apiSecret) {
            console.error("Cloudinary API Secret is not defined. Check your .env file.");
            return res.status(500).json({ message: "Server configuration error." });
        }

        // 3. Generate the signature using the parameters we defined.
        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        // 4. Send the necessary data back to the frontend.
        res.status(200).json({
            signature: signature,
            timestamp: timestamp,
            apikey: process.env.CLOUDINARY_API_KEY,
        });

    } catch (error) {
        console.error("Error in signature generation:", error);
        res.status(500).json({ message: 'Error generating upload signature' });
    }
});

module.exports = router;