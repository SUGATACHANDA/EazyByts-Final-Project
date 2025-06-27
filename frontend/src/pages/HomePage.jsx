import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import EventCard from '../components/events/EventCard';
import Spinner from '../components/utils/Spinner';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    document.title = "Eventive | One place sloution for all Events"

    useEffect(() => {
        const fetchEvents = async () => {
            if (page === 1) setLoading(true);

            try {

                const { data } = await api.get(`/events?page=${page}`);

                const newEvents = data.events || [];
                const totalPages = data.pages || 0;

                setEvents(prev => (page === 1 ? newEvents : [...prev, ...newEvents]));
                setPages(totalPages);
                setError('');
            } catch (err) {
                console.log(err)
                setError('Could not load events. Please try refreshing.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [page]);

    const loadMoreHandler = () => {
        if (!loading && page < pages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    if (loading && page === 1) return <Spinner />;
    if (error) return <p className="text-center text-red-600 font-medium py-10">{error}</p>;

    return (
        <div>
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">Upcoming Events</h1>
            <p className="text-center text-gray-500 mb-12">Discover your next experience</p>
            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => <EventCard key={event._id} event={event} />)}
                </div>
            ) : (
                <div className="text-center bg-white rounded-lg shadow-sm p-12 mt-8">
                    <p className="text-2xl font-semibold text-gray-600">No Upcoming Events Found.</p>
                    <p className="text-gray-400 mt-2">Please check back soon!</p>
                </div>
            )}
            <div className="text-center mt-12">
                {page < pages && (
                    <button onClick={loadMoreHandler} disabled={loading} className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        {loading ? 'Loading...' : 'Load More Events'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HomePage;