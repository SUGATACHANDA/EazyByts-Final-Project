import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);

    const fetchUserBookings = async () => {
        try {
            const { data } = await api.get('/bookings/mybookings');
            setBookings(data || []); // Use fallback to prevent errors
        } catch (error) {
            console.error("AuthContext: Failed to prefetch bookings.", error);
            // Don't block the user, just clear the bookings state on error.
            setBookings([]);
        }
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
            fetchUserBookings()
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        fetchUserBookings()
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        setBookings([])
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        setBookings([])
    };

    return (
        <AuthContext.Provider value={{ user, login, bookings, fetchUserBookings, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;