import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [bookingsPage, setBookingsPage] = useState(1);
    const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const fetchUserBookings = async (page = 1) => {
        if (page === 1) setBookings([]); // Clear old results when starting from page 1
        setBookingsLoading(true);

        try {
            const { data } = await api.get(`/bookings/mybookings?page=${page}`);
            const newBookings = data.bookings || [];

            // If it's the first page, replace. Otherwise, append.
            setBookings((prev) =>
                page === 1 ? newBookings : [...prev, ...newBookings]
            );

            setBookingsPage(data.page || 1);
            setBookingsTotalPages(data.pages || 0);
        } catch (error) {
            console.error("AuthContext: Failed to fetch bookings.", error);
            setBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
            fetchUserBookings(1);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        fetchUserBookings(1);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", {
            name,
            email,
            password,
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        setBookings([]);
        setBookingsPage(1);
        setBookingsTotalPages(0);
    };

    const logout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        setBookings([]);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                bookings,
                bookingsPage,
                bookingsTotalPages,
                bookingsLoading,
                fetchUserBookings,
                login,
                register,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
