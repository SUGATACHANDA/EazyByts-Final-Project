import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/utils/Spinner';

// A sub-component to render each individual booking for cleaner code.
const BookingCard = ({ booking }) => {
    // Format the date for better readability.
    const formattedDate = new Date(booking.event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row mb-6 transition-shadow hover:shadow-xl">
            <img
                src={booking.event.imageUrl}
                alt={booking.event.name}
                className="w-full md:w-1/3 h-48 md:h-auto object-cover"
            />
            <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{booking.event.name}</h3>
                    <p className="text-gray-600 mt-2">Location: {booking.event.location}</p>
                    <p className="text-gray-600">Date: {formattedDate}</p>
                </div>
                <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="text-lg font-semibold">Tickets Purchased: {booking.quantity}</p>
                        <p className="text-sm text-gray-500 truncate" title={booking.paddleTransactionId}>
                            Tx ID: {booking.paddleTransactionId}
                        </p>
                    </div>
                    <Link
                        to={`/event/${booking.event._id}`}
                        className="btn-secondary whitespace-nowrap"
                    >
                        View Event
                    </Link>
                </div>
            </div>
        </div>
    );
};


// The main page component - now much simpler and cleaner.
const MyBookingsPage = () => {
    // Get everything we need directly from our global AuthContext.
    // The context handles all fetching and state management logic.
    const {
        user,                  // The logged-in user object
        bookings,              // The array of booking objects
        bookingsPage,          // The current page of bookings that has been fetched
        bookingsTotalPages,    // The total number of pages available
        bookingsLoading,       // A boolean that is true when a fetch is in progress
        fetchUserBookings,     // The function to call to get more bookings
        loading: authLoading,  // The initial loading state for user authentication
    } = useAuth();

    // This handler tells the context to fetch the next page of bookings.
    const handleLoadMore = () => {
        // We only fetch if not already loading and if more pages exist.
        if (!bookingsLoading && bookingsPage < bookingsTotalPages) {
            fetchUserBookings(bookingsPage + 1);
        }
    };

    // Show a spinner during the initial authentication check.
    if (authLoading) {
        return <Spinner />;
    }

    // If auth is done but there is no user, prompt them to log in.
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
            <h1 className="text-4xl font-bold text-center mb-8">My Bookings</h1>

            {/* Show a spinner ONLY if we're loading and there are NO bookings to display yet. */}
            {bookingsLoading && bookings.length === 0 ? (
                <Spinner />
            ) : bookings.length > 0 ? (
                // If there are bookings, render the list and the "Load More" button.
                <div className="max-w-4xl mx-auto space-y-6">
                    {bookings.map((booking) => (
                        <BookingCard key={booking._id} booking={booking} />
                    ))}

                    {/* Load More Button Section */}
                    <div className="text-center pt-6">
                        {/* Only show the button if there are more pages to load. */}
                        {bookingsPage < bookingsTotalPages && (
                            <button
                                onClick={handleLoadMore}
                                disabled={bookingsLoading}
                                className="btn-primary disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {bookingsLoading ? 'Loading More...' : 'Load More Bookings'}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                // This is the "empty state" for when a user has no bookings.
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