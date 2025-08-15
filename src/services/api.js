import axios from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  //const API_BASE_URL = "http://192.168.1.76:5000/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

          console.log("Request Headers:", config.headers);

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, isActive) => {
    // Use the appropriate endpoint based on the desired status
    const endpoint = isActive ? `/users/${id}/activate` : `/users/${id}/deactivate`;
    return api.post(endpoint);
  },
  getStats: () => api.get('/users/stats'),
};

// Buses API
export const busesAPI = {
  getAll: (params = {}) => api.get('/buses', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (busData) => api.post('/buses', busData),
  update: (id, busData) => api.put(`/buses/${id}`, busData),
  delete: (id) => api.delete(`/buses/${id}`),
  checkAvailability: (id, params) => api.get(`/buses/${id}/availability`, { params }),
};

// Routes API
export const routesAPI = {
  getAll: (params = {}) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (routeData) => api.post('/routes', routeData),
  update: (id, routeData) => api.put(`/routes/${id}`, routeData),
  delete: (id) => api.delete(`/routes/${id}`),
  checkAvailability: (id, params) => api.get(`/routes/${id}/availability`, { params }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}/permanent`), // Permanent delete
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`), // Cancel booking (soft delete)
  confirm: (id) => api.post(`/bookings/${id}/confirm`),
};

// Hirings API
export const hiringsAPI = {
  getAll: (params = {}) => api.get('/hiring', { params }),
  getById: (id) => api.get(`/hiring/${id}`),
  create: (hiringData) => api.post('/hiring', hiringData),
  update: (id, hiringData) => api.put(`/hiring/${id}`, hiringData),
  delete: (id) => api.delete(`/hiring/${id}`), // This actually cancels the hiring
  cancel: (id, reason) => api.delete(`/hiring/${id}`, { data: { reason } }), // Explicit cancel method
  updateStatus: (id, status, notes) => api.patch(`/hiring/${id}/status`, { status, notes }),
  approve: (id, notes) => api.post(`/hiring/${id}/approve`, { notes }),
  reject: (id, reason) => api.post(`/hiring/${id}/reject`, { reason }),
  checkAvailability: (params) => api.get('/hiring/availability', { params }),
  getStats: (params) => api.get('/hiring/stats', { params }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications/admin', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  update: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
  getStats: () => api.get('/notifications/admin/stats'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Tickets API
export const ticketsAPI = {
  verifyQR: (qrData, conductorId, busId, location) => api.post('/tickets/verify', {
    qrData,
    conductorId,
    busId,
    location
  }),
  getVerifications: (id, type = 'booking') => api.get(`/tickets/${id}/verifications`, {
    params: { type }
  }),
  getVerificationStats: (params = {}) => api.get('/tickets/verification-stats', { params }),
  manualValidation: (id, data) => api.post(`/tickets/${id}/validate`, data),
};

// Dashboard API (if needed)
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getOverview: () => api.get('/dashboard/overview'),
};

export default api;
