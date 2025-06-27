import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Our single hook for auth and bookings data
import Spinner from '../components/utils/Spinner';


const BookingCard = ({ booking }) => {
    const formattedDate = new Date(booking.event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row mb-6">
            <img src={booking.event.imageUrl} alt={booking.event.name} className="w-full md:w-1/3 h-48 md:h-auto object-cover" />
            <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{booking.event.name}</h3>
                    <p className="text-gray-600 mt-2">Location: {booking.event.location}</p>
                    <p className="text-gray-600">Date: {formattedDate}</p>
                </div>
                <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="text-lg font-semibold">Tickets Purchased: {booking.quantity}</p>
                        <p className="text-sm text-gray-500 truncate" title={booking.paddleTransactionId}>Tx ID: {booking.paddleTransactionId}</p>
                    </div>
                    <Link to={`/event/${booking.event._id}`} className="btn-secondary whitespace-nowrap">View Event</Link>
                </div>
            </div>
        </div>
    );
};



const MyBookingsPage = () => {

    const { user, bookings, fetchUserBookings, loading: authLoading } = useAuth();


    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUserBookings();
        setIsRefreshing(false);
    };


    if (authLoading) {
        return <Spinner />;
    }


    if (!user) {
        return (
            <div className="text-center">
                <p>Please log in to view your bookings.</p>
                <Link to="/login" className="btn-primary mt-4">Login</Link>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-center">My Bookings</h1>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="btn-secondary disabled:opacity-50"
                >
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {bookings.length > 0 ? (
                <div className="max-w-4xl mx-auto">
                    {bookings.map((booking) => (
                        <BookingCard key={booking._id} booking={booking} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-lg mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">No Bookings Yet!</h2>
                    <p className="text-gray-600 mb-6">Your purchased tickets will appear here.</p>
                    <Link to="/" className="btn-primary">Browse Events</Link>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;