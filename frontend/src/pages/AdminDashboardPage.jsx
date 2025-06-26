import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CreateEventForm from '../pages/admin/CreateEventForm';
import AdminEventList from '../pages/admin/AdminEventList';
import Spinner from '../components/utils/Spinner';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchAdminEvents = async () => {
        setLoading(true);
        try {
            // --- THE CHANGE IS HERE ---
            // Call the unified endpoint with the `view=admin` query parameter.
            const { data } = await api.get('/events?view=admin');
            setEvents(data.events || []);
        } catch (error) {
            console.error('Failed to fetch events for admin dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminEvents();
    }, []);

    const handleEditEvent = (event) => setSelectedEvent(event);
    const handleCancelEdit = () => setSelectedEvent(null);
    const handleSuccess = () => {
        fetchAdminEvents();
        setSelectedEvent(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CreateEventForm
                        key={selectedEvent ? selectedEvent._id : 'create'}
                        eventToEdit={selectedEvent}
                        onSuccess={handleSuccess}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <AdminEventList
                            events={events}
                            onEdit={handleEditEvent}
                            onEventDeleted={fetchAdminEvents}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;