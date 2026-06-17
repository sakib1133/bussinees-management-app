import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/summary');
      
      if (response.data.success) {
        setSummary(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Financial Summary</h2>
              <p className="text-gray-600 mt-1">Overview of your business finances</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
                <button
                  onClick={fetchDashboardSummary}
                  className="ml-4 underline font-semibold hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Income Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Income</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                  title="Total Sales"
                  amount={summary?.totalSales || 0}
                  icon="💰"
                  color="green"
                  loading={loading}
                />
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Expenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                  title="Labour Expense"
                  amount={summary?.totalLabourExpense || 0}
                  icon="👷"
                  color="orange"
                  loading={loading}
                />
                <DashboardCard
                  title="Medicine Expense"
                  amount={summary?.totalMedicineExpense || 0}
                  icon="💊"
                  color="red"
                  loading={loading}
                />
                <DashboardCard
                  title="Other Expenses"
                  amount={summary?.totalOtherExpenses || 0}
                  icon="📋"
                  color="purple"
                  loading={loading}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title="Total Expenses"
                amount={summary?.totalExpenses || 0}
                icon="📊"
                color="orange"
                loading={loading}
              />
              <DashboardCard
                title="Net Profit"
                amount={summary?.netProfit || 0}
                icon="📈"
                color={summary?.netProfit >= 0 ? 'green' : 'red'}
                loading={loading}
              />
            </div>

            {/* Refresh Button */}
            <div className="mt-8 text-center">
              <button
                onClick={fetchDashboardSummary}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
