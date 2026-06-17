import { useState } from 'react';
import api from '../services/api';

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset link sent to your email');
      setMessageType('success');
      setEmail('');
      
      // Close modal after 3 seconds on success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Forgot Password?</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div
            className={`${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            } px-4 py-3 rounded-lg mb-6 text-sm sm:text-base`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 font-semibold text-sm sm:text-base"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
