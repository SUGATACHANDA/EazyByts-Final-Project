import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export const PaddleLoader = () => {
    const [isPaddleLoaded, setIsPaddleLoaded] = useState(!!window.Paddle);

    useEffect(() => {
        // This function will initialize Paddle
        const initializePaddle = async () => {
            // Wait until the Paddle script is loaded onto the window object
            if (!window.Paddle) {
                // If Paddle.js is not available, check again after a short delay
                // This is a fallback for slow network conditions.
                setTimeout(initializePaddle, 100);
                return;
            }

            try {
                // 1. Fetch our public configuration from our own backend
                const { data } = await api.get('/config');

                // 2. Configure Paddle Environment (Sandbox or Live)
                if (data.paddleEnv === 'sandbox') {
                    window.Paddle.Environment.set('sandbox');
                    console.log('[PADDLE] Sandbox mode enabled.');
                }

                // 3. Initialize Paddle with our Vendor ID
                window.Paddle.Setup({ vendor: data.paddleVendorId });
                console.log('[PADDLE] Setup complete.');

                // 4. Set our state to indicate everything is ready
                setIsPaddleLoaded(true);
            } catch (err) {
                console.error('Failed to initialize Paddle:', err);
                // Optionally, you could set an error state here to show a banner in your app
            }
        };

        // Don't re-initialize if it's already done
        if (!isPaddleLoaded) {
            initializePaddle();
        }

    }, [isPaddleLoaded]); // Re-run effect if the loaded state changes

    // This component does not render anything to the DOM
    return null;
};