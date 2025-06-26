require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// --- IMPORTANT ---
// The raw body parser for the Paddle webhook MUST come before the standard JSON parser.
app.use(
    '/api/webhooks/paddle',
    express.raw({ type: 'application/json' })
);

// Standard JSON parser for all other routes
app.use(express.json());

// Define Routes

app.get('/api/config', (req, res) => {
    res.json({
        paddleEnv: process.env.PADDLE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
        paddleClientToken: process.env.PADDLE_CLIENT_TOKEN,
    });
});
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/events', require('../routes/eventRoutes'));
app.use('/api/bookings', require('../routes/bookingRoutes'));
app.use('/api/webhooks', require('../routes/webhookRoutes'));


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));