const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true }, // To delete the image from Cloudinary later
    price: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsRemaining: { type: Number, required: true },
    paddlePriceId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);