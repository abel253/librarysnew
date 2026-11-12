// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Restore session if needed
  if (process.client) {
    authStore.init()
  }
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth')
  }
})