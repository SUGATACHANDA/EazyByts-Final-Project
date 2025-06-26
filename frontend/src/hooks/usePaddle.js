import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import PaddleContext from '../contexts/PaddleContext';

export const usePaddle = () => {
    return useContext(PaddleContext);
};