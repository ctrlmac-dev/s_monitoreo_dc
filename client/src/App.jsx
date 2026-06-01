import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GabinetesPage from './pages/GabinetesPage';
import UpsPage from './pages/UpsPage';
import UpsCcPage from './pages/UpsCcPage';
import RefrigeracionPage from './pages/RefrigeracionPage';
import PduDcPage from './pages/PduDcPage';
import PduCcPage from './pages/PduCcPage';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import DeviceManagement from './pages/DeviceManagement';

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const role = sessionStorage.getItem('role');
  if (role !== 'administrador') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = React.useCallback(function() {
    setSidebarCollapsed(function(prev) { return !prev; });
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="app-container">
            <Sidebar collapsed={sidebarCollapsed} />
            <main className={'main-content' + (sidebarCollapsed ? ' expanded' : '')}>
              <Header collapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/gabinetes" element={<GabinetesPage />} />
                <Route path="/ups" element={<UpsPage />} />
                <Route path="/ups-cc" element={<UpsCcPage />} />
                <Route path="/refrigeracion" element={<RefrigeracionPage />} />
                <Route path="/pdus-dc" element={<PduDcPage />} />
                <Route path="/pdus-cc" element={<PduCcPage />} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/devices" element={<AdminRoute><DeviceManagement /></AdminRoute>} />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
