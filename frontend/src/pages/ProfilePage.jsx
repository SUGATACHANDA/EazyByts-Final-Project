/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { FaTicketAlt, FaUserEdit, FaHistory } from 'react-icons/fa';
import api from '../api/axiosConfig';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Fetch booking history
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('http://localhost:5000/api/bookings/mybookings');
                setBookings(data);
            } catch (error) {
                console.error('Failed to fetch bookings', error);
            } finally {
                setLoadingBookings(false);
            }
        };
        fetchBookings();
    }, []);

    // Handle profile update
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        try {
            const { data } = await api.put('http://localhost:5000/api/users/profile', {
                name,
                email,
                password: password || undefined, // Only send password if it's being changed
            });
            updateUser(data); // Update user in context
            setMessage('Profile Updated Successfully!');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            setMessage(error.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Edit Section */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaUserEdit className="mr-2 text-indigo-500" /> Edit Profile</h2>
                {message && <div className={`p-3 rounded-md mb-4 ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
                <form onSubmit={handleUpdate} className="space-y-4">
                    {/* Form inputs similar to LoginPage, but pre-filled */}
                    <div>...form fields for name, email, password...</div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Update Profile</button>
                </form>
            </div>

            {/* Booking History Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaHistory className="mr-2 text-indigo-500" /> Booking History</h2>
                {loadingBookings ? (
                    <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                    <p className="text-gray-500">You have no booked events.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="flex items-center p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                <img src={booking.event.image || 'https://via.placeholder.com/150'} alt={booking.event.title} className="w-24 h-24 object-cover rounded-md mr-4" />
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold">{booking.event.title}</h3>
                                    <p className="text-sm text-gray-600">{format(new Date(booking.event.date), 'MMMM d, yyyy')}</p>
                                    <p className="text-sm text-gray-500">{booking.event.location}</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-indigo-600">{booking.tickets}</div>
                                    <p className="text-sm text-gray-500">Ticket(s)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;