import { useAuth } from '../../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../utils/Spinner';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Spinner />;

    return user && user.isAdmin ? (
        children
    ) : (
        <Navigate to="/" state={{ from: location }} replace />
    );
};

export default AdminRoute;