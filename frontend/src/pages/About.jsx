import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const About = () => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Keep it simple: read from the already-present public/version.json
    // If it fails, fall back to an empty string.
    const loadVersion = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setVersion(String(data?.version ?? ''));
      } catch {
        // no-op
      }
    };

    loadVersion();
  }, []);

  return (
    <Layout>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">About Labour Management App</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
              A simple, mobile-friendly business management app to track labour, payments, sales, expenses,
              medicine purchases, and generate useful financial reports—built to support PWA usage.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-2">Application</p>
                <div className="text-gray-900 font-semibold text-lg sm:text-xl">Labour Management App</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-2">Current Version</p>
                  <p className="text-gray-900 font-semibold text-lg sm:text-xl">{version || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-2">Highlights</p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Track key business activities with clear summaries and exports.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-3">Main Features</p>
                <ul className="space-y-2 text-gray-800">
                  <li>• Labour Management</li>
                  <li>• Labour Payments</li>
                  <li>• Sales Tracking</li>
                  <li>• Expense Management</li>
                  <li>• Medicine Management</li>
                  <li>• Financial Reports</li>
                  <li>• PWA Support</li>
                </ul>
              </div>

              <div className="text-sm sm:text-base text-gray-600">
                Need help? Use the <span className="font-semibold text-gray-900">Support</span> page for feedback and contact.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;

