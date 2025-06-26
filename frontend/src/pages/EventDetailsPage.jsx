import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/utils/Spinner';
import { usePaddle } from '../hooks/usePaddle';

const EventDetailsPage = () => {
    // Get the event ID from the URL (e.g., /event/60d... becomes '60d...')
    const { id: eventId } = useParams();

    // Hooks for navigation, location (for redirects), and authentication state
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // State for the component itself
    const [event, setEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const success_url = import.meta.env.VITE_SUCCESS_APP_FRONTEND_URL

    useEffect(() => {
        // Function to fetch the event data from the backend
        const fetchEvent = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get(`/events/${eventId}`);
                document.title = `${data.name} | Eventive`
                setEvent(data);
            } catch (err) {
                console.error("Failed to fetch event details:", err);
                setError('Could not find the event. It might have been moved or deleted.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    const paddle = usePaddle()// Re-run this effect if the eventId in the URL changes


    const handleBuyTickets = () => {
        // 1. Check if user is logged in. If not, redirect to login page,
        //    but remember where they came from so we can send them back here after login.
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        // 2. Make sure Paddle.js is loaded and the event data is available.
        if (!paddle || !event) {
            alert('Checkout is not ready yet. Please wait a moment and try again.');
            return;
        }

        // 3. Initiate the Paddle Checkout
        paddle.Checkout.open({

            items: [{
                priceId: event.paddlePriceId,
                quantity: quantity
            }],

            settings: {
                displayMode: "overlay",
                theme: "light",
                locale: "en",
                successUrl: `${success_url}`
            },

            email: user.email,
            customData: {
                eventId: event._id,
                userId: user._id,
                quantity: quantity.toString(),
            },
        });
    };

    // Show a spinner while the event or authentication state is loading
    if (loading || authLoading) return <Spinner />;

    // Show an error message if the fetch failed
    if (error) {
        return <div className="text-center bg-red-100 text-red-700 p-8 rounded-lg max-w-md mx-auto">{error}</div>;
    }

    // This case handles when loading is done but event is still null (e.g., bad ID)
    if (!event) return null;

    // Helper variables for UI state
    const isSoldOut = event.ticketsRemaining === 0;
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl mx-auto overflow-hidden">
            <div className="md:flex">
                {/* Left Side: Image */}
                <div className="md:w-1/2">
                    <img className="h-64 w-full object-cover md:h-full" src={event.imageUrl} alt={event.name} />
                </div>

                {/* Right Side: Details and Actions */}
                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{event.location}</div>
                        <h1 className="block mt-1 text-4xl leading-tight font-extrabold text-black">{event.name}</h1>
                        <p className="mt-2 text-gray-500 text-lg">{formattedDate}</p>
                        <p className="mt-4 text-gray-700">{event.description}</p>
                    </div>

                    <div className="mt-8 border-t-2 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-3xl font-bold text-gray-900">${event.price.toFixed(2)}</span>
                            <span className={`px-4 py-2 text-md font-semibold rounded-full ${isSoldOut ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                {isSoldOut ? 'Sold Out' : `${event.
                                    ticketsRemaining} Tickets Remaining`}
                            </span>
                        </div>

                        {!isSoldOut && (
                            <div className="flex items-center gap-4 mt-4">
                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Quantity
                                    </label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            let newQuantity = e.target.value;

                                            if (newQuantity === '') {
                                                setQuantity('');
                                                return;
                                            }

                                            newQuantity = parseInt(newQuantity, 10);
                                            if (isNaN(newQuantity)) newQuantity = 1;
                                            newQuantity = Math.max(1, newQuantity);

                                            if (event?.ticketsRemaining) {
                                                newQuantity = Math.min(newQuantity, event.ticketsRemaining);
                                            }

                                            setQuantity(newQuantity);
                                        }}
                                        min="1"
                                        max={event?.ticketsRemaining}
                                        placeholder="1"

                                        // --- STYLING CHANGES ARE HERE ---
                                        className="input-field no-arrows w-24 text-center text-lg font-semibold"

                                    />
                                </div>
                                <button onClick={handleBuyTickets} className="btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4  font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-grow h-14 text-lg">
                                    Buy Tickets
                                </button>
                            </div>
                        )}

                        {isSoldOut && (
                            <button disabled className="w-full h-14 text-lg font-bold btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4  text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2    cursor-not-allowed">
                                Sold Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;