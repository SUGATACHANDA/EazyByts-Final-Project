import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';
import MyBookingsPage from './pages/MyBookingPage';
import { PaddleProvider } from './contexts/PaddleContext';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <PaddleProvider>


                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>

                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/event/:id" element={<EventDetailsPage />} />
                                <Route path="/payment-success" element={<PrivateRoute><PaymentSuccessPage /></PrivateRoute>} />


                                <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />


                                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />


                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </PaddleProvider>
            </AuthProvider>
        </Router>
    );
}
export default App;