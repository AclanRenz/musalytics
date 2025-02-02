<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                v-model="email"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>
  
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              {{ loading ? 'Sending...' : 'Send reset link' }}
            </button>
          </div>
        </form>
  
        <div class="text-sm text-center">
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </router-link>
        </div>
  
        <div v-if="error" class="mt-4 text-center text-sm text-red-600">
          {{ error }}
        </div>
  
        <div v-if="success" class="mt-4 text-center text-sm text-green-600">
          {{ success }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { LockClosedIcon } from '@heroicons/vue/solid';
  import { useAuthStore } from '../stores/auth';
  
  const authStore = useAuthStore();
  const email = ref('');
  const loading = ref(false);
  const error = ref('');
  const success = ref('');
  
  async function handleSubmit() {
    loading.value = true;
    error.value = '';
    success.value = '';
  
    try {
      await authStore.sendPasswordResetEmail(email.value);
      success.value = 'Password reset link has been sent to your email';
      email.value = '';
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
  </script>