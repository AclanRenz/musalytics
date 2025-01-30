<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div class="bg-white shadow rounded-lg p-6">
          <div v-if="user" class="space-y-4">
            <p class="text-gray-600">
              Welcome back, {{ user.email }}!
            </p>
            <!-- Add your dashboard content here -->
          </div>
          <div v-else class="text-gray-600">
            Please log in to view your dashboard.
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { auth } from '../config/firebase'
  
  const user = ref(null)
  
  onMounted(() => {
    user.value = auth.currentUser
  })
  </script>