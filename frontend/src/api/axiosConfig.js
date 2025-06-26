import axios from 'axios';

// Create a new Axios instance. This is our "backend API client".
const api = axios.create({
    // --- THIS IS THE LINE TO FIX ---
    // Change the port from 5000 to 5001.
    // Also, it's best practice to include the `/api` prefix here.
    baseURL: import.meta.env.VITE_APP_API_URL,
});

// The rest of the file is correct and remains the same...
api.interceptors.request.use(
    (config) => {
        // 1. Get the user info string from local storage.
        const userInfoString = localStorage.getItem('userInfo');

        if (userInfoString) {
            // 2. If it exists, parse it from a JSON string back into an object.
            const userInfo = JSON.parse(userInfoString);

            // 3. Check if the parsed object and the token within it exist.
            if (userInfo && userInfo.token) {
                // 4. If everything is valid, set the Authorization header.
                // The format 'Bearer <token>' is crucial.
                config.headers.Authorization = `Bearer ${userInfo.token}`;
            }
        }
        // 5. Always return the config object for the request to proceed.
        return config;
    },
    (error) => {
        // Handle any errors that occur during the request setup.
        return Promise.reject(error);
    }
);

export default api;