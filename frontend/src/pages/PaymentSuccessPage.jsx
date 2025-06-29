import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/utils/Spinner';

const PaymentSuccessPage = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUserBookings } = useAuth();


    const [status, setStatus] = useState('processing');
    const [confirmedBooking, setConfirmedBooking] = useState(null);


    const hasFetched = useRef(false);


    useEffect(() => {

        if (hasFetched.current) {
            return;
        }
        hasFetched.current = true;

        const eventId = searchParams.get('event_id');


        if (!eventId) {
            setStatus('error');
            return;
        }

        const confirmPurchase = async (retries = 5, delay = 1500) => {
            try {

                const { data } = await api.get(`/bookings/latest?event_id=${eventId}`);

                setConfirmedBooking(data);
                setStatus('success');
                fetchUserBookings();
            } catch (err) {
                if (err.response?.status === 404 && retries > 0) {

                    setTimeout(() => confirmPurchase(retries - 1, delay), delay);
                } else {

                    console.error("Failed to confirm purchase:", err);
                    setStatus('error');
                }
            }
        };


        confirmPurchase();

    }, [searchParams, fetchUserBookings, navigate]); // Dependencies are stable and safe.



    useEffect(() => {
        if (status === 'success' || status === 'error') {
            console.log(`Purchase status: ${status}. Redirecting to /my-bookings...`);


            navigate('/my-bookings', {
                replace: true,
                state: {
                    purchaseStatus: status,
                    confirmedBooking: confirmedBooking
                }
            });
        }
    }, [status, confirmedBooking, navigate]);



    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <Spinner />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Finalizing Your Purchase</h2>
            <p className="text-gray-500">Please wait, this may take a few seconds...</p>
        </div>
    );
};

export default PaymentSuccessPage;