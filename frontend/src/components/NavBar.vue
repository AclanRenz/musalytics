<template>
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Logo -->
            <router-link to="/" class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800">Your App</h1>
            </router-link>
            
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                v-for="item in navigationItems" 
                :key="item.path"
                :to="item.path"
                class="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                active-class="text-primary-600"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
  
          <!-- User Menu -->
          <div class="flex items-center">
            <button 
              v-if="!isAuthenticated" 
              @click="login"
              class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Login
            </button>
            <div v-else class="relative ml-3">
              <button 
                @click="logout"
                class="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { auth } from '../config/firebase'
  import { signOut } from 'firebase/auth'
  
  const router = useRouter()
  const isAuthenticated = ref(false)
  
  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Dashboard', path: '/dashboard' },
  ]
  
  const login = () => {
    router.push('/login')
  }
  
  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  </script>