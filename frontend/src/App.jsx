import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import InstallAppButton from './components/InstallAppButton';
import UpdateNotification from './components/UpdateNotification';
import OfflineBanner from './components/OfflineBanner';
import AppLoader from './components/AppLoader';
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

function App() {
  const [versionUpdateAvailable, setVersionUpdateAvailable] = useState(false);

  useEffect(() => {
    const setViewportHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    // Only installed PWA users should see updates.
    // If not installed, do not even check version.json to avoid any UI/event noise.
    // If not installed, do not even check version.json.
    const installed =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (!installed) return;

    const checkDeployedVersion = async () => {
      try {
        // version.json is the single source of truth for “a newer deployment exists”
        const response = await fetch('/version.json', { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        const deployedVersion = String(data.version || '');
        if (!deployedVersion) return;


        // Prevent repeated popup: only show when deployed version is newer than last acknowledged.
        const lastAcknowledged = localStorage.getItem('pwa_last_ack_version');
        const shouldShow = lastAcknowledged !== deployedVersion;

        if (shouldShow) setVersionUpdateAvailable(true);

        // Mark that we already evaluated the current deployed version.
        // This avoids showing twice on rapid rerenders.
        localStorage.setItem('pwa_checked_version', deployedVersion);
      } catch (error) {
        console.warn('[PWA] Version check failed:', error);
      }
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    checkDeployedVersion();

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);


  return (
    <>
      <AppLoader />
      <Router>
        <AuthProvider>
          <OfflineBanner />
          <UpdateNotification versionUpdateAvailable={versionUpdateAvailable} />
          <InstallAppButton />
          
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
    </>
  );
}

export default App;
