import { useState, useEffect } from 'react';

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsVisible(true);
      console.log('[PWA] Install prompt available');
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallPrompt(null);
      console.log('[PWA] App installed');
      
      // Show success message
      if (window.confirm('Application installed successfully! You can now access it from your home screen.')) {
        // User acknowledged
      }
    };

    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isStandalone);
      setIsVisible(!isStandalone);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      console.log('[PWA] Install prompt not available');
      return;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setInstallPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('[PWA] Installation prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-40 animate-slide-up border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">📱 Install App</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install our app for quick access and offline support.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
            >
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 ml-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
