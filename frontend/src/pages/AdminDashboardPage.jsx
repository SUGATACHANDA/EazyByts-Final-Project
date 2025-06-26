import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CreateEventForm from '../pages/admin/CreateEventForm';
import AdminEventList from '../pages/admin/AdminEventList';
import Spinner from '../components/utils/Spinner';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Note: the backend 'getEvents' should return all events if an admin is asking.
            // A simple way is to add a query param: GET /api/events?all=true
            const { data } = await api.get('/events?limit=1000'); // Fetch a large number for admin view
            setEvents(data.events);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CreateEventForm onEventCreated={fetchEvents} />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
                    {loading ? <Spinner /> : <AdminEventList events={events} onEventDeleted={fetchEvents} />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;