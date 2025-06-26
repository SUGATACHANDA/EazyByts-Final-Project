import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { useMemo } from "react";

const CreateEventForm = ({ eventToEdit, onSuccess, onCancelEdit }) => {
    // Determine if we are in 'edit' mode based on whether the 'eventToEdit' prop is passed.
    const isEditMode = Boolean(eventToEdit);

    // Define the initial state for a blank form.
    const initialState = useMemo(
        () => ({
            name: "",
            description: "",
            date: "",
            location: "",
            price: "",
            totalTickets: "",
        }),
        []
    );

    // State hooks for managing form data, image file, and UI feedback.
    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // This effect populates the form with existing data when an admin clicks "Edit".
    useEffect(() => {
        if (isEditMode) {
            // Format the date to 'YYYY-MM-DD' as required by the <input type="date"> field.
            const formattedDate = eventToEdit.date
                ? new Date(eventToEdit.date).toISOString().split("T")[0]
                : "";
            setFormData({
                name: eventToEdit.name,
                description: eventToEdit.description,
                date: formattedDate,
                location: eventToEdit.location,
                price: eventToEdit.price,
                totalTickets: eventToEdit.totalTickets,
            });
        } else {
            // Reset the form if we are not in edit mode (e.g., after an edit is cancelled).
            setFormData(initialState);
        }
    }, [eventToEdit, initialState, isEditMode]);

    // Generic handler for all text-based input fields.
    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handler for the file input.
    const handleFileChange = (e) => setImageFile(e.target.files[0]);

    // The main function to handle form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- CLIENT-SIDE VALIDATION ---
        const price = parseFloat(formData.price);
        const tickets = parseInt(formData.totalTickets, 10);

        if (!Number.isInteger(price) || price < 0) {
            setMessage(
                "Price must be a whole number (e.g., 50) and cannot be negative."
            );
            setIsError(true);
            return; // Stop the submission if validation fails.
        }

        if (!Number.isInteger(tickets) || tickets < 1) {
            setMessage("Total Tickets must be a whole number and at least 1.");
            setIsError(true);
            return; // Stop the submission if validation fails.
        }

        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            if (isEditMode) {
                // --- UPDATE LOGIC ---
                const updateData = {
                    name: formData.name,
                    description: formData.description,
                    date: formData.date,
                    location: formData.location,
                    price, // Use the validated whole number
                    totalTickets: tickets, // Use the validated whole number
                };
                await api.put(`/events/${eventToEdit._id}`, updateData);
                setMessage("Event updated successfully!");
            } else {
                // --- CREATE LOGIC ---
                if (!imageFile) throw new Error("Please select an event image.");

                // 1. Get a secure signature from our backend for the Cloudinary upload.
                const { data: signData } = await api.get(
                    "/events/cloudinary-signature"
                );
                const cloudFormData = new FormData();
                cloudFormData.append("file", imageFile);
                cloudFormData.append("folder", signData.folder);
                cloudFormData.append("api_key", signData.apiKey);
                cloudFormData.append("timestamp", signData.timestamp);
                cloudFormData.append("signature", signData.signature);

                // 2. Upload image directly to Cloudinary.
                const cloudRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
                    { method: "POST", body: cloudFormData }
                );
                if (!cloudRes.ok) {
                    const errorData = await cloudRes.json();
                    throw new Error(`Image upload failed: ${errorData.error.message}`);
                }
                const cloudData = await cloudRes.json();

                // 3. Prepare the final event data for our own backend.
                const eventData = {
                    ...formData,
                    price,
                    totalTickets: tickets,
                    imageUrl: cloudData.secure_url,
                    cloudinaryId: cloudData.public_id,
                };

                // 4. Make the API call to create the event.
                await api.post("/events", eventData);
                setMessage("Event created successfully!");
                e.target.reset(); // Clear the file input visually after success.
            }
            if (onSuccess) onSuccess(); // Notify the parent component of the success.
        } catch (error) {
            setIsError(true);
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            {/* Form Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Edit Event" : "Create New Event"}
                </h2>
                {isEditMode && (
                    <button
                        onClick={onCancelEdit}
                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Event Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field mt-1"
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="input-field mt-1"
                    ></textarea>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="date"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="input-field mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="input-field mt-1"
                        />
                    </div>
                </div>

                {/* Price & Total Tickets with validation attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Price (Whole USD)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="1"
                            placeholder="e.g., 50"
                            className="input-field no-arrows mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="totalTickets"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Total Tickets
                        </label>
                        <input
                            type="number"
                            id="totalTickets"
                            name="totalTickets"
                            value={formData.totalTickets}
                            onChange={handleChange}
                            required
                            min="1"
                            step="1"
                            placeholder="e.g., 100"
                            className="input-field no-arrows mt-1"
                        />
                    </div>
                </div>

                {/* Image Upload - Only shown in create mode */}
                {!isEditMode && (
                    <div>
                        <label
                            htmlFor="imageFile"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Event Image
                        </label>
                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            onChange={handleFileChange}
                            required
                            accept="image/png, image/jpeg, image/webp"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Saving..."
                            : isEditMode
                                ? "Update Event"
                                : "Create Event"}
                    </button>
                </div>

                {/* Message Display Area */}
                {message && (
                    <div
                        className={`mt-4 text-center text-sm p-3 rounded-md ${isError
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateEventForm;
