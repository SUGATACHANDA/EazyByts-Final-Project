import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/utils/Spinner';

// A sub-component to render each individual booking for cleaner code
const BookingCard = ({ booking }) => {
    // Format the date for better readability
    const formattedDate = new Date(booking.event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row mb-6">
            <img
                src={booking.event.imageUrl}
                alt={booking.event.name}
                className="w-full md:w-1/3 h-48 md:h-auto object-cover"
            />
            <div className="p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{booking.event.name}</h3>
                    <p className="text-gray-600 mt-2">Location: {booking.event.location}</p>
                    <p className="text-gray-600">Date: {formattedDate}</p>
                </div>
                <div className="mt-4 border-t pt-4 flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold">Tickets Purchased: {booking.quantity}</p>
                        <p className="text-sm text-gray-500">Transaction ID: {booking.paddleTransactionId}</p>
                    </div>
                    <Link
                        to={`/event/${booking.event._id}`}
                        className="btn-inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        View Event
                    </Link>
                </div>
            </div>
        </div>
    );
};

// The main page component
const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // The API endpoint automatically knows the user from the JWT token
                const { data } = await api.get('/bookings/mybookings');
                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError('Could not load your bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]); // Re-fetch if the user changes (e.g., re-login)

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-center mb-8">My Bookings</h1>

            {bookings.length > 0 ? (
                <div className="max-w-4xl mx-auto">
                    {bookings.map((booking) => (
                        <BookingCard key={booking._id} booking={booking} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-lg mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">No Bookings Yet!</h2>
                    <p className="text-gray-600 mb-6">
                        You haven't purchased any tickets yet. Explore our events and find your next adventure!
                    </p>
                    <Link to="/" className="btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Browse Events
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;