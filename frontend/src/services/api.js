import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyCode: async (userId, code) => {
    const response = await api.post('/auth/verify-code', { userId, code });
    return response.data;
  },

  resendCode: async (userId) => {
    const response = await api.post('/auth/resend-code', { userId });
    return response.data;
  }
};

export default api;