import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    contractorName: '',
    amount: '',
    saleDate: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch sales
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      if (response.data.success) {
        setSales(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load sales data. Please try again.');
      console.error('Fetch sales error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.contractorName.trim()) {
      setFormError('Contractor name is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('Amount must be greater than 0');
      return false;
    }
    if (!formData.saleDate) {
      setFormError('Sale date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (editingId) {
        // Update sale
        const response = await api.put(`/sales/${editingId}`, {
          contractorName: formData.contractorName,
          amount: parseFloat(formData.amount),
          saleDate: formData.saleDate,
          description: formData.description || null
        });
        
        if (response.data.success) {
          setSales(sales.map(s => s.id === editingId ? response.data.data : s));
          resetForm();
          setShowForm(false);
          setError('');
        }
      } else {
        // Create sale
        const response = await api.post('/sales', {
          contractorName: formData.contractorName,
          amount: parseFloat(formData.amount),
          saleDate: formData.saleDate,
          description: formData.description || null
        });
        
        if (response.data.success) {
          setSales([response.data.data, ...sales]);
          resetForm();
          setShowForm(false);
          setError('');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save sale');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (sale) => {
    setEditingId(sale.id);
    setFormData({
      contractorName: sale.contractorName,
      amount: sale.amount.toString(),
      saleDate: sale.saleDate.split('T')[0],
      description: sale.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      if (response.data.success) {
        setSales(sales.filter(s => s.id !== id));
        setDeleteConfirm(null);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sale');
    }
  };

  const resetForm = () => {
    setFormData({
      contractorName: '',
      amount: '',
      saleDate: '',
      description: ''
    });
    setFormError('');
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  // Filter sales by contractor name
  const filteredSales = sales.filter(sale =>
    sale.contractorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales Management</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage contractor sales records</p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                resetForm();
                setShowForm(!showForm);
              }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm sm:text-base font-medium"
            >
              {showForm ? 'Cancel' : '+ Add Sale'}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                {editingId ? 'Edit Sale' : 'Add New Sale'}
              </h3>
              
              {formError && (
                <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Contractor Name *
                    </label>
                    <input
                      type="text"
                      name="contractorName"
                      value={formData.contractorName}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                      placeholder="Enter contractor name"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                      placeholder="Enter amount"
                      step="0.01"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Sale Date *
                    </label>
                    <input
                      type="date"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                      placeholder="Enter description"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 text-sm sm:text-base font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 text-sm sm:text-base font-medium"
                  >
                    {formLoading ? 'Saving...' : 'Save Sale'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by contractor name..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
            />
          </div>

          {/* Sales Table */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
              <p className="text-gray-600 text-sm sm:text-lg">
                {searchTerm ? 'No sales found matching your search.' : 'No sales records yet. Add one to get started!'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Contractor</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Description</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Created</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 font-medium truncate">{sale.contractorName}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 font-semibold text-right">₹{sale.amount.toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap">{formatDate(sale.saleDate)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hidden sm:table-cell truncate">{sale.description || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hidden md:table-cell whitespace-nowrap text-xs">{formatDate(sale.createdAt)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex gap-1 sm:gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(sale)}
                              className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 text-xs sm:text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(sale.id)}
                              className="px-2 sm:px-3 py-1 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 text-xs sm:text-sm"
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
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Are you sure you want to delete this sale record? This action cannot be undone.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
