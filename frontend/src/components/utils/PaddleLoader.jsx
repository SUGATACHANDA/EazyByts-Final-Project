import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export const PaddleLoader = () => {
    const [isPaddleLoaded, setIsPaddleLoaded] = useState(!!window.Paddle);

    useEffect(() => {

        const initializePaddle = async () => {

            if (!window.Paddle) {

                setTimeout(initializePaddle, 100);
                return;
            }

            try {

                const { data } = await api.get('/config');


                if (data.paddleEnv === 'sandbox') {
                    window.Paddle.Environment.set('sandbox');
                    console.log('[PADDLE] Sandbox mode enabled.');
                }


                window.Paddle.Setup({ vendor: data.paddleVendorId });
                console.log('[PADDLE] Setup complete.');


                setIsPaddleLoaded(true);
            } catch (err) {
                console.error('Failed to initialize Paddle:', err);

            }
        };


        if (!isPaddleLoaded) {
            initializePaddle();
        }

    }, [isPaddleLoaded]);


    return null;
};