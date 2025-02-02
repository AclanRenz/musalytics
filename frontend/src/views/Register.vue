<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link 
            to="/login" 
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            sign in to your account
          </router-link>
        </p>
      </div>

      <!-- Registration Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- First Name and Last Name -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                :disabled="loading"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
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

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              >
                <EyeIcon
                  v-if="!showConfirmPassword"
                  class="h-5 w-5 text-gray-400 hover:text-gray-500"
                />
                <EyeSlashIcon
                  v-else
                  class="h-5 w-5 text-gray-400 hover:text-gray-500"
                />
              </button>
            </div>
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
              <UserPlusIcon 
                v-if="!loading"
                class="h-5 w-5 text-primary-500 group-hover:text-primary-400" 
                aria-hidden="true" 
              />
              <ArrowPathIcon
                v-else
                class="animate-spin h-5 w-5 text-primary-500"
              />
            </span>
            {{ loading ? 'Creating account...' : 'Create account' }}
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

    <!-- Verification Modal -->
    <VerificationModal
      v-if="showVerificationModal"
      :email="formData.email"
      :userId="userId"
      @verified="handleVerified"
      @close="showVerificationModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  UserPlusIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/auth';
import GoogleSignInButton from '../components/GoogleSignInButton.vue';
import VerificationModal from '../components/VerificationModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showVerificationModal = ref(false);
const userId = ref('');

const validateForm = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  if (formData.value.password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    throw new Error('Please enter a valid email address');
  }
};

const handleSubmit = async () => {
  if (loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    // Validate form
    validateForm();

    // Register user
    const response = await authStore.register({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      password: formData.value.password
    });

    // Store userId for verification
    userId.value = response.userId;
    
    // Show verification modal
    showVerificationModal.value = true;
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleVerified = () => {
  showVerificationModal.value = false;
  router.push('/login');
};
</script>