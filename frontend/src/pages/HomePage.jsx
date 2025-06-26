import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import EventCard from '../components/events/EventCard';
import Spinner from '../components/utils/Spinner';

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // --- THE FIX STARTS HERE ---
        let isMounted = true; // Flag to check if the component is still mounted

        const fetchEvents = async () => {
            setLoading(true); // Set loading to true when a fetch starts
            try {
                const { data } = await api.get(`/events?page=${page}`);
                if (isMounted) { // Only update state if the component is still mounted
                    // When loading more, append. When it's the first page, replace.
                    if (page === 1) {
                        setEvents(data.events);
                    } else {
                        setEvents(prevEvents => [...prevEvents, ...data.events]);
                    }
                    setPages(data.pages);
                }
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        // This is the cleanup function. It runs when the component unmounts.
        return () => {
            isMounted = false;
        };
        // --- THE FIX ENDS HERE ---
    }, [page]); // This dependency array is correct.

    const loadMoreHandler = () => {
        if (page < pages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    // The JSX part is mostly correct, but we can refine the loading state
    return (
        <div>
            <h1 className="text-4xl font-bold text-center mb-8">Upcoming Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <EventCard key={event._id} event={event} />
                ))}
            </div>

            {/* Show spinner when fetching more pages */}
            {loading && <Spinner />}

            {/* Show "Load More" button if not loading and more pages exist */}
            {!loading && page < pages && (
                <div className="text-center mt-8">
                    <button onClick={loadMoreHandler} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;