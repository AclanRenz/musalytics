<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link 
            to="/register" 
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <!-- Email -->
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="formData.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm pr-10"
              placeholder="Password"
              :disabled="loading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <EyeIcon
                v-if="!showPassword"
                class="h-5 w-5 text-gray-400 hover:text-gray-500"
              />
              <EyeSlashIcon
                v-else
                class="h-5 w-5 text-gray-400 hover:text-gray-500"
              />
            </button>
          </div>
        </div>

        <!-- Remember me and Forgot password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link 
              to="/forgot-password"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </router-link>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <LockClosedIcon 
                v-if="!loading"
                class="h-5 w-5 text-primary-500 group-hover:text-primary-400" 
                aria-hidden="true" 
              />
              <ArrowPathIcon
                v-else
                class="animate-spin h-5 w-5 text-primary-500"
              />
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- Or Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        <!-- Google Sign In -->
        <div>
          <GoogleSignInButton />
        </div>
      </form>
    </div>

    <!-- Unverified Email Alert -->
    <div
      v-if="showUnverifiedAlert"
      class="fixed inset-0 z-10 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Email Not Verified
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Your email address is not verified. Please verify your email to continue.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              @click="resendVerificationCode"
              :disabled="resendLoading"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
            >
              {{ resendLoading ? 'Sending...' : 'Resend Verification' }}
            </button>
            <button
              type="button"
              @click="showUnverifiedAlert = false"
              class="mt-3 sm:mt-0 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  LockClosedIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/auth';
import GoogleSignInButton from '../components/GoogleSignInButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  email: '',
  password: ''
});

const loading = ref(false);
const resendLoading = ref(false);
const error = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const showUnverifiedAlert = ref(false);
const unverifiedUserId = ref(null);

const handleSubmit = async () => {
  if (loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    await authStore.login({
      email: formData.value.email,
      password: formData.value.password,
      remember: rememberMe.value
    });

    router.push('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    
    // Check if error is due to unverified email
    if (err.message.includes('verify your email')) {
      showUnverifiedAlert.value = true;
      // Assuming the backend returns the userId in the error response
      unverifiedUserId.value = err.userId;
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};

const resendVerificationCode = async () => {
  if (resendLoading.value || !unverifiedUserId.value) return;

  resendLoading.value = true;
  try {
    await authStore.resendVerificationCode(unverifiedUserId.value);
    error.value = '';
    showUnverifiedAlert.value = false;
  } catch (err) {
    console.error('Resend verification error:', err);
    error.value = err.message;
  } finally {
    resendLoading.value = false;
  }
};
</script>