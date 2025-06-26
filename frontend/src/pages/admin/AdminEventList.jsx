import api from '../../api/axiosConfig';

const AdminEventList = ({ events, onEdit, onEventDeleted }) => {

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to permanently delete this event?')) {
            try {
                await api.delete(`/events/${eventId}`);
                alert('Event deleted successfully.');
                onEventDeleted();
            } catch (error) {
                console.error('Failed to delete event:', error);
                alert('Error: Could not delete the event.');
            }
        }
    };

    if (!events || events.length === 0) {
        return <p className="text-center text-gray-500 py-8">No events found. Create one to get started!</p>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Left</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {events.map(event => (
                        <tr key={event._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ticketsRemaining} / {event.totalTickets}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(event)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
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