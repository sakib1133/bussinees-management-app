import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const LabourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [labour, setLabour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [salaryFormData, setSalaryFormData] = useState({
    salaryAmount: '',
    periodFromDate: '',
    periodToDate: '',
    paymentDate: '',
    paidAmount: '',
    notes: ''
  });

  useEffect(() => {
    fetchLabourDetails();
  }, [id]);

  const fetchLabourDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/labour/${id}`);
      setLabour(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch labour details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalaryFormChange = (e) => {
    const { name, value } = e.target;
    setSalaryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();

    // Validation
    if (!salaryFormData.salaryAmount || parseFloat(salaryFormData.salaryAmount) <= 0) {
      setError('Salary amount must be greater than 0');
      return;
    }

    if (!salaryFormData.paidAmount || parseFloat(salaryFormData.paidAmount) < 0) {
      setError('Paid amount cannot be negative');
      return;
    }

    const fromDate = new Date(salaryFormData.periodFromDate);
    const toDate = new Date(salaryFormData.periodToDate);

    if (fromDate >= toDate) {
      setError('From date must be before to date');
      return;
    }

    try {
      if (editingSalaryId) {
        await api.put(`/salary/${editingSalaryId}`, {
          ...salaryFormData,
          labourId: parseInt(id)
        });
        setSuccessMessage('Salary record updated successfully');
      } else {
        await api.post('/salary', {
          ...salaryFormData,
          labourId: parseInt(id)
        });
        setSuccessMessage('Salary record added successfully');
      }

      setSalaryFormData({
        salaryAmount: '',
        periodFromDate: '',
        periodToDate: '',
        paymentDate: '',
        paidAmount: '',
        notes: ''
      });
      setEditingSalaryId(null);
      setShowSalaryForm(false);
      setError('');

      setTimeout(() => setSuccessMessage(''), 3000);
      fetchLabourDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving salary record');
    }
  };

  const handleEditSalary = (salaryRecord) => {
    setEditingSalaryId(salaryRecord.id);
    setSalaryFormData({
      salaryAmount: salaryRecord.salaryAmount,
      periodFromDate: salaryRecord.periodFromDate.split('T')[0],
      periodToDate: salaryRecord.periodToDate.split('T')[0],
      paymentDate: salaryRecord.paymentDate.split('T')[0],
      paidAmount: salaryRecord.paidAmount,
      notes: salaryRecord.notes || ''
    });
    setShowSalaryForm(true);
  };

  const handleDeleteSalary = async (salaryId) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await api.delete(`/salary/${salaryId}`);
        setSuccessMessage('Salary record deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchLabourDetails();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting salary record');
      }
    }
  };

  const handleCancelSalaryForm = () => {
    setShowSalaryForm(false);
    setEditingSalaryId(null);
    setSalaryFormData({
      salaryAmount: '',
      periodFromDate: '',
      periodToDate: '',
      paymentDate: '',
      paidAmount: '',
      notes: ''
    });
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!labour) {
    return (
      <Layout>
        <div className="p-3 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4 text-sm sm:text-base">
              Labour not found
            </div>
            <button
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
              onClick={() => navigate('/labour')}
            >
              Back to Labour List
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Labour Details</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage salary records and payments</p>
            </div>
            <button
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base font-medium"
              onClick={() => navigate('/labour')}
            >
              ← Back
            </button>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm sm:text-base">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Labour Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Labour Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Labour ID</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">#{labour.id}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Name</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{labour.name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Address</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{labour.address || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Phone</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{labour.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Email</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium mt-1 truncate">{labour.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Total Salary Paid</p>
                <p className="text-sm sm:text-base text-green-600 font-semibold mt-1">
                  ₹{labour.salaryRecords?.reduce((sum, r) => sum + (r.paidAmount || 0), 0).toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Records Section */}
          <section className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Salary Records</h3>
              <button
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base font-medium"
                onClick={() => setShowSalaryForm(!showSalaryForm)}
              >
                {showSalaryForm ? 'Cancel' : '+ Add Salary Record'}
              </button>
            </div>

            {showSalaryForm && (
              <form onSubmit={handleAddSalary} className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Salary Amount (₹)</label>
                      <input
                        type="number"
                        name="salaryAmount"
                        value={salaryFormData.salaryAmount}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        placeholder="5000"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Paid Amount (₹)</label>
                      <input
                        type="number"
                        name="paidAmount"
                        value={salaryFormData.paidAmount}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        placeholder="5000"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        name="periodFromDate"
                        value={salaryFormData.periodFromDate}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        name="periodToDate"
                        value={salaryFormData.periodToDate}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={salaryFormData.paymentDate}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                      <input
                        type="text"
                        name="notes"
                        value={salaryFormData.notes}
                        onChange={handleSalaryFormChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4">
                    <button
                      type="button"
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition text-sm sm:text-base font-medium"
                      onClick={handleCancelSalaryForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base font-medium"
                    >
                      {editingSalaryId ? 'Update Record' : 'Add Record'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Salary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700">From</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">To</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700">Salary</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 hidden md:table-cell">Paid</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 hidden lg:table-cell">Remaining</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Payment Date</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labour.salaryRecords && labour.salaryRecords.length > 0 ? (
                    labour.salaryRecords.map((record) => (
                      <tr key={record.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-medium">#{record.id}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap">{formatDate(record.periodFromDate)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap hidden sm:table-cell">{formatDate(record.periodToDate)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900">₹{record.salaryAmount.toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-green-600 hidden md:table-cell">₹{record.paidAmount.toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-orange-600 hidden lg:table-cell">₹{(record.salaryAmount - record.paidAmount).toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap hidden md:table-cell">{formatDate(record.paymentDate)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex gap-1 sm:gap-2 justify-center">
                            <button
                              className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 transition"
                              onClick={() => handleEditSalary(record)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="px-2 sm:px-3 py-1 sm:py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 transition"
                              onClick={() => handleDeleteSalary(record.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-600 text-sm">
                        No salary records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LabourDetails;
