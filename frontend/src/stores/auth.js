import { defineStore } from 'pinia';
import { authApi } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isVerified: (state) => state.user?.emailVerified ?? false
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.register(userData);
        return response;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async verifyCode(userId, code) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.verifyCode(userId, code);
        return response;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resendVerificationCode(userId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.resendCode(userId);
        return response;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const { token, user } = await authApi.login(credentials);
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        return user;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    }
  }
});