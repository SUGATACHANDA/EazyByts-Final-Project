import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useMemo } from 'react';

const CreateEventForm = ({ eventToEdit, onSuccess, onCancelEdit }) => {
    const isEditMode = Boolean(eventToEdit);

    const initialState = useMemo(() => ({ name: '', description: '', date: '', location: '', price: '', totalTickets: '' }), []);
    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const formattedDate = eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '';
            setFormData({
                name: eventToEdit.name,
                description: eventToEdit.description,
                date: formattedDate,
                location: eventToEdit.location,
                price: eventToEdit.price,
                totalTickets: eventToEdit.totalTickets,
            });
        } else {
            setFormData(initialState);
        }
    }, [eventToEdit, initialState, isEditMode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setImageFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            if (isEditMode) {
                // UPDATE LOGIC
                const updateData = { name: formData.name, description: formData.description, date: formData.date, location: formData.location };
                await api.put(`/events/${eventToEdit._id}`, updateData);
                setMessage('Event updated successfully!');
            } else {
                // CREATE LOGIC
                if (!imageFile) throw new Error('Please select an image file.');
                const { data: signData } = await api.get('/events/cloudinary-signature');
                const cloudFormData = new FormData();
                cloudFormData.append('file', imageFile);
                cloudFormData.append('api_key', signData.apiKey);
                cloudFormData.append('timestamp', signData.timestamp);
                cloudFormData.append('signature', signData.signature);
                cloudFormData.append('folder', 'eventive_events');

                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, { method: 'POST', body: cloudFormData });
                if (!cloudRes.ok) throw new Error('Image upload failed.');
                const cloudData = await cloudRes.json();

                const eventData = { ...formData, imageUrl: cloudData.secure_url, cloudinaryId: cloudData.public_id };
                await api.post('/events', eventData);
                setMessage('Event created successfully!');
                e.target.reset(); // Clear file input on creation
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-5">
                <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
                {isEditMode && <button onClick={onCancelEdit} className="text-sm font-medium text-gray-600 hover:text-black">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="3" className="input-field mt-1"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="input-field mt-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (USD)</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="input-field mt-1 disabled:bg-gray-100" disabled={isEditMode} />
                    </div>
                    <div>
                        <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700">Total Tickets</label>
                        <input type="number" id="totalTickets" name="totalTickets" value={formData.totalTickets} onChange={handleChange} required min="1" className="input-field mt-1 disabled:bg-gray-100" disabled={isEditMode} />
                    </div>
                </div>
                {!isEditMode && (
                    <div>
                        <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Event Image</label>
                        <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                )}
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
                {message && <p className={`mt-4 text-center text-sm p-3 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}
            </form>
        </div>
    );
};
export default CreateEventForm;