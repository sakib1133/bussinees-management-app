import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Sales Management</h2>
                <p className="text-gray-600 mt-1">Manage contractor sales records</p>
              </div>
              <button
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {showForm ? 'Cancel' : '+ Add Sale'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingId ? 'Edit Sale' : 'Add New Sale'}
                </h3>
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contractor Name *
                    </label>
                    <input
                      type="text"
                      name="contractorName"
                      value={formData.contractorName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter contractor name"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter amount"
                      step="0.01"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sale Date *
                    </label>
                    <input
                      type="date"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter description"
                      disabled={formLoading}
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                    >
                      {formLoading ? 'Saving...' : 'Save Sale'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200"
                    >
                      Cancel
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Sales Table */}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'No sales found matching your search.' : 'No sales records yet. Add one to get started!'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contractor Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-800 font-medium">{sale.contractorName}</td>
                          <td className="px-6 py-3 text-gray-800 font-semibold">₹{sale.amount.toFixed(2)}</td>
                          <td className="px-6 py-3 text-gray-600">{formatDate(sale.saleDate)}</td>
                          <td className="px-6 py-3 text-gray-600">{sale.description || '-'}</td>
                          <td className="px-6 py-3 text-gray-600 text-sm">{formatDate(sale.createdAt)}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(sale)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(sale.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 text-sm"
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this sale record? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sales;
