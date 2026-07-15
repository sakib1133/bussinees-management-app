import { useState } from 'react';
import Layout from '../components/Layout';

const Support = () => {
  const [email] = useState('sakibmalik5347@gmail.com');
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend integration required.
    setSuccess('Thank you for your feedback.');
    setFeedback('');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Support</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
              We’re here to help. Send us your feedback and suggestions to improve the app.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
            {success && (
              <div className="mb-5 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm sm:text-base">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-2">Contact email</p>
                <p className="text-gray-900 font-semibold">{email}</p>
                <p className="text-gray-600 text-sm mt-1">Use this email for general queries.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                  rows="6"
                  placeholder="Write your feedback here..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm sm:text-base font-medium"
                >
                  Submit Feedback
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeedback('');
                    setSuccess('');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 text-sm sm:text-base font-medium"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;

