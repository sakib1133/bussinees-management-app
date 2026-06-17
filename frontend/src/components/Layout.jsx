import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`fixed md:static left-0 top-16 z-40 h-screen transition-all duration-300 ${
            sidebarOpen ? 'w-64' : '-translate-x-full md:translate-x-0 w-64'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
