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

const emptyForm = {
  medicineName: '',
  amount: '',
  purchaseDate: '',
  purchasedBy: '',
  quantity: '',
  notes: ''
};

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const openAddDrawer = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
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
        closeDrawer();
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
        setFormError('');
        setDrawerOpen(true);
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

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN');
  };

  const hasDateFilter = startDate || endDate;
  const activeFilterCount = [search, quickFilter, hasDateFilter ? 1 : null]
    .filter(Boolean).length;

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page Header ── */}
          <div className="flex flex-col gap-3 mb-6 sm:mb-8">
            {/* Title row + Add button */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Medicine Management</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage medicine purchases and expenses.</p>
              </div>
              <button
                type="button"
                onClick={openAddDrawer}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold shadow-sm flex-shrink-0"
              >
                <span className="text-lg leading-none">+</span>
                <span className="hidden sm:inline">Add Medicine</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* ── Search + Filter bar ── */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  placeholder="Search by medicine name..."
                />
              </div>

              {/* Quick Filter */}
              <select
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-[130px]"
              >
                <option value="">All Time</option>
                {quickFilters.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-[150px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Date range toggle (hidden when quick filter active) */}
              {!quickFilter && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition flex-shrink-0 ${
                    hasDateFilter
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date
                  {hasDateFilter && <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />}
                </button>
              )}
            </div>

            {/* Date range row (collapsible) */}
            {!quickFilter && filtersOpen && (
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-semibold text-gray-500 whitespace-nowrap w-16">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs font-semibold text-gray-500 whitespace-nowrap w-16">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                {hasDateFilter && (
                  <button
                    type="button"
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            )}
          </div>
          {/* ── End Header ── */}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
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

          {/* Medicines Table */}
          <section className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : medicines.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No medicines found.</p>
                <button
                  type="button"
                  onClick={openAddDrawer}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                >
                  <span>+</span> Add your first medicine
                </button>
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
                              onClick={() => setDetailsTarget(medicine.id)}
                              className="rounded-lg bg-gray-200 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-gray-800 hover:bg-gray-300 transition"
                            >View</button>
                            <button
                              type="button"
                              onClick={() => handleEdit(medicine.id)}
                              className="rounded-lg bg-blue-600 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >Edit</button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(medicine.id)}
                              className="rounded-lg bg-red-600 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition"
                            >Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Add / Edit Drawer ── */}
          {/* Backdrop */}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 transition-opacity"
              onClick={closeDrawer}
            />
          )}

          {/* Slide-in panel from right */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Medicine' : 'Add Medicine'}
              </h3>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition text-xl leading-none"
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>

            {/* Drawer body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <form id="medicine-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Cost (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="500"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Purchased By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="purchasedBy"
                    value={formData.purchasedBy}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. Ramesh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. 10 boxes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Any additional notes"
                  />
                </div>
              </form>
            </div>

            {/* Drawer footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="medicine-form"
                disabled={formLoading}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-semibold"
              >
                {formLoading ? 'Saving...' : editingId ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </div>
          {/* ── End Drawer ── */}

          {/* Delete Confirm Modal */}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-w-md w-full rounded-lg bg-white p-5 shadow-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Delete</h3>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this medicine record? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-gray-800 hover:bg-gray-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-white hover:bg-red-700 transition text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailsTarget && (
            <MedicineDetails id={detailsTarget} onClose={() => setDetailsTarget(null)} />
          )}

        </div>
      </div>
    </Layout>
  );
};


const SummaryCard = ({ label, value, loading }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition">
    <p className="text-xs sm:text-sm font-semibold text-gray-500">{label}</p>
    <p className="mt-2 sm:mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
      {loading
        ? 'Loading...'
        : typeof value === 'number'
          ? value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
          : value}
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
        if (response.data.success) setMedicine(response.data.data);
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
      <div className="max-w-2xl w-full rounded-lg bg-white p-5 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Medicine Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        ) : medicine ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Medicine Name" value={medicine.medicineName} />
              <DetailRow label="Amount" value={`₹${medicine.amount.toFixed(2)}`} />
              <DetailRow label="Purchase Date" value={formatDate(medicine.purchaseDate)} />
              <DetailRow label="Purchased By" value={medicine.purchasedBy} />
              <DetailRow label="Quantity" value={medicine.quantity || '-'} />
              <DetailRow label="Created" value={formatDate(medicine.createdAt)} />
            </div>
            {medicine.notes && (
              <DetailRow label="Notes" value={medicine.notes} />
            )}
            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-gray-600 px-4 py-2.5 text-white hover:bg-gray-700 transition text-sm"
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

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 font-semibold">{label}</p>
    <p className="text-sm text-gray-900 font-medium mt-0.5">{value}</p>
  </div>
);

export default Medicine;
