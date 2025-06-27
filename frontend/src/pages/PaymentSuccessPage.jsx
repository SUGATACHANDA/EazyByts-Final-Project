import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';

const PaymentSuccessPage = () => {
    const { fetchUserBookings } = useAuth();

    // Prefetch user's bookings on page load.
    useEffect(() => {
        fetchUserBookings();
    }, [fetchUserBookings]);

    return (
        // --- THE LAYOUT FIX IS HERE ---
        // We make the main container a flexbox and set its minimum height
        // to fill the remaining screen space after accounting for the header/footer.
        // `min-h-[calc(100vh-10rem)]` calculates the viewport height minus an estimated
        // 10rem (160px) for your header and footer. Adjust this value if needed.
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-50 -my-6">
            {/* The `-my-8` class on the container helps to pull it into the padding of the main layout, giving more vertical space. */}

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center transform transition-all hover:shadow-2xl">

                {/* 1. Success Icon */}
                <div>
                    <CheckCircleIcon
                        className="mx-auto h-24 w-24 text-green-500 animate-pulse-slow"
                    />
                </div>

                {/* 2. Main Heading and Subtext */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Payment Successful!
                    </h2>
                    <p className="mt-2 text-md text-gray-600">
                        Thank you for your purchase. Your event ticket is confirmed.
                    </p>
                </div>

                {/* 3. Informational Box */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500">
                        A confirmation receipt has been sent to your email address. You can view all your ticket details in the "My Bookings" section.
                    </p>
                </div>

                {/* 4. Primary Call-to-Action Button */}
                <div>
                    <Link
                        to="/my-bookings"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                        Go to My Bookings
                    </Link>
                </div>

                {/* 5. Secondary Link */}
                <div className="text-sm text-center">
                    <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        or continue browsing events →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;