import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            🎟️ Eventive
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-700">Hi, {user.name}!</span>
                                    <Link prefetch='render' to="/my-bookings" className="text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Bookings</Link>
                                    {user.isAdmin && (
                                        <Link to="/admin" className="text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Admin Dashboard</Link>
                                    )}
                                    <button onClick={handleLogout} className="btn-inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                    <Link to="/register" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Add mobile menu button if needed */}
                </div>
            </nav>
        </header>
    );
};

export default Header;