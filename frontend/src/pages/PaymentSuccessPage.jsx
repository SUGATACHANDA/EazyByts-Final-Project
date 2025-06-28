import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/utils/Spinner';

const PaymentSuccessPage = () => {
    // Hooks for getting data from URL, navigating, and accessing context
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUserBookings } = useAuth();

    // State to track the outcome of the confirmation
    const [status, setStatus] = useState('processing');
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    // useRef to ensure the fetching logic runs only once, preventing loops
    const hasFetched = useRef(false);

    // This effect handles the entire confirmation logic
    useEffect(() => {
        // Guard clause: Do not run this effect more than once.
        if (hasFetched.current) {
            return;
        }
        hasFetched.current = true;

        const eventId = searchParams.get('event_id');

        // If the URL is missing the event_id, we can't proceed.
        if (!eventId) {
            setStatus('error');
            return;
        }

        const confirmPurchase = async (retries = 5, delay = 1500) => {
            try {
                // Call the secure backend endpoint to get the booking details
                const { data } = await api.get(`/bookings/latest?event_id=${eventId}`);
                // Success! Store the data and update status.
                setConfirmedBooking(data);
                setStatus('success');
                fetchUserBookings(); // Trigger background refetch of all bookings for the context
            } catch (err) {
                if (err.response?.status === 404 && retries > 0) {
                    // If not found yet (webhook delay), wait and try again.
                    setTimeout(() => confirmPurchase(retries - 1, delay), delay);
                } else {
                    // All retries failed or a different error occurred.
                    console.error("Failed to confirm purchase:", err);
                    setStatus('error'); // On final failure, set status to 'error'
                }
            }
        };

        // Start the process
        confirmPurchase();

    }, [searchParams, fetchUserBookings, navigate]); // Dependencies are stable and safe.


    // This second, separate effect handles the redirect.
    // It runs only when the `status` changes from 'processing' to 'success' or 'error'.
    useEffect(() => {
        if (status === 'success' || status === 'error') {
            console.log(`Purchase status: ${status}. Redirecting to /my-bookings...`);

            // This is the key to preventing the back-button problem.
            // It navigates to the bookings page and REPLACES the current URL 
            // (`/payment-success?event_id=...`) in the browser's history.
            // It also passes the status and data along as state.
            navigate('/my-bookings', {
                replace: true,
                state: {
                    purchaseStatus: status,
                    confirmedBooking: confirmedBooking
                }
            });
        }
    }, [status, confirmedBooking, navigate]);


    // The UI for this page is very simple, as the user will only see it briefly.
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <Spinner />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Finalizing Your Purchase</h2>
            <p className="text-gray-500">Please wait, this may take a few seconds...</p>
        </div>
    );
};

export default PaymentSuccessPage;