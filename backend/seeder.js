const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/user.js');
const events = require('./data/events.js');
const User = require('./models/User.js');
const Event = require('./models/Event.js');
const Booking = require('./models/Booking.js');
const connectDB = require('./config/db.js');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await Event.deleteMany();
        await User.deleteMany();
        await Booking.deleteMany();

        // Create the admin user
        await User.insertMany(users);
        console.log('Admin user imported!');

        // Create sample events
        await Event.insertMany(events);
        console.log('Sample events imported!');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Event.deleteMany();
        await User.deleteMany();
        await Booking.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

// Check for command line argument to destroy data
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}