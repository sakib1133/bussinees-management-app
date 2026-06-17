import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="labour-container">
      <div className="labour-header">
        <div className="header-left">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <h1>Labour Management</h1>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Labour'}
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {showForm && (
        <div className="form-section">
          <h2>{editingId ? 'Edit Labour' : 'Add New Labour'}</h2>
          <form onSubmit={handleSubmit} className="labour-form">
            <div className="form-group">
              <label htmlFor="name">Labour Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter labour name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address (Optional)</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="Enter address"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update Labour' : 'Create Labour'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search labour by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="labour-table">
            <thead>
              <tr>
                <th>Labour ID</th>
                <th>Labour Name</th>
                <th>Address</th>
                <th>Total Salary</th>
                <th>Total Paid</th>
                <th>Remaining Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabours.length > 0 ? (
                filteredLabours.map((labour) => (
                  <tr key={labour.id}>
                    <td>#{labour.id}</td>
                    <td>{labour.name}</td>
                    <td>{labour.address || '-'}</td>
                    <td className="amount">₹{labour.totalSalary?.toFixed(2) || '0.00'}</td>
                    <td className="amount amount-paid">₹{labour.totalPaid?.toFixed(2) || '0.00'}</td>
                    <td className="amount amount-remaining">₹{labour.totalRemaining?.toFixed(2) || '0.00'}</td>
                    <td className="actions">
                      <button
                        className="btn btn-small btn-info"
                        onClick={() => handleViewDetails(labour.id)}
                        title="View Details"
                      >
                        👁️ View
                      </button>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(labour)}
                        title="Edit Labour"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(labour.id)}
                        title="Delete Labour"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    {labours.length === 0 ? 'No labour records found' : 'No matching labour records'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default Labour;
