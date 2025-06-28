import { useEffect, useState, useRef } from 'react'; // <-- Import useRef
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import Spinner from '../components/utils/Spinner';

const PaymentSuccessPage = () => {
    // Hooks for getting data from URL and context
    const [searchParams] = useSearchParams();
    const { fetchUserBookings } = useAuth();

    // State for this page's data and UI
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- THE FIX: Using useRef to ensure the fetch runs only once ---
    // A ref is like an "instance variable" for a functional component.
    // Its value persists across renders but changing it does NOT trigger a re-render.
    const hasFetched = useRef(false);

    useEffect(() => {
        // --- This guard clause prevents the effect from running more than once ---
        if (hasFetched.current) {
            return;
        }
        // Immediately set the flag to true.
        hasFetched.current = true;

        const eventId = searchParams.get('event_id');

        if (!eventId) {
            setError('Could not verify purchase: Required information is missing.');
            setIsLoading(false);
            return;
        }

        const fetchConfirmation = async (retries = 5, delay = 1500) => {
            try {
                const { data } = await api.get(`/bookings/latest?event_id=${eventId}`);

                // Success!
                setBookingDetails(data);
                setError('');
                fetchUserBookings(); // Prefetch the full bookings list in the background.

            } catch (err) {
                if (err.response?.status === 404 && retries > 0) {
                    console.log(`Booking confirmation not found yet. Retrying in ${delay}ms...`);
                    // If not found, wait and try again.
                    setTimeout(() => fetchConfirmation(retries - 1, delay), delay);
                } else {
                    // All retries failed or a different error occurred.
                    console.error("Failed to fetch confirmation:", err);
                    setError("We couldn't confirm your booking details automatically, but your purchase was likely successful. Please check 'My Bookings' shortly.");
                    setIsLoading(false); // Stop loading on final failure
                }
            }
        };

        // Start the fetching process with our retry logic.
        fetchConfirmation();

        // The dependency array should only contain values that, if changed, should
        // legitimately re-trigger the ENTIRE fetch process.
    }, [searchParams, fetchUserBookings]);


    // This small, separate effect handles stopping the main loading spinner
    // only when we have a definitive result (either data or an error).
    useEffect(() => {
        if (bookingDetails || error) {
            setIsLoading(false);
        }
    }, [bookingDetails, error]);


    // Function to copy the transaction ID.
    const copyToClipboard = () => {
        if (!bookingDetails?.paddleTransactionId) return;
        navigator.clipboard.writeText(bookingDetails.paddleTransactionId)
            .then(() => alert("Transaction ID copied to clipboard!"))
            .catch(err => console.error("Failed to copy text:", err));
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <Spinner />
                <p className="mt-4 text-lg text-gray-600">Finalizing your purchase, please wait...</p>
                <p className="mt-2 text-sm text-gray-400">(This can take a few seconds)</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-gray-50 -my-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">

                <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500 animate-pulse-slow" />

                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
                    {/* Safely display the event name from fetched data. */}
                    <p className="mt-2 text-md text-gray-600">
                        Your ticket for "{bookingDetails?.event.name || 'the event'}" is confirmed.
                    </p>
                </div>

                {/* Show either the successfully fetched details or the final error message. */}
                {bookingDetails ? (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Your Transaction ID:</p>
                        <div className="flex items-center justify-center bg-white p-2 rounded border">
                            <p className="text-xs font-mono text-gray-700 mr-4 break-all">{bookingDetails.paddleTransactionId}</p>
                            <button onClick={copyToClipboard} title="Copy to Clipboard" className="shrink-0">
                                <DocumentDuplicateIcon className="h-5 w-5 text-gray-400 hover:text-indigo-600" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 p-4 rounded-md border-red-200">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div>
                    <Link to="/my-bookings" className="btn-primary w-full">
                        Go to My Bookings
                    </Link>
                </div>
                <div className="text-sm text-center">
                    <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                        or continue browsing events →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;