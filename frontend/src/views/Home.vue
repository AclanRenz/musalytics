<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center">
      <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
        <span class="block">Welcome to</span>
        <span class="block text-primary-600">Your App</span>
      </h1>
      <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Start managing your tasks efficiently with our powerful application.
      </p>
      <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div class="rounded-md shadow">
          <router-link
            to="/register"
            class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
          >
            Create an Account
          </router-link>
        </div>
        <div class="mt-3 sm:mt-0 sm:ml-3">
          <router-link
            to="/login"
            class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Feature 1 -->
        <div class="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="text-center">
            <div class="inline-flex items-center justify-center p-2 bg-primary-100 rounded-md">
              <UserPlusIcon class="h-6 w-6 text-primary-600" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Easy Registration</h3>
            <p class="mt-2 text-base text-gray-500">
              Create an account in minutes with our simple registration process.
            </p>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="text-center">
            <div class="inline-flex items-center justify-center p-2 bg-primary-100 rounded-md">
              <ShieldCheckIcon class="h-6 w-6 text-primary-600" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Secure Verification</h3>
            <p class="mt-2 text-base text-gray-500">
              Verify your account with a secure 6-digit code sent to your email.
            </p>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="text-center">
            <div class="inline-flex items-center justify-center p-2 bg-primary-100 rounded-md">
              <LockClosedIcon class="h-6 w-6 text-primary-600" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Protected Access</h3>
            <p class="mt-2 text-base text-gray-500">
              Access your dashboard securely after email verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserPlusIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/vue/24/outline';
</script>