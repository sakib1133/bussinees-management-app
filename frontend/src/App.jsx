import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Medicine from './pages/Medicine';
import Labour from './pages/Labour';
import LabourDetails from './pages/LabourDetails';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

const APP_VERSION = '1.0.2'; // Update this when you make changes

function App() {
  useEffect(() => {
    // Check for app updates
    const storedVersion = localStorage.getItem('app_version');
    
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log(`App updated from ${storedVersion} to ${APP_VERSION}. Reloading...`);
      // Clear cache and reload
      localStorage.setItem('app_version', APP_VERSION);
      window.location.reload();
    } else if (!storedVersion) {
      // First time or cleared cache
      localStorage.setItem('app_version', APP_VERSION);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicine"
            element={
              <ProtectedRoute>
                <Medicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labour"
            element={
              <ProtectedRoute>
                <Labour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labour/:id"
            element={
              <ProtectedRoute>
                <LabourDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
