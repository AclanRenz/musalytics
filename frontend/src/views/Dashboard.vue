<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Profile header -->
        <div class="px-4 py-5 sm:px-6">
          <div class="flex items-center">
            <img
              v-if="authStore.user?.photoURL"
              :src="authStore.user.photoURL"
              :alt="authStore.user.displayName"
              class="h-16 w-16 rounded-full"
            />
            <div class="ml-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ authStore.user?.displayName || authStore.user?.email }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Member since {{ formatDate(authStore.userProfile?.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Profile form -->
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Bio -->
              <div class="col-span-2">
                <label for="bio" class="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div class="mt-1">
                  <textarea
                    id="bio"
                    v-model="formData.bio"
                    rows="3"
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <!-- Phone Number -->
              <div>
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div class="mt-1">
                  <input
                    type="tel"
                    id="phoneNumber"
                    v-model="formData.phoneNumber"
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <!-- Address -->
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div class="mt-1">
                  <input
                    type="text"
                    id="address"
                    v-model="formData.address"
                    class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <!-- Preferences -->
              <div class="col-span-2">
                <fieldset>
                  <legend class="text-sm font-medium text-gray-700">Preferences</legend>
                  <div class="mt-4 space-y-4">
                    <div class="flex items-start">
                      <div class="flex items-center h-5">
                        <input
                          id="notifications"
                          v-model="formData.preferences.notifications"
                          type="checkbox"
                          class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="notifications" class="font-medium text-gray-700">
                          Email Notifications
                        </label>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex items-center h-5">
                        <input
                          id="newsletter"
                          v-model="formData.preferences.newsletter"
                          type="checkbox"
                          class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="newsletter" class="font-medium text-gray-700">
                          Subscribe to Newsletter
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <ArrowPathIcon
                  v-if="loading"
                  class="animate-spin -ml-1 mr-2 h-5 w-5"
                />
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const loading = ref(false);

const formData = ref({
  bio: '',
  phoneNumber: '',
  address: '',
  preferences: {
    notifications: true,
    newsletter: false
  }
});

// Initialize form data with user profile
onMounted(() => {
  if (authStore.userProfile) {
    formData.value = {
      bio: authStore.userProfile.bio || '',
      phoneNumber: authStore.userProfile.phoneNumber || '',
      address: authStore.userProfile.address || '',
      preferences: {
        notifications: authStore.userProfile.preferences?.notifications ?? true,
        newsletter: authStore.userProfile.preferences?.newsletter ?? false
      }
    };
  }
});

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

const handleSubmit = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    await authStore.updateProfile(formData.value);
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    loading.value = false;
  }
};
</script>