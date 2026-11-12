// app/stores/auth.ts
import { defineStore } from 'pinia'

export interface AuthUser {
  userId: string
  id?: string | number
  name: string
  email: string
  phone?: string
  avatar?: string
  photo?: string
  userType?: string
  role?: string
  department?: string
  status?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    
    isLibrarian: (state) => {
      const type = String(state.user?.userType || state.user?.role || '').toLowerCase()
      return type === 'librarian'
    },
    
    isStudent: (state) => {
      const type = String(state.user?.userType || state.user?.role || '').toLowerCase()
      return type === 'student' || type === 'faculty'
    },
    
    isAdmin: (state) => {
      const type = String(state.user?.userType || state.user?.role || '').toLowerCase()
      return type === 'administrator' || type === 'admin'
    },

    userFullName: (state) => state.user?.name || 'User',
    currentUserId: (state) => state.user?.userId || state.user?.id || '',
    userRoleBadge: (state) => state.user?.userType || state.user?.role || 'Guest',
    userAvatar: (state) => state.user?.avatar || state.user?.photo || '',
    userPhone: (state) => state.user?.phone || '0911000000',
  },

  actions: {
    updateUserProfile(updatedData: Partial<AuthUser>) {
      if (this.user) {
        this.user = { ...this.user, ...updatedData }
      } else {
        this.user = updatedData as AuthUser
      }
      if (import.meta.client) {
        localStorage.setItem('auth_user', JSON.stringify(this.user))
        if (updatedData.avatar) {
          localStorage.setItem(`user_avatar_${this.user.userId || 'default'}`, updatedData.avatar)
        }
      }
    },
    init() {
      if (!import.meta.client) return

      let token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        const cookie = useCookie<string | null>('auth_token')
        if (cookie.value) token = cookie.value
      }

      if (token) this.token = token

      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
          if (this.user && !this.user.avatar) {
            const savedAvatar = localStorage.getItem(`user_avatar_${this.user.userId || 'default'}`)
            if (savedAvatar) this.user.avatar = savedAvatar
          }
        } catch {
          this.user = null
        }
      }
    },

    saveAuth(token: string, user: AuthUser) {
      this.token = token
      this.user = user

      if (!import.meta.client) return
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      const cookie = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
      })
      cookie.value = token
    },

    async login(payload: { identifier?: string; email?: string; password: string }) {
      try {
        const res: any = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            identifier: payload.identifier || payload.email,
            password: payload.password,
          },
        })
        if (res.success && res.data?.token) {
          this.saveAuth(res.data.token, res.data.user)
        }
        return res
      } catch (error: any) {
        throw {
          message: error?.data?.statusMessage || error?.message || 'Login failed',
          statusCode: error?.statusCode || 400,
        }
      }
    },

    async register(payload: {
      name: string
      userId?: string
      studentId?: string
      email: string
      password: string
      password_confirmation?: string
      department?: string
      userType?: string
    }) {
      try {
        const res: any = await $fetch('/api/auth/register', {
          method: 'POST',
          body: payload,
        })
        if (res.success && res.data?.token) {
          this.saveAuth(res.data.token, res.data.user)
        }
        return res
      } catch (error: any) {
        throw {
          message: error?.data?.statusMessage || error?.message || 'Registration failed',
          statusCode: error?.statusCode || 400,
        }
      }
    },

    async fetchUser() {
      if (!import.meta.client) return null
      if (!this.token) this.init()
      if (!this.token) return null

      try {
        const res: any = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        const user = res?.data?.user || res?.user || null
        if (user) {
          this.user = user
          localStorage.setItem('auth_user', JSON.stringify(user))
        }
        return user
      } catch (error: any) {
        if (error?.statusCode === 401) this.logout()
        return null
      }
    },

    logout() {
      this.token = null
      this.user = null

      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('token')
        localStorage.removeItem('auth_user')
        
        const cookie = useCookie<string | null>('auth_token')
        cookie.value = null
      }
      
      $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      navigateTo('/auth')
    },
  },
})
