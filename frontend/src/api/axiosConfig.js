import axios from 'axios';


const api = axios.create({

    baseURL: import.meta.env.VITE_APP_API_URL,
});


api.interceptors.request.use(
    (config) => {

        const userInfoString = localStorage.getItem('userInfo');

        if (userInfoString) {

            const userInfo = JSON.parse(userInfoString);


            if (userInfo && userInfo.token) {

                config.headers.Authorization = `Bearer ${userInfo.token}`;
            }
        }
        return config;
    },
    (error) => {

        return Promise.reject(error);
    }
);

export default api;