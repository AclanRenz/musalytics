<template>
  <div class="min-h-screen bg-gray-50">
    <nav-bar />
    <main class="container mx-auto px-4 py-8">
      <div v-if="initializing" class="flex justify-center items-center min-h-[200px]">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
      <router-view v-else></router-view>
    </main>
    <app-footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue';

const router = useRouter();
const authStore = useAuthStore();
const initializing = ref(true);

onMounted(async () => {
  try {
    await authStore.init(); // Changed from initializeAuth to init
    
    // If user is authenticated after initialization, redirect to dashboard
    if (authStore.isAuthenticated) {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    initializing.value = false;
  }
});
</script>