import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/Loginscreen';
import AdminDashboard from './components/AdminLayout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);

  const handleLogin = (newToken) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute token={token}>
            <AdminDashboard token={token} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const PrivateRoute = ({ token, children }) => {
  return token ? children : <Navigate to="/login" replace />;
};

export default App;