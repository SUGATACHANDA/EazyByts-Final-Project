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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;