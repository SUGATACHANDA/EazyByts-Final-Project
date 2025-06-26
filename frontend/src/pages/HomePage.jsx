import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import EventCard from '../components/events/EventCard';
import Spinner from '../components/utils/Spinner';

const HomePage = () => {
    // State to hold the array of events displayed on the page.
    const [events, setEvents] = useState([]);
    // State to track the current page number for API requests, starting at 1.
    const [page, setPage] = useState(1);
    // State to store the total number of pages available from the API.
    const [pages, setPages] = useState(0);
    // State to manage the loading indicator. True on initial load.
    const [loading, setLoading] = useState(true);
    // State to hold any potential error messages from the API.
    const [error, setError] = useState('');

    // This effect hook is the core of the component's data fetching logic.
    // It runs automatically whenever the `page` state variable changes.
    useEffect(() => {
        const fetchEvents = async () => {
            // Set loading to true whenever we start a new fetch operation.
            setLoading(true);

            try {
                // Make the API call to our dedicated public endpoint.
                const { data } = await api.get(`/events?page=${page}`);

                // --- This logic is crucial for correct pagination ---
                // If it's the first page, we replace the state entirely to prevent duplicates.
                // For any other page, we append the newly fetched events to the existing list.
                if (page === 1) {
                    setEvents(data.events);
                } else {
                    setEvents(prevEvents => [...prevEvents, ...data.events]);
                }

                // Update the total number of pages from the API response.
                setPages(data.pages);
                setError(''); // Clear any previous errors on a successful fetch.
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Could not load events. Please try refreshing the page.');
            } finally {
                // This block runs whether the try or catch block was executed.
                // We always want to stop the loading indicator.
                setLoading(false);
            }
        };

        fetchEvents();

    }, [page]); // The dependency array ensures this effect only re-runs when `page` changes.

    // This handler increments the page number to trigger the useEffect hook again.
    const loadMoreHandler = () => {
        // Guard clause to prevent fetching if already loading or if on the last page.
        if (!loading && page < pages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    // Main render logic:

    // 1. Show a full-page spinner ONLY on the very first load.
    if (loading && page === 1) {
        return <Spinner />;
    }

    // 2. If an error occurred, show the error message.
    if (error) {
        return <p className="text-center text-red-600 py-10">{error}</p>
    }

    // 3. Otherwise, render the main content.
    return (
        <div>
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">Upcoming Events</h1>
            <p className="text-center text-gray-500 mb-12">Discover your next experience</p>

            {events.length > 0 ? (
                // If we have events, map over them and render an EventCard for each.
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            ) : (
                // If the events array is empty after loading, show a friendly message.
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">No upcoming events found.</p>
                    <p className="text-gray-400 mt-2">Check back soon for new events!</p>
                </div>
            )}

            {/* "Load More" Button Section */}
            <div className="text-center mt-12">
                {/* Only show the button if the current page is less than the total number of pages. */}
                {page < pages && (
                    <button
                        onClick={loadMoreHandler}
                        disabled={loading} // Disable the button while fetching more data.
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HomePage;