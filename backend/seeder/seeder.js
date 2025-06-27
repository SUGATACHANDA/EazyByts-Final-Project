const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');


dotenv.config();


const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');


const users = require('./data/users');
const sampleEvents = require('./data/events');


const PADDLE_API_URL = process.env.PADDLE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
const paddleApi = axios.create({
    baseURL: PADDLE_API_URL,
    headers: { 'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` }
});


// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        console.log('Destroying existing data...');

        await Booking.deleteMany();
        await Event.deleteMany();
        await User.deleteMany();

        console.log('Importing users...');

        await User.create(users);

        console.log('Creating events and Paddle products...');

        const eventsToCreate = await Promise.all(sampleEvents.map(async (event) => {
            try {

                const productData = {
                    name: event.name,
                    tax_category: 'standard'
                };
                const productResponse = await paddleApi.post('/products', productData);
                const productId = productResponse.data.data.id;


                const priceData = {
                    description: `Standard Ticket for ${event.name}`,
                    product_id: productId,
                    unit_price: {
                        amount: (event.price * 100).toString(), // Price in cents
                        currency_code: 'USD'
                    },

                };

                const priceResponse = await paddleApi.post('/prices', priceData);
                const paddlePriceId = priceResponse.data.data.id;

                console.log(`Created Paddle product/price for: ${event.name}`);

                return {
                    ...event,
                    paddlePriceId: paddlePriceId,
                    ticketsRemaining: event.totalTickets,
                    cloudinaryId: 'seeder/placeholder',
                };
            } catch (apiError) {
                console.error(`Failed to create Paddle product/price for event: "${event.name}"`);
                if (apiError.response) {
                    console.error('API Error Details:', JSON.stringify(apiError.response.data, null, 2));
                }
                throw apiError;
            }
        }));
        await Event.create(eventsToCreate);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        if (error.response) {

            console.error('API Error during data import:', JSON.stringify(error.response.data, null, 2));
        } else {

            console.error('Error during data import:', error.message);
        }
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Booking.deleteMany();
        await Event.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error('Error during data destruction:', error);
        process.exit(1);
    }
};


if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}