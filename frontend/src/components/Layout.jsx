import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar - Fixed positioning with smooth transition */}
        <div 
          className={`fixed md:static left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile overlay with smooth fade */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-in-out"
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Main content area - Responsive scrolling */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
          <div className="w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
