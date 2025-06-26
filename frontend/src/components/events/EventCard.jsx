import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <Link to={`/event/${event._id}`} className="block group">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl flex flex-col h-full">
                <img className="h-48 w-full object-cover" src={event.image} alt={event.name} />
                <div className="p-4 flex flex-col flex-grow">
                    <p className="text-sm font-semibold text-indigo-600">{formattedDate} • {event.location}</p>
                    <h3 className="text-xl font-bold mt-2 text-gray-800">{event.name}</h3>
                    <p className="text-gray-600 mt-2 flex-grow">{event.description.substring(0, 100)}...</p>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">${event.price.toFixed(2)}</span>
                        {event.ticketsRemaining > 0 ? (
                            <span className="text-sm font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full">
                                {event.ticketsRemaining} left
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-red-800 bg-red-100 px-3 py-1 rounded-full">
                                Sold Out
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;