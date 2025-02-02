<template>
    <button
      type="button"
      @click="handleGoogleSignIn"
      :disabled="loading || authStore.isRedirecting"
      class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <img
        v-if="!loading && !authStore.isRedirecting"
        class="h-5 w-5 mr-2"
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
      />
      <svg
        v-else
        class="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {{ buttonText }}
    </button>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useAuthStore } from '../stores/auth';
  
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref('');
  
  const buttonText = computed(() => {
    if (loading.value || authStore.isRedirecting) {
      return 'Signing in...';
    }
    return 'Sign in with Google';
  });
  
  const handleGoogleSignIn = async () => {
    if (loading.value || authStore.isRedirecting) return;
    
    loading.value = true;
    error.value = '';
  
    try {
      await authStore.signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In error:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  