const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paddleTransactionId: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);