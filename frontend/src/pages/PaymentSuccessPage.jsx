import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import Spinner from '../components/utils/Spinner';

const PaymentSuccessPage = () => {
    // Hooks for getting data from URL and context
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // <-- Add the navigate hook
    const { fetchUserBookings } = useAuth();

    // State for this page's data and UI
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        // Guard clause prevents this effect from running more than once.
        if (hasFetched.current) {
            return;
        }
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

                // --- SUCCESS! ---
                setBookingDetails(data);
                fetchUserBookings();

                // --- THE NEW LOGIC: REDIRECT AFTER A DELAY ---
                console.log("Purchase confirmed. Redirecting to My Bookings in 5 seconds...");
                setTimeout(() => {
                    // We use `replace: true` to remove the current URL from the browser history.
                    navigate('/my-bookings', { replace: true });
                }, 5000); // 5-second delay for the user to see the page

            } catch (err) {
                // ... existing error handling with retries ...
                if (err.response?.status === 404 && retries > 0) {
                    setTimeout(() => fetchConfirmation(retries - 1, delay), delay);
                } else {
                    setError("We couldn't confirm your booking automatically, but your purchase was likely successful. You will be redirected shortly.");
                    setIsLoading(false);
                    // Also redirect on failure after a delay
                    setTimeout(() => {
                        navigate('/my-bookings', { replace: true });
                    }, 8000);
                }
            }
        };
        fetchConfirmation();

    }, [searchParams, fetchUserBookings, navigate]);


    // This small effect handles stopping the loading spinner.
    useEffect(() => {
        if (bookingDetails || error) {
            setIsLoading(false);
        }
    }, [bookingDetails, error]);


    if (isLoading) {
        return (
            <div className="text-center py-20">
                <Spinner />
                <p className="mt-4 text-lg text-gray-600">Finalizing your purchase, please wait...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
                <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500" />

                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
                    {/* Display a confirmation message based on success or final error */}
                    <p className="mt-2 text-md text-gray-600">
                        {bookingDetails
                            ? `Your ticket for "${bookingDetails.event.name}" is confirmed.`
                            : `Your purchase was successful.`}
                    </p>
                </div>

                {/* Main feedback area */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500">
                        {error
                            ? error // Show the specific error if one occurred
                            : `You will be automatically redirected to your bookings page shortly.`}
                    </p>
                </div>

                {/* Manual redirect button */}
                <div>
                    <Link to="/my-bookings" className="btn-primary w-full">
                        Go to My Bookings Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;