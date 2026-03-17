import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Public Pages
import BusinessList from './pages/public/BusinessList';
import BusinessDetail from './pages/public/BusinessDetail';
import BookingFlow from './pages/public/BookingFlow';
import ConfirmationPage from './pages/public/ConfirmationPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminBlockages from './pages/admin/AdminBlockages';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';

// Superadmin Pages
import SuperadminDashboard from './pages/superadmin/SuperadminDashboard';
import AdministradoresPage from './pages/superadmin/AdministradoresPage';
import NegociosPage from './pages/superadmin/NegociosPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<BusinessList />} />
            <Route path="/:slug" element={<BusinessDetail />} />
            <Route path="/:slug/booking" element={<BookingFlow />} />
            <Route path="/:slug/confirm/:token" element={<ConfirmationPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute><AdminEmployees /></ProtectedRoute>} />
            <Route path="/admin/schedules" element={<ProtectedRoute><AdminSchedules /></ProtectedRoute>} />
            <Route path="/admin/blockages" element={<ProtectedRoute><AdminBlockages /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            
            {/* Superadmin Routes */}
            <Route path="/superadmin" element={<ProtectedRoute><SuperadminDashboard /></ProtectedRoute>} />
            <Route path="/superadmin/administradores" element={<ProtectedRoute><AdministradoresPage /></ProtectedRoute>} />
            <Route path="/superadmin/negocios" element={<ProtectedRoute><NegociosPage /></ProtectedRoute>} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
