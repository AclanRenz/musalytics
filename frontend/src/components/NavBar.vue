<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <router-link 
            to="/" 
            class="flex-shrink-0 flex items-center text-xl font-bold text-gray-900"
          >
            Your App
          </router-link>
        </div>
        
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <router-link 
              to="/dashboard"
              class="text-gray-700 hover:text-gray-900"
              active-class="text-primary-600"
            >
              Dashboard
            </router-link>
            
            <div class="flex items-center space-x-2">
              <img 
                v-if="authStore.user?.photoURL"
                :src="authStore.user.photoURL"
                :alt="authStore.user.displayName"
                class="h-8 w-8 rounded-full"
              />
              <span class="text-sm text-gray-700">
                {{ authStore.user?.displayName || authStore.user?.email }}
              </span>
            </div>
            
            <button
              @click="handleLogout"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <ArrowRightOnRectangleIcon 
                v-if="!loading"
                class="h-4 w-4 mr-2"
              />
              <ArrowPathIcon
                v-else
                class="animate-spin h-4 w-4 mr-2"
              />
              {{ loading ? 'Logging out...' : 'Logout' }}
            </button>
          </template>
          
          <template v-else>
            <router-link 
              to="/login"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign In
            </router-link>
            <router-link 
              to="/register"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Account
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ArrowRightOnRectangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const handleLogout = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    loading.value = false;
  }
};
</script>