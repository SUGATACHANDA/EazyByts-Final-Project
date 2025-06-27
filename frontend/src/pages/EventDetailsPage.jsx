// import { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import api from '../api/axiosConfig';
// import { useAuth } from '../hooks/useAuth';
// import Spinner from '../components/utils/Spinner';
// import { usePaddle } from '../hooks/usePaddle';

// const EventDetailsPage = () => {

//     const { id: eventId } = useParams();


//     const navigate = useNavigate();
//     const location = useLocation();
//     const { user, loading: authLoading } = useAuth();


//     const [event, setEvent] = useState(null);
//     const [quantity, setQuantity] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     const success_url = import.meta.env.VITE_SUCCESS_APP_FRONTEND_URL

//     useEffect(() => {

//         const fetchEvent = async () => {
//             setLoading(true);
//             setError('');
//             try {
//                 const { data } = await api.get(`/events/${eventId}`);
//                 document.title = `${data.name} | Eventive`
//                 setEvent(data);
//             } catch (err) {
//                 console.error("Failed to fetch event details:", err);
//                 setError('Could not find the event. It might have been moved or deleted.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchEvent();
//     }, [eventId]);

//     const paddle = usePaddle()


//     const handleBuyTickets = () => {

//         if (!user) {
//             navigate('/login', { state: { from: location } });
//             return;
//         }


//         if (!paddle || !event) {
//             alert('Checkout is not ready yet. Please wait a moment and try again.');
//             return;
//         }


//         paddle.Checkout.open({

//             items: [{
//                 priceId: event.paddlePriceId,
//                 quantity: quantity
//             }],

//             settings: {
//                 displayMode: "overlay",
//                 theme: "light",
//                 locale: "en",
//                 successUrl: `${success_url}/${eventId}/payment_status=success`,
//             },

//             email: user.email,
//             customData: {
//                 eventId: event._id,
//                 userId: user._id,
//                 quantity: quantity.toString(),
//             },
//         });
//     };


//     if (loading || authLoading) return <Spinner />;


//     if (error) {
//         return <div className="text-center bg-red-100 text-red-700 p-8 rounded-lg max-w-md mx-auto">{error}</div>;
//     }


//     if (!event) return null;


//     const isSoldOut = event.ticketsRemaining === 0;
//     const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
//         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//     });

//     return (
//         <div className="bg-white rounded-lg shadow-2xl max-w-5xl mx-auto overflow-hidden">
//             <div className="md:flex">

//                 <div className="md:w-1/2">
//                     <img className="h-64 w-full object-cover md:h-full" src={event.imageUrl} alt={event.name} />
//                 </div>


//                 <div className="p-8 md:w-1/2 flex flex-col justify-between">
//                     <div>
//                         <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{event.location}</div>
//                         <h1 className="block mt-1 text-4xl leading-tight font-extrabold text-black">{event.name}</h1>
//                         <p className="mt-2 text-gray-500 text-lg">{formattedDate}</p>
//                         <p className="mt-4 text-gray-700">{event.description}</p>
//                     </div>

//                     <div className="mt-8 border-t-2 pt-6">
//                         <div className="flex justify-between items-center mb-4">
//                             <span className="text-3xl font-bold text-gray-900">${event.price.toFixed(2)}</span>
//                             <span className={`px-4 py-2 text-md font-semibold rounded-full ${isSoldOut ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
//                                 {isSoldOut ? 'Sold Out' : `${event.
//                                     ticketsRemaining} Tickets Remaining`}
//                             </span>
//                         </div>

//                         {!isSoldOut && (
//                             <div className="flex items-center gap-4 mt-4">
//                                 <div>
//                                     <label
//                                         htmlFor="quantity"
//                                         className="block text-sm font-medium text-gray-700"
//                                     >
//                                         Quantity
//                                     </label>
//                                     <input
//                                         id="quantity"
//                                         type="number"
//                                         value={quantity}
//                                         onChange={(e) => {
//                                             let newQuantity = e.target.value;

//                                             if (newQuantity === '') {
//                                                 setQuantity('');
//                                                 return;
//                                             }

//                                             newQuantity = parseInt(newQuantity, 10);
//                                             if (isNaN(newQuantity)) newQuantity = 1;
//                                             newQuantity = Math.max(1, newQuantity);

//                                             if (event?.ticketsRemaining) {
//                                                 newQuantity = Math.min(newQuantity, event.ticketsRemaining);
//                                             }

//                                             setQuantity(newQuantity);
//                                         }}
//                                         min="1"
//                                         max={event?.ticketsRemaining}
//                                         placeholder="1"

//                                         // --- STYLING CHANGES ARE HERE ---
//                                         className="input-field no-arrows text-center font-semibold"

//                                     />
//                                 </div>
//                                 <button onClick={handleBuyTickets} className="btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4  font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-grow h-14 text-lg">
//                                     Buy Tickets
//                                 </button>
//                             </div>
//                         )}

//                         {isSoldOut && (
//                             <button disabled className="w-full h-14 text-lg font-bold btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4  text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2    cursor-not-allowed">
//                                 Sold Out
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EventDetailsPage;



import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import { usePaddle } from '../context/PaddleContext';
import Spinner from '../components/utils/Spinner';

const EventDetailsPage = () => {
    // --- React and App Hooks ---
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const paddle = usePaddle(); // Get the initialized Paddle instance from context

    // --- Component State ---
    const [event, setEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

    // This effect fetches the event details when the component mounts or the eventId changes.
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


    // The main function to handle a ticket purchase with the secure token flow.
    const handleBuyTickets = async () => {
        // 1. Basic checks for user, Paddle instance, and preventing double-clicks.
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        if (!paddle || !event) {
            alert('Checkout is not ready yet. Please try again in a moment.');
            return;
        }
        if (isPreparingCheckout) return;

        setIsPreparingCheckout(true);

        try {
            // 2. Request the short-lived, secure checkout token from our backend.
            const { data } = await api.post(`/events/${eventId}/checkout-session`);
            const checkoutToken = data.token;

            if (!checkoutToken) {
                throw new Error("Failed to retrieve a checkout session token from the server.");
            }

            // 3. Construct the secure success URL that points to our backend verification route.
            const backendVerifyUrl = `${import.meta.env.VITE_APP_API_URL}/bookings/verify-purchase/${checkoutToken}`;

            // 4. Open the Paddle Checkout modal with the secure URL.
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
                    // The user is sent here after payment. The backend will verify the token
                    // and then redirect them to the final frontend success page.
                    successUrl: backendVerifyUrl,
                },
            });

        } catch (error) {
            console.error("Could not prepare checkout:", error);
            alert("Sorry, we couldn't prepare your checkout. Please refresh and try again.");
        } finally {
            setIsPreparingCheckout(false);
        }
    };

    // --- RENDER LOGIC ---

    if (loading || authLoading) return <Spinner />;
    if (error) return <div className="text-center bg-red-100 text-red-700 p-8 rounded-lg max-w-md mx-auto">{error}</div>;
    if (!event) return null; // Render nothing if the event hasn't loaded yet and there's no error.

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
                            <span className="text-3xl font-bold text-gray-900">${event.price.toFixed(2)}</span>
                            <span className={`px-4 py-2 text-md font-semibold rounded-full ${isSoldOut ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                {isSoldOut ? 'Sold Out' : `${event.ticketsRemaining} Tickets Remaining`}
                            </span>
                        </div>

                        {!isSoldOut && (
                            <div className="flex items-center gap-4 mt-4">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setQuantity('');
                                                return;
                                            }
                                            const num = parseInt(val, 10);
                                            const validatedNum = Math.max(1, Math.min(event.ticketsRemaining, num || 1));
                                            setQuantity(validatedNum);
                                        }}
                                        min="1"
                                        max={event?.ticketsRemaining}
                                        placeholder="1"
                                        className="input-field no-arrows w-24 text-center font-semibold"
                                    />
                                </div>
                                {/* Corrected Button classes and added disabled state */}
                                <button
                                    onClick={handleBuyTickets}
                                    disabled={isPreparingCheckout}
                                    className="btn-primary flex-grow h-14 text-lg disabled:bg-indigo-400"
                                >
                                    {isPreparingCheckout ? 'Preparing...' : 'Buy Tickets'}
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