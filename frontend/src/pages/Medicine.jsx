import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Medicine Management</h2>
                <p className="text-gray-600 mt-1">Manage medicine purchases and expenses.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reset Form
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              <SummaryCard label="Total Medicine Expense" value={summary.totalMedicineExpense} loading={summaryLoading} />
              <SummaryCard label="Total Purchases" value={summary.totalPurchases} loading={summaryLoading} />
              <SummaryCard label="Today's Expense" value={summary.todaysExpense} loading={summaryLoading} />
              <SummaryCard label="This Month Expense" value={summary.thisMonthExpense} loading={summaryLoading} />
            </div>

            <section className="bg-white rounded-2xl shadow p-6 border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Medicine</h3>
              <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cost (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purchased By</label>
                  <input
                    type="text"
                    name="purchasedBy"
                    value={formData.purchasedBy}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Ramesh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="10 strips"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="4"
                    placeholder="For workers"
                  />
                </div>
                <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {editingId ? 'Update Medicine' : 'Save Medicine'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 rounded-xl bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
              {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
            </section>

            <section className="bg-white rounded-2xl shadow p-6 border border-gray-200 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Search medicine or purchaser"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setQuickFilter('');
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setQuickFilter('');
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setQuickFilter(filter.value);
                      setStartDate('');
                      setEndDate('');
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${quickFilter === filter.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="w-full lg:w-64">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={fetchMedicines}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Medicine Records</h3>
                <p className="text-sm text-gray-600">{medicines.length} records</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Medicine Name</th>
                      <th className="px-6 py-4 font-semibold">Cost</th>
                      <th className="px-6 py-4 font-semibold">Purchase Date</th>
                      <th className="px-6 py-4 font-semibold">Purchased By</th>
                      <th className="px-6 py-4 font-semibold">Quantity</th>
                      <th className="px-6 py-4 font-semibold">Notes</th>
                      <th className="px-6 py-4 font-semibold">Created At</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-10 text-center text-gray-500">Loading medicines...</td>
                      </tr>
                    ) : medicines.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-10 text-center text-gray-500">No medicine records found.</td>
                      </tr>
                    ) : (
                      medicines.map((medicine) => (
                        <tr key={medicine.id} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">{medicine.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{medicine.medicineName}</td>
                          <td className="px-6 py-4">₹{medicine.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">{formatDate(medicine.purchaseDate)}</td>
                          <td className="px-6 py-4">{medicine.purchasedBy}</td>
                          <td className="px-6 py-4">{medicine.quantity || '-'}</td>
                          <td className="px-6 py-4">{medicine.notes || '-'}</td>
                          <td className="px-6 py-4">{formatDate(medicine.createdAt)}</td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              type="button"
                              onClick={() => handleView(medicine.id)}
                              className="rounded-xl bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(medicine.id)}
                              className="rounded-xl bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(medicine.id)}
                              className="rounded-xl bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {deleteTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-w-md w-full rounded-3xl bg-white p-6 shadow-xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to delete this medicine record?</p>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 rounded-xl bg-gray-300 px-4 py-3 text-gray-800 hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {detailsTarget && <MedicineDetails id={detailsTarget} onClose={() => setDetailsTarget(null)} />}
          </div>
        </main>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, loading }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    <p className="mt-4 text-3xl font-semibold text-gray-900">{loading ? 'Loading...' : typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : value}</p>
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
      <div className="max-w-2xl w-full rounded-3xl bg-white p-6 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Medicine Details</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-900">Close</button>
        </div>
        {loading ? (
          <p className="text-gray-600">Loading details...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : medicine ? (
          <div className="grid gap-4">
            <DetailRow label="ID" value={medicine.id} />
            <DetailRow label="Medicine Name" value={medicine.medicineName} />
            <DetailRow label="Cost" value={`₹${medicine.amount.toFixed(2)}`} />
            <DetailRow label="Purchase Date" value={formatDate(medicine.purchaseDate)} />
            <DetailRow label="Purchased By" value={medicine.purchasedBy} />
            <DetailRow label="Quantity" value={medicine.quantity || '-'} />
            <DetailRow label="Notes" value={medicine.notes || '-'} />
            <DetailRow label="Created At" value={formatDate(medicine.createdAt)} />
            <DetailRow label="Updated At" value={formatDate(medicine.updatedAt)} />
          </div>
        ) : (
          <p className="text-gray-600">No details available.</p>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-3">
    <div className="text-sm font-semibold text-gray-700">{label}</div>
    <div className="col-span-2 text-sm text-gray-800">{value}</div>
  </div>
);

export default Medicine;
