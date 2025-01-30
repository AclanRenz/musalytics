<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            We've sent a verification code to
          </p>
          <p class="font-medium text-gray-900">{{ email }}</p>
          <a 
            :href="emailLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <EnvelopeIcon class="h-5 w-5 mr-1" />
            Open email provider
          </a>
        </div>
      </div>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label for="code" class="block text-sm font-medium text-gray-700">
                Enter verification code
              </label>
              <div class="mt-1 flex space-x-2">
                <input
                  id="code"
                  v-model="verificationCode"
                  name="code"
                  type="text"
                  required
                  maxlength="6"
                  pattern="\d{6}"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                  :class="{ 'border-red-300': error }"
                />
              </div>
              <p class="text-sm text-gray-500">
                Enter the 6-digit code we sent to your email
              </p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading || !isValidCode"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="flex items-center">
                  <ArrowPathIcon class="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </span>
                <span v-else>Verify Email</span>
              </button>
            </div>

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

            <div v-if="success" class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <CheckCircleIcon class="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">
                    {{ success }}
                  </h3>
                </div>
              </div>
            </div>

            <div class="text-center space-y-4">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">
                    Didn't receive the code?
                  </span>
                </div>
              </div>

              <button
                type="button"
                @click="resendCode"
                :disabled="countdown > 0 || loading"
                class="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ resendButtonText }}
              </button>

              <div class="text-sm">
                <router-link to="/login" class="font-medium text-gray-600 hover:text-gray-500">
                  Back to login
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  XCircleIcon, 
  CheckCircleIcon, 
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref(route.query.email || '');
const userId = ref(route.query.userId || '');
const verificationCode = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const countdown = ref(0);
let countdownTimer;

// Email provider detection and link generation
const emailLink = computed(() => {
  const emailDomain = email.value.split('@')[1]?.toLowerCase();
  const emailProviders = {
    'gmail.com': 'https://mail.google.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'live.com': 'https://outlook.live.com'
  };
  return emailProviders[emailDomain] || `https://${emailDomain}`;
});

const isValidCode = computed(() => {
  return /^\d{6}$/.test(verificationCode.value);
});

const resendButtonText = computed(() => {
  if (loading.value) return 'Sending...';
  if (countdown.value > 0) return `Resend code in ${countdown.value}s`;
  return 'Resend verification code';
});

const startCountdown = () => {
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

const handleSubmit = async () => {
  if (!isValidCode.value) return;
  
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await authStore.verifyCode(userId.value, verificationCode.value);
    success.value = 'Email verified successfully! Redirecting to login...';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || err.message;
    verificationCode.value = ''; // Clear the input on error
  } finally {
    loading.value = false;
  }
};

const resendCode = async () => {
  if (countdown.value > 0 || loading.value) return;
  
  loading.value = true;
  error.value = '';

  try {
    await authStore.resendVerificationCode(userId.value);
    success.value = 'New verification code sent!';
    startCountdown();
    verificationCode.value = ''; // Clear the previous code
  } catch (err) {
    error.value = err.response?.data?.error || err.message;
  } finally {
    loading.value = false;
  }
};

// Redirect to login if no email or userId is provided
onMounted(() => {
  if (!email.value || !userId.value) {
    router.push('/login');
    return;
  }
  startCountdown();
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>