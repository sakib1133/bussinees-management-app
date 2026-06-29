import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Automatically attach JWT token in Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    const requestUrl = error.config?.url || '';

    // Do NOT redirect when login fails
    if (
      error.response?.status === 401 &&
      token &&
      !requestUrl.includes('/auth/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect only for expired/invalid authenticated sessions
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
export { api };