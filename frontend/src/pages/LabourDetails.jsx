import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import '../styles/LabourDetails.css';

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

    if (parseFloat(salaryFormData.paidAmount) > parseFloat(salaryFormData.salaryAmount)) {
      setError('Paid amount cannot exceed salary amount');
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
    return <div className="loading">Loading labour details...</div>;
  }

  if (!labour) {
    return (
      <div className="labour-details-container">
        <div className="alert alert-error">Labour not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/labour')}>
          Back to Labour List
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="labour-details-container">
      <div className="details-header">
        <button className="btn btn-secondary" onClick={() => navigate('/labour')}>
          ← Back
        </button>
        <h1>Labour Details</h1>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="labour-info-section">
        <div className="info-card">
          <div className="info-header">Labour Information</div>
          <div className="info-grid">
            <div className="info-item">
              <label>Labour ID</label>
              <p>#{labour.id}</p>
            </div>
            <div className="info-item">
              <label>Labour Name</label>
              <p>{labour.name}</p>
            </div>
            <div className="info-item">
              <label>Address</label>
              <p>{labour.address || '-'}</p>
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Salary</div>
            <div className="summary-amount">₹{labour.totalSalary?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Paid</div>
            <div className="summary-amount paid">₹{labour.totalPaid?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Remaining</div>
            <div className="summary-amount remaining">₹{labour.totalRemaining?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      <div className="salary-section">
        <div className="section-header">
          <h2>Salary History</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowSalaryForm(!showSalaryForm)}
          >
            {showSalaryForm ? 'Cancel' : '+ Add Salary Record'}
          </button>
        </div>

        {showSalaryForm && (
          <div className="form-section">
            <h3>{editingSalaryId ? 'Edit Salary Record' : 'Add Salary Record'}</h3>
            <form onSubmit={handleAddSalary} className="salary-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salaryAmount">Salary Amount *</label>
                  <input
                    type="number"
                    id="salaryAmount"
                    name="salaryAmount"
                    value={salaryFormData.salaryAmount}
                    onChange={handleSalaryFormChange}
                    placeholder="Enter salary amount"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paidAmount">Paid Amount *</label>
                  <input
                    type="number"
                    id="paidAmount"
                    name="paidAmount"
                    value={salaryFormData.paidAmount}
                    onChange={handleSalaryFormChange}
                    placeholder="Enter paid amount"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="periodFromDate">Period From Date *</label>
                  <input
                    type="date"
                    id="periodFromDate"
                    name="periodFromDate"
                    value={salaryFormData.periodFromDate}
                    onChange={handleSalaryFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="periodToDate">Period To Date *</label>
                  <input
                    type="date"
                    id="periodToDate"
                    name="periodToDate"
                    value={salaryFormData.periodToDate}
                    onChange={handleSalaryFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paymentDate">Payment Date *</label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={salaryFormData.paymentDate}
                    onChange={handleSalaryFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <input
                    type="text"
                    id="notes"
                    name="notes"
                    value={salaryFormData.notes}
                    onChange={handleSalaryFormChange}
                    placeholder="Add notes..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  {editingSalaryId ? 'Update Record' : 'Add Record'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelSalaryForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Salary ID</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Salary Amount</th>
                <th>Paid Amount</th>
                <th>Remaining Amount</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labour.salaryRecords && labour.salaryRecords.length > 0 ? (
                labour.salaryRecords.map((record) => (
                  <tr key={record.id}>
                    <td>#{record.id}</td>
                    <td>{formatDate(record.periodFromDate)}</td>
                    <td>{formatDate(record.periodToDate)}</td>
                    <td className="amount">₹{record.salaryAmount.toFixed(2)}</td>
                    <td className="amount amount-paid">₹{record.paidAmount.toFixed(2)}</td>
                    <td className="amount amount-remaining">
                      ₹{(record.salaryAmount - record.paidAmount).toFixed(2)}
                    </td>
                    <td>{formatDate(record.paymentDate)}</td>
                    <td className="actions">
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEditSalary(record)}
                        title="Edit Record"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteSalary(record.id)}
                        title="Delete Record"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No salary records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div>
    </>
  );
};

export default LabourDetails;
