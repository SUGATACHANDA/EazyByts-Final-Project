import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CreateEventForm from '../pages/admin/CreateEventForm';
import AdminEventList from '../pages/admin/AdminEventList';
import Spinner from '../components/utils/Spinner';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    document.title = "Manage Events | Eventive"


    const fetchAdminEvents = async () => {
        setLoading(true);
        try {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
                Admin Dashboard
            </h1>
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">

                <div className="lg:w-1/3 lg:max-w-lg shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <CreateEventForm
                            key={selectedEvent ? selectedEvent._id : 'create-new'}
                            eventToEdit={selectedEvent}
                            onSuccess={handleSuccess}
                            onCancelEdit={handleCancelEdit}
                        />
                    </div>
                </div>


                <div className="flex-1 flex flex-col mt-8 lg:mt-0" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 shrink-0">
                        Manage Events
                    </h2>

                    {loading ? (
                        <div className="flex-grow flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (

                        <div className="overflow-y-auto flex-grow pr-2">
                            <AdminEventList
                                events={events}
                                onEdit={handleEditEvent}
                                onEventDeleted={fetchAdminEvents}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;