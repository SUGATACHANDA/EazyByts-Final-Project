import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={closeMenu} className="text-2xl font-bold text-indigo-600">
                            🎟️ Eventive
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation Links (hidden on mobile) */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-500 mr-4">Hi, {user.name}!</span>
                                    <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                                    {user.isAdmin && (
                                        <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                                    )}
                                    <button onClick={handleLogout} className="btn-secondary">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="nav-link">Login</Link>
                                    <Link to="/register" className="btn-primary">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side: Hamburger Menu Button (visible only on mobile) */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Switch between hamburger and close icons */}
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Mobile Menu --- */}
            {/* 
              THE FIX: This is a more robust animation technique.
              We control visibility by animating `max-height`. It's hidden on desktop with `md:hidden`.
              The `overflow-hidden` is crucial for the max-height trick to work.
            */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'
                    }`}
                id="mobile-menu"
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {user ? (
                        <>
                            <Link to="/my-bookings" className="mobile-nav-link" onClick={closeMenu}>My Bookings</Link>
                            {user.isAdmin && (
                                <Link to="/admin" className="mobile-nav-link" onClick={closeMenu}>Admin Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="w-full text-left mobile-nav-link text-red-500 font-semibold">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="mobile-nav-link" onClick={closeMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;