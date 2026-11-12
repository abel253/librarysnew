<!-- pages/portal.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      navigateTo('/admin')
    } else if (authStore.isLibrarian) {
      navigateTo('/librarian')
    } else {
      navigateTo('/my-borrows')
    }
  } else {
    navigateTo('/auth?redirect=/my-borrows')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
    <div class="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-md space-y-3">
      <div class="w-10 h-10 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <h2 class="text-base font-bold text-slate-800">ወደ ተማሪዎች ፖርታል እየወሰደዎት ነው...</h2>
      <p class="text-slate-500 text-xs">Redirecting to your library portal account, please wait...</p>
    </div>
  </div>
</template>
