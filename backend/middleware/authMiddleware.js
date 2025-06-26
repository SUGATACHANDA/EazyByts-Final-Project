const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
    let token;

    // 1. Check for the token in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get the token from the header (e.g., 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the database using the ID from the token
            // We exclude the password field from the result for security.
            const user = await User.findById(decoded.id).select('-password');

            // --- THE CRITICAL FIX ---
            // 5. Check if the user still exists in the database
            if (user) {
                // If the user is found, attach them to the request object
                req.user = user;
                // Proceed to the next middleware or the controller
                return next();
            } else {
                // If the user associated with this token no longer exists
                res.status(401).json({ message: 'Not authorized, user not found' });
                // Use 'return' to stop further execution
                return;
            }
        } catch (error) {
            console.error('Token verification failed:', error.message);
            // This will catch expired tokens, invalid tokens, etc.
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }

    // If we reach here, it means no token was provided at all.
    res.status(401).json({ message: 'Not authorized, no token provided' });
};


const admin = (req, res, next) => {
    // This function relies on 'protect' running first and setting req.user
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };