import api from '../../api/axiosConfig';

const AdminEventList = ({ events, onEventDeleted }) => {

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await api.delete(`/events/${eventId}`);
                alert('Event deleted successfully');
                onEventDeleted(); // Refresh list
            } catch (error) {
                console.error('Failed to delete event:', error);
                alert('Could not delete the event.');
            }
        }
    };

    if (events.length === 0) {
        return <p>No events found. Create one to get started.</p>
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Left</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {events.map(event => (
                        <tr key={event._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ticketsRemaining} / {event.totalTickets}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {/* Edit button can be added here */}
                                <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default AdminEventList;