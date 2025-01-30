<template>
  <div class="min-h-screen bg-gray-50">
    <nav-bar />
    <main class="container mx-auto px-4 py-8">
      <router-view></router-view>
    </main>
    <app-footer />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
@import './assets/main.css';
</style>