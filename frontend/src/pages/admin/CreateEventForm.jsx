import { useState } from "react";
import api from "../../api/axiosConfig";

const CreateEventForm = ({ onEventCreated }) => {
    // Initial state for form fields
    const initialState = {
        name: "",
        description: "",
        date: "",
        location: "",
        price: "",
        totalTickets: "",
    };
    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Handler for text input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handler for file input change
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            setMessage("Please select an image file to upload.");
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage("");
        setIsError(false);

        try {
            // STEP 1: Get Cloudinary signature from our backend
            const { data: signData } = await api.get("/events/cloudinary-signature");

            // STEP 2: Prepare form data for direct upload to Cloudinary
            const cloudFormData = new FormData();
            cloudFormData.append("file", imageFile);
            cloudFormData.append("api_key", signData.apiKey);
            cloudFormData.append("timestamp", signData.timestamp);
            cloudFormData.append("signature", signData.signature);
            cloudFormData.append("folder", "eventive_events"); // Optional: specify a folder in Cloudinary

            // STEP 3: Make the POST request directly to Cloudinary
            const cloudResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
                {
                    method: "POST",
                    body: cloudFormData,
                }
            );

            if (!cloudResponse.ok) {
                throw new Error("Image upload to Cloudinary failed.");
            }
            const cloudData = await cloudResponse.json();

            // STEP 4: Prepare the final event data for our backend
            const eventData = {
                ...formData,
                price: parseFloat(formData.price), // Ensure numbers are sent correctly
                totalTickets: parseInt(formData.totalTickets),
                imageUrl: cloudData.secure_url, // The URL of the uploaded image
                cloudinaryId: cloudData.public_id, // The ID to use for deleting the image later
            };

            // STEP 5: Make the POST request to our server to create the event
            await api.post("/events", eventData);

            setMessage("Event created successfully!");
            setIsError(false);

            // Refresh the event list in the parent component
            if (onEventCreated) onEventCreated();

            // Reset form to its initial state
            setFormData(initialState);
            setImageFile(null);
            e.target.reset(); // This is important to clear the file input field visually
        } catch (error) {
            console.error("Event creation failed:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Error creating event. Please check the console and try again.";
            setMessage(errorMessage);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-4">
                Create New Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form Group for Event Name */}
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

                {/* Form Group for Description */}
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
                        rows="3"
                        className="input-field mt-1"
                    ></textarea>
                </div>

                {/* Grid for Date and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="e.g., Online"
                        />
                    </div>
                </div>

                {/* Grid for Price and Tickets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Price (USD)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="input-field mt-1"
                            placeholder="e.g., 25.00"
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
                            className="input-field mt-1"
                            placeholder="e.g., 100"
                        />
                    </div>
                </div>

                {/* File Input */}
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
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            "Create Event"
                        )}
                    </button>
                </div>

                {/* Feedback Message */}
                {message && (
                    <p
                        className={`mt-4 text-center text-sm p-3 rounded ${isError
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default CreateEventForm;
