import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CreateEventForm from '../pages/admin/CreateEventForm';
import AdminEventList from '../pages/admin/AdminEventList';
import Spinner from '../components/utils/Spinner';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // --- THE ONLY CHANGE NEEDED ON THE FRONTEND ---
            // Point this to the new, dedicated admin endpoint.
            const { data } = await api.get('/events/admin/all');

            setEvents(data.events);
        } catch (error) {
            console.error('Failed to fetch events for admin dashboard', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchEvents();
    }, []);

    // Handler to set the event to be edited in the form
    const handleEditEvent = (event) => {
        setSelectedEvent(event);
    };

    // Handler to clear the form (exit edit mode)
    const handleCancelEdit = () => {
        setSelectedEvent(null);
    };

    // This function is called on successful creation or update
    const handleSuccess = () => {
        fetchEvents();       // Re-fetch the events to show the updated list
        setSelectedEvent(null); // Clear the form by exiting edit mode
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <CreateEventForm
                        key={selectedEvent ? selectedEvent._id : 'create'} // A key helps React properly reset the form state
                        eventToEdit={selectedEvent}
                        onSuccess={handleSuccess}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>
                {/* Event List Column */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <AdminEventList
                            events={events}
                            onEdit={handleEditEvent}
                            onEventDeleted={fetchEvents} // Simply re-fetch the list on delete
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;