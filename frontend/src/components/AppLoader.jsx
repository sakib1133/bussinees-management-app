import { useState, useEffect } from 'react';

export default function AppLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing application...');

  useEffect(() => {
    const messages = [
      'Initializing application...',
      'Loading service worker...',
      'Registering offline support...',
      'Setting up PWA features...',
      'Almost ready...'
    ];

    let currentMessageIndex = 0;
    const messageInterval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % messages.length;
      setLoadingMessage(messages[currentMessageIndex]);
    }, 1200);

    // Simulate app initialization completion
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(loadingTimer);
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo/App Icon */}
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Business Management System
          </h1>
          <p className="text-gray-600 text-sm">BMS</p>
        </div>

        {/* Loading Animation */}
        <div className="flex gap-2 my-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-1">{loadingMessage}</p>
          <p className="text-gray-500 text-xs">
            Preparing your application...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{
            animation: 'slideRight 2s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideRight {
          0% {
            width: 0;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
