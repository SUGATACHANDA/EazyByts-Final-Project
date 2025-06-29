import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import { usePaddle } from '../hooks/usePaddle';
import Spinner from '../components/utils/Spinner';

const EventDetailsPage = () => {

    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const paddle = usePaddle();


    const [event, setEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get(`/events/${eventId}`);
                document.title = `${data.name} | Eventive`;
                setEvent(data);
            } catch (err) {
                console.error("Failed to fetch event details:", err);
                setError('Could not find the event. It may have been moved or deleted.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);



    const handleBuyTickets = () => {

        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        if (!paddle || !event) {
            alert('Checkout is not quite ready. Please wait a moment and try again.');
            return;
        }
        if (isProcessing) return;

        setIsProcessing(true);

        const successUrl = `${window.location.origin}/payment-success?event_id=${event._id}&quantity=${quantity}`;


        paddle.Checkout.open({

            items: [{
                priceId: event.paddlePriceId,
                quantity: quantity
            }],

            email: user.email,

            customData: {
                eventId: event._id,
                userId: user._id,
                quantity: quantity.toString(),
            },

            settings: {
                displayMode: "overlay",
                theme: "light",
                locale: "en",
                successUrl: successUrl,
            }
        });


        setTimeout(() => setIsProcessing(false), 3000);
    };


    if (loading || authLoading) return <Spinner />;
    if (error) return <div className="text-center bg-red-100 text-red-700 p-8 rounded-lg max-w-md mx-auto">{error}</div>;
    if (!event) return null;

    const isSoldOut = event.ticketsRemaining === 0;
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl mx-auto overflow-hidden">
            <div className="md:flex">

                <div className="md:w-1/2">
                    <img className="h-64 w-full object-cover md:h-full" src={event.imageUrl} alt={event.name} />
                </div>


                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{event.location}</div>
                        <h1 className="block mt-1 text-4xl leading-tight font-extrabold text-black">{event.name}</h1>
                        <p className="mt-2 text-gray-500 text-lg">{formattedDate}</p>
                        <p className="mt-4 text-gray-700">{event.description}</p>
                    </div>

                    <div className="mt-8 border-t-2 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-3xl font-bold text-gray-900">${parseFloat(event.price).toFixed(2)}</span>
                            <span className={`px-4 py-2 text-md font-semibold rounded-full ${isSoldOut ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                {isSoldOut ? 'Sold Out' : `${event.ticketsRemaining} Tickets Remaining`}
                            </span>
                        </div>

                        {!isSoldOut && (
                            <div className="flex items-stretch gap-4 mt-4">
                                <div className="w-28">
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 text-center mb-1">Quantity</label>
                                    <input
                                        id="quantity" type="number" value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') { setQuantity(''); return; }
                                            const num = parseInt(val, 10);

                                            setQuantity(Math.max(1, Math.min(event.ticketsRemaining, num || 1)));
                                        }}
                                        min="1" max={event?.ticketsRemaining} placeholder="1"
                                        className="input-field no-arrows text-center text-lg font-semibold"
                                    />
                                </div>
                                <button
                                    onClick={handleBuyTickets}
                                    disabled={isProcessing}
                                    className="btn-primary flex-grow text-lg disabled:bg-indigo-400"
                                >
                                    {isProcessing ? 'Opening...' : 'Buy Tickets'}
                                </button>
                            </div>
                        )}

                        {isSoldOut && (
                            <button disabled className="w-full h-14 text-lg font-bold btn-primary bg-gray-400 cursor-not-allowed">
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