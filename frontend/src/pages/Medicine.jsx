import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const quickFilters = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Cost First' },
  { value: 'lowest', label: 'Lowest Cost First' }
];

const Medicine = () => {
  const [summary, setSummary] = useState({
    totalMedicineExpense: 0,
    totalPurchases: 0,
    todaysExpense: 0,
    thisMonthExpense: 0
  });
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [formData, setFormData] = useState({
    medicineName: '',
    amount: '',
    purchaseDate: '',
    purchasedBy: '',
    quantity: '',
    notes: ''
  });
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSummary();
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (quickFilter) {
      setStartDate('');
      setEndDate('');
    }
    fetchMedicines();
  }, [search, quickFilter, sort, startDate, endDate]);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await api.get('/medicines/summary');
      if (response.data.success) {
        setSummary(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load medicine summary');
      console.error('Medicine summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (quickFilter) params.append('quickFilter', quickFilter);
    if (sort) params.append('sort', sort);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return params.toString();
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const query = buildQuery();
      const response = await api.get(`/medicines${query ? `?${query}` : ''}`);
      if (response.data.success) {
        setMedicines(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load medicines');
      console.error('Fetch medicines error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      medicineName: '',
      amount: '',
      purchaseDate: '',
      purchasedBy: '',
      quantity: '',
      notes: ''
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.medicineName.trim() || formData.medicineName.trim().length < 2) {
      return 'Medicine name is required and must be at least 2 characters.';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      return 'Cost is required and must be greater than 0.';
    }
    if (!formData.purchaseDate) {
      return 'Purchase date is required.';
    }
    if (!formData.purchasedBy.trim()) {
      return 'Purchased by is required.';
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        medicineName: formData.medicineName.trim(),
        amount: Number(formData.amount),
        purchaseDate: formData.purchaseDate,
        purchasedBy: formData.purchasedBy.trim(),
        quantity: formData.quantity.trim() || null,
        notes: formData.notes.trim() || null
      };

      const response = editingId
        ? await api.put(`/medicines/${editingId}`, payload)
        : await api.post('/medicines', payload);

      if (response.data.success) {
        resetForm();
        fetchMedicines();
        fetchSummary();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save medicine');
      console.error('Save medicine error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/medicines/${id}`);
      if (response.data.success) {
        const medicine = response.data.data;
        setEditingId(medicine.id);
        setFormData({
          medicineName: medicine.medicineName,
          amount: medicine.amount.toString(),
          purchaseDate: medicine.purchaseDate.split('T')[0],
          purchasedBy: medicine.purchasedBy,
          quantity: medicine.quantity || '',
          notes: medicine.notes || ''
        });
      }
    } catch (err) {
      setError('Failed to load medicine details for edit');
      console.error('Edit medicine error:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/medicines/${deleteTarget}`);
      setDeleteTarget(null);
      fetchMedicines();
      fetchSummary();
    } catch (err) {
      setError('Failed to delete medicine');
      console.error('Delete medicine error:', err);
    }
  };

  const handleView = (id) => {
    setDetailsTarget(id);
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN');
  };

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Medicine Management</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage medicine purchases and expenses.</p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
            >
              Reset Form
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <SummaryCard label="Total Medicine Expense" value={summary.totalMedicineExpense} loading={summaryLoading} />
            <SummaryCard label="Total Purchases" value={summary.totalPurchases} loading={summaryLoading} />
            <SummaryCard label="Today's Expense" value={summary.todaysExpense} loading={summaryLoading} />
            <SummaryCard label="This Month Expense" value={summary.thisMonthExpense} loading={summaryLoading} />
          </div>

          {/* Add Medicine Form */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Add Medicine</h3>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    placeholder="Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Cost (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    placeholder="500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Purchased By</label>
                  <input
                    type="text"
                    name="purchasedBy"
                    value={formData.purchasedBy}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    placeholder="Ramesh"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    placeholder="e.g., 10 boxes"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    placeholder="Any notes"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm sm:text-base font-medium"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base font-medium"
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </section>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                  placeholder="Search by medicine name..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Quick Filter</label>
                  <select
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                  >
                    <option value="">All Time</option>
                    {quickFilters.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!quickFilter && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medicines Table */}
          <section className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : medicines.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-gray-600 text-sm sm:text-base">No medicines found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">By</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Qty</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Notes</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Created</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine) => (
                      <tr key={medicine.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">{medicine.id}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 truncate">{medicine.medicineName}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold">₹{medicine.amount.toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap">{formatDate(medicine.purchaseDate)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 hidden sm:table-cell truncate">{medicine.purchasedBy}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 hidden md:table-cell">{medicine.quantity || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 hidden lg:table-cell truncate">{medicine.notes || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 hidden lg:table-cell text-xs whitespace-nowrap">{formatDate(medicine.createdAt)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex gap-1 sm:gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => handleView(medicine.id)}
                              className="rounded-lg bg-gray-200 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-gray-800 hover:bg-gray-300 transition"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(medicine.id)}
                              className="rounded-lg bg-blue-600 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(medicine.id)}
                              className="rounded-lg bg-red-600 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Delete Modal */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-w-md w-full rounded-lg bg-white p-4 sm:p-6 shadow-xl border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Are you sure you want to delete this medicine record?</p>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 rounded-lg bg-gray-300 px-4 py-2 sm:py-3 text-gray-800 hover:bg-gray-400 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 sm:py-3 text-white hover:bg-red-700 transition text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailsTarget && <MedicineDetails id={detailsTarget} onClose={() => setDetailsTarget(null)} />}
        </div>
      </div>
    </Layout>
  );
};

const SummaryCard = ({ label, value, loading }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition">
    <p className="text-xs sm:text-sm font-semibold text-gray-500">{label}</p>
    <p className="mt-2 sm:mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
      {loading ? 'Loading...' : typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : value}
    </p>
  </div>
);

const MedicineDetails = ({ id, onClose }) => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/medicines/${id}`);
        if (response.data.success) {
          setMedicine(response.data.data);
        }
      } catch (err) {
        setError('Failed to load medicine details');
        console.error('Medicine details error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN') : '-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full rounded-lg bg-white p-4 sm:p-6 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Medicine Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        ) : medicine ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Medicine Name</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{medicine.medicineName}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Amount</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">₹{medicine.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Purchase Date</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{formatDate(medicine.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Purchased By</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{medicine.purchasedBy}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Quantity</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{medicine.quantity || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Created</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{formatDate(medicine.createdAt)}</p>
              </div>
            </div>
            {medicine.notes && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Notes</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{medicine.notes}</p>
              </div>
            )}
            <div className="flex gap-2 sm:gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 sm:py-3 text-white hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Medicine;
