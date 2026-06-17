import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import '../styles/Labour.css';

const Labour = () => {
  const navigate = useNavigate();
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  useEffect(() => {
    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    try {
      setLoading(true);
      const response = await api.get('/labour');
      setLabours(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch labour records');
      console.error(err);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Labour name is required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/labour/${editingId}`, formData);
        setSuccessMessage('Labour updated successfully');
      } else {
        await api.post('/labour', formData);
        setSuccessMessage('Labour created successfully');
      }

      setFormData({ name: '', address: '' });
      setEditingId(null);
      setShowForm(false);
      setError('');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchLabours();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving labour');
    }
  };

  const handleEdit = (labour) => {
    setEditingId(labour.id);
    setFormData({
      name: labour.name,
      address: labour.address || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this labour?')) {
      try {
        await api.delete(`/labour/${id}`);
        setSuccessMessage('Labour deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchLabours();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting labour');
      }
    }
  };

  const handleViewDetails = (labourId) => {
    navigate(`/labour/${labourId}`);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', address: '' });
    setError('');
  };

  const filteredLabours = labours.filter(labour =>
    labour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (labour.address && labour.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium w-fit"
              onClick={() => navigate('/dashboard')}
              title="Back to Dashboard"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Labour Management</h1>
          </div>
          <button 
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Labour'}
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm sm:text-base">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-6 p-3 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              {editingId ? 'Edit Labour' : 'Add New Labour'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Labour Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter labour name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Enter address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 sm:gap-4 justify-end">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingId ? 'Update Labour' : 'Create Labour'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-6">
          <input
            type="text"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
            placeholder="Search labour by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Labour List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Address</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700">Salary</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 hidden md:table-cell">Paid</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 hidden md:table-cell">Balance</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabours.length > 0 ? (
                  filteredLabours.map((labour) => (
                    <tr key={labour.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">#{labour.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-800">{labour.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hidden sm:table-cell">{labour.address || '-'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-green-600 font-semibold">₹{labour.totalSalary?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-blue-600 font-semibold hidden md:table-cell">₹{labour.totalPaid?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-orange-600 font-semibold hidden md:table-cell">₹{labour.totalRemaining?.toFixed(2) || '0.00'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <div className="flex gap-1 sm:gap-2 justify-center">
                          <button
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded text-xs sm:text-sm hover:bg-blue-600 transition"
                            onClick={() => handleViewDetails(labour.id)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-500 text-white rounded text-xs sm:text-sm hover:bg-yellow-600 transition"
                            onClick={() => handleEdit(labour)}
                            title="Edit Labour"
                          >
                            ✏️
                          </button>
                          <button
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 transition"
                            onClick={() => handleDelete(labour.id)}
                            title="Delete Labour"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500">
                      {labours.length === 0 ? 'No labour records found' : 'No matching labour records'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Labour;
