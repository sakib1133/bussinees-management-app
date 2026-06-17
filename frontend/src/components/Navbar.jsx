import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
              Village Khata Manager
            </h1>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-xs sm:text-sm text-gray-700">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-gray-500 truncate text-xs">{user?.email}</p>
            </div>
            <div className="sm:hidden text-xs text-gray-700 font-semibold truncate">
              {user?.name}
            </div>

            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-xs sm:text-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
