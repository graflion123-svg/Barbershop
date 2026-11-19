import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';

// Customer Pages
import { Home } from './pages/Home';
import { BookingPage } from './pages/BookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ServicesPage } from './pages/ServicesPage';
import { BarbersPage } from './pages/BarbersPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminBarbers } from './pages/admin/AdminBarbers';
import { AdminSchedule } from './pages/admin/AdminSchedule';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminSettings } from './pages/admin/AdminSettings';

// Public Layout Wrapper with Navbar & Footer
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </div>
      <Footer />
      <CustomerAuthModal />
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/barbers" element={<BarbersPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="barbers" element={<AdminBarbers />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
