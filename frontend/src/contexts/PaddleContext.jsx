import { createContext, useState, useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import api from '../api/axiosConfig';

// Create a Context to hold the initialized Paddle instance
const PaddleContext = createContext(null);
// Create a custom hook for easy access to the Paddle instance


// Create the Provider component that will wrap our application
export const PaddleProvider = ({ children }) => {
    // This state will hold the initialized Paddle instance or null
    const [paddle, setPaddle] = useState(null);

    useEffect(() => {
        // We only want to run this initialization once.
        const initPaddle = async () => {
            try {
                // Fetch our public config (Client Token and Env) from our backend.
                // This is more secure than exposing it in the frontend code.
                const { data: config } = await api.get('/config');

                // initializePaddle is an async function from the @paddle/paddle-js package.
                const paddleInstance = await initializePaddle({
                    // The environment token is crucial for the library to know
                    // whether to run in sandbox or live mode.
                    environment: config.paddleEnv, // "sandbox" or "production"
                    // The Client-side Token is used to authorize the frontend SDK.
                    // Get this from your Paddle Dashboard > Developer Tools > Authentication.
                    token: config.paddleClientToken,
                });

                // Store the initialized instance in our state.
                setPaddle(paddleInstance);
                console.log('[PADDLE BILLING] SDK Initialized Successfully.');

            } catch (error) {
                console.error('Failed to initialize Paddle Billing SDK:', error);
                // Handle the error, maybe show a banner to the user
                // that checkout is unavailable.
            }
        };

        initPaddle();

    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        // Provide the initialized paddle instance to all children components.
        <PaddleContext.Provider value={paddle}>
            {children}
        </PaddleContext.Provider>
    );
};

export default PaddleContext