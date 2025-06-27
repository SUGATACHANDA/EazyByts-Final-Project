import { createContext, useState, useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import api from '../api/axiosConfig';


const PaddleContext = createContext(null);




export const PaddleProvider = ({ children }) => {

    const [paddle, setPaddle] = useState(null);

    useEffect(() => {

        const initPaddle = async () => {
            try {
                const { data: config } = await api.get('/config');
                const paddleInstance = await initializePaddle({

                    environment: config.paddleEnv,
                    token: config.paddleClientToken,
                });


                setPaddle(paddleInstance);
                console.log('[PADDLE BILLING] SDK Initialized Successfully.');

            } catch (error) {
                console.error('Failed to initialize Paddle Billing SDK:', error);

            }
        };

        initPaddle();

    }, []);

    return (
        <PaddleContext.Provider value={paddle}>
            {children}
        </PaddleContext.Provider>
    );
};

export default PaddleContext