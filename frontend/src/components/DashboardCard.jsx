const DashboardCard = ({ title, amount, icon, color = 'blue', loading = false }) => {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  return (
    <div className={`border-2 rounded-lg p-4 sm:p-6 ${colorStyles[color]}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 truncate">{title}</p>
          {loading ? (
            <div className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-xl sm:text-3xl font-bold truncate">₹{amount?.toFixed(2) || '0.00'}</p>
          )}
        </div>
        <div className="text-2xl sm:text-4xl ml-2 flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
