import { useContext } from 'react';
import PaddleContext from '../contexts/PaddleContext';

export const usePaddle = () => {
    return useContext(PaddleContext);
};