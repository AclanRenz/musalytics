<template>
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
  
        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <EnvelopeIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Verify your email
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  We've sent a verification code to your email address. Please enter it below to verify your account.
                </p>
              </div>
            </div>
          </div>
  
          <div class="mt-5 sm:mt-6">
            <!-- Verification Code Input -->
            <div class="flex justify-center gap-2">
              <template v-for="(digit, index) in 6" :key="index">
                <input
                  type="text"
                  maxlength="1"
                  v-model="code[index]"
                  @input="handleInput($event, index)"
                  @keydown="handleKeydown($event, index)"
                  @paste="handlePaste"
                  class="w-12 h-12 text-center text-2xl border-2 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  :disabled="loading"
                />
              </template>
            </div>
  
            <!-- Error Message -->
            <div v-if="error" class="mt-2 rounded-md bg-red-50 p-4">
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
  
            <!-- Verify Button -->
            <button
              type="button"
              @click="verifyCode"
              :disabled="!isComplete || loading"
              class="mt-4 inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
            >
              <ArrowPathIcon
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-5 w-5"
              />
              {{ loading ? 'Verifying...' : 'Verify Email' }}
            </button>
  
            <!-- Resend Code -->
            <div class="mt-3 text-center">
              <button
                type="button"
                @click="resendCode"
                :disabled="loading || resendLoading"
                class="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {{ resendLoading ? 'Sending...' : "Didn't receive the code? Resend" }}
              </button>
            </div>
  
            <!-- Close Button -->
            <div class="mt-5 sm:mt-6">
              <button
                type="button"
                @click="$emit('close')"
                class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
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
  import { ref, computed } from 'vue';
  import { EnvelopeIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
  import { useAuthStore } from '../stores/auth';
  
  const props = defineProps({
    userId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['verified', 'close']);
  const authStore = useAuthStore();
  
  const code = ref(Array(6).fill(''));
  const loading = ref(false);
  const resendLoading = ref(false);
  const error = ref('');
  
  const isComplete = computed(() => code.value.every(digit => digit !== ''));
  
  const handleInput = (event, index) => {
    const value = event.target.value;
    
    // Ensure input is a number
    if (!/^\d*$/.test(value)) {
      code.value[index] = '';
      return;
    }
  
    // Move to next input
    if (value && index < 5) {
      const nextInput = event.target.parentElement.children[index + 1];
      nextInput.focus();
    }
  };
  
  const handleKeydown = (event, index) => {
    // Handle backspace
    if (event.key === 'Backspace' && !code.value[index] && index > 0) {
      const prevInput = event.target.parentElement.children[index - 1];
      prevInput.focus();
    }
  };
  
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const numbers = pastedText.match(/\d/g);
    
    if (numbers) {
      code.value = [
        ...numbers.slice(0, 6),
        ...Array(Math.max(0, 6 - numbers.length)).fill('')
      ];
    }
  };
  
  const verifyCode = async () => {
    if (!isComplete.value || loading.value) return;
  
    loading.value = true;
    error.value = '';
  
    try {
      await authStore.verifyEmail({
        userId: props.userId,
        code: code.value.join('')
      });
      
      emit('verified');
    } catch (err) {
      console.error('Verification error:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const resendCode = async () => {
    if (resendLoading.value) return;
  
    resendLoading.value = true;
    error.value = '';
  
    try {
      await authStore.resendVerificationCode(props.userId);
      code.value = Array(6).fill('');
    } catch (err) {
      console.error('Resend code error:', err);
      error.value = err.message;
    } finally {
      resendLoading.value = false;
    }
  };
  </script>