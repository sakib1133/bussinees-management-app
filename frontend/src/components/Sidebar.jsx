import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Sales', path: '/sales', icon: '💰' },
    { name: 'Labour', path: '/labour', icon: '👷' },
    { name: 'Medicine', path: '/medicine', icon: '💊' },
    { name: 'Expenses', path: '/expenses', icon: '📋' },
    { name: 'Reports', path: '/reports', icon: '📈' }
  ];

  return (
    <div className="w-64 h-full bg-gray-900 text-white p-3 sm:p-4 overflow-y-auto">
      <div className="mb-6 sm:mb-8 flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-bold text-blue-400">Navigation</h2>
        <button
          onClick={onClose}
          className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-1 sm:space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition duration-200 text-sm sm:text-base ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
