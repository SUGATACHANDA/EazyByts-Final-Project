import { useAuth } from '../../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../utils/Spinner';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Spinner />;
    }

    return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;