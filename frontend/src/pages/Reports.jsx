import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [financialData, setFinancialData] = useState({
    totalSales: 0,
    labourExpense: 0,
    medicineExpense: 0,
    otherExpenses: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  const [salesTrend, setSalesTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [profitTrend, setProfitTrend] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  
  const [dateFilter, setDateFilter] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();

    switch (dateFilter) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          return { start: customDateRange.start, end: customDateRange.end };
        }
        return {};
      default:
        return {};
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const [financial, sales, expenses, profit, breakdown] = await Promise.all([
        api.get(`/reports/financial?${params}`),
        api.get(`/reports/sales-trend?${params}`),
        api.get(`/reports/expense-trend?${params}`),
        api.get(`/reports/profit-trend?${params}`),
        api.get(`/reports/expense-breakdown?${params}`)
      ]);

      setFinancialData(financial.data);
      setSalesTrend(sales.data);
      setExpenseTrend(expenses.data);
      setProfitTrend(profit.data);
      setExpenseBreakdown(breakdown.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setDateFilter(newFilter);
  };

  const handleCustomDateChange = () => {
    fetchReportData();
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `Business_Report_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const downloadExcel = () => {
    const ws = document.createElement('table');
    ws.innerHTML = `
      <tr><th colspan="2"><h2>Financial Report - ${new Date().toLocaleDateString()}</h2></th></tr>
      <tr><td>Total Sales</td><td>₹${financialData.totalSales.toLocaleString()}</td></tr>
      <tr><td>Labour Expense</td><td>₹${financialData.labourExpense.toLocaleString()}</td></tr>
      <tr><td>Medicine Expense</td><td>₹${financialData.medicineExpense.toLocaleString()}</td></tr>
      <tr><td>Other Expenses</td><td>₹${financialData.otherExpenses.toLocaleString()}</td></tr>
      <tr><td>Total Expenses</td><td>₹${financialData.totalExpenses.toLocaleString()}</td></tr>
      <tr><td><strong>Net Profit</strong></td><td><strong>₹${financialData.netProfit.toLocaleString()}</strong></td></tr>
    `;

    const wb = XLSX.utils.table_to_book(ws, { sheet: 'Report' });
    XLSX.writeFile(wb, `Business_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const printReport = () => {
    const element = document.getElementById('report-content');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p>Loading report data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-6 max-w-7xl mx-auto" id="report-content">
        <div className="mb-6 grid gap-6 xl:grid-cols-[1.8fr_0.95fr]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Financial Reports</h1>
            <p className="text-gray-600 max-w-2xl">
              Review your business performance with clear metrics, trend summaries, and export-ready reports.
              Use the filters below to narrow the view and keep every report up to date.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-3">Report snapshot</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-sm font-semibold">
                  {dateFilter === 'today'
                    ? 'Today'
                    : dateFilter === 'week'
                    ? 'This Week'
                    : dateFilter === 'month'
                    ? 'This Month'
                    : 'Custom Range'}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${financialData.netProfit >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  Net Profit {financialData.netProfit >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-3">Quick actions</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={downloadPDF}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
                >
                  📄 Download XLSX
                </button>
                <button
                  onClick={printReport}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition"
                >
                  🖨️ Print Report
                </button>
                <button
                  onClick={fetchReportData}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleFilterChange('today')}
              className={`px-4 py-2 rounded-full transition ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('week')}
              className={`px-4 py-2 rounded-full transition ${
                dateFilter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`px-4 py-2 rounded-full transition ${
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handleFilterChange('custom')}
              className={`px-4 py-2 rounded-full transition ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Custom
            </button>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleCustomDateChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-700">Total Sales</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">₹{financialData.totalSales.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-700">Labour Expense</span>
              <span className="text-xl">👷</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">₹{financialData.labourExpense.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-red-700">Medicine Expense</span>
              <span className="text-xl">💊</span>
            </div>
            <p className="text-3xl font-bold text-red-600">₹{financialData.medicineExpense.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-yellow-700">Other Expenses</span>
              <span className="text-xl">📍</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">₹{financialData.otherExpenses.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-pink-200 bg-pink-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-pink-700">Total Expenses</span>
              <span className="text-xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-pink-600">₹{financialData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`${financialData.netProfit >= 0 ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'} rounded-3xl border p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Net Profit</span>
              <span className="text-xl">✨</span>
            </div>
            <p className={`text-3xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{financialData.netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            📥 Download PDF
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📄 Download XLSX
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            🖨️ Print Report
          </button>
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Financial Breakdown Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-900 font-semibold">Sales</td>
                <td className="px-4 py-3 text-right text-blue-600 font-semibold">₹{financialData.totalSales.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-900">Labour Expense</td>
                <td className="px-4 py-3 text-right text-orange-600">-₹{financialData.labourExpense.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-900">Medicine Expense</td>
                <td className="px-4 py-3 text-right text-red-600">-₹{financialData.medicineExpense.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-900">Other Expense</td>
                <td className="px-4 py-3 text-right text-yellow-600">-₹{financialData.otherExpenses.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-semibold">Total Expenses</td>
                <td className="px-4 py-3 text-right text-pink-600 font-semibold">-₹{financialData.totalExpenses.toLocaleString()}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-gray-900 font-bold">Net Profit</td>
                <td className={`px-4 py-3 text-right font-bold text-lg ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{financialData.netProfit.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expense Breakdown */}
        {expenseBreakdown.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown by Type</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((expense, idx) => {
                  const percentage = financialData.totalExpenses > 0 
                    ? ((expense.amount / financialData.totalExpenses) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{expense.type}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{expense.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Chart Data (Text representation for PDF) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <div className="space-y-2 text-sm">
              {salesTrend.slice(0, 7).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{item.date}</span>
                  <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Trend</h3>
            <div className="space-y-2 text-sm">
              {expenseTrend.slice(0, 7).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{item.date}</span>
                  <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
