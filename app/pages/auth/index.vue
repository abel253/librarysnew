<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  identifier: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  userId: '',
  email: '',
  department: 'Computer Science',
  userType: 'Student',
  password: '',
  passwordConfirm: '',
})

const feedback = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const showAlert = (msg: string, type: 'success' | 'error' = 'success') => {
  feedback.message = msg
  feedback.type = type
  feedback.show = true
  setTimeout(() => {
    feedback.show = false
  }, 6000)
}

const resolveRedirect = (userRole?: string): string => {
  const q = route.query.redirect
  if (q && typeof q === 'string') return q

  const role = (userRole || authStore.user?.userType || authStore.user?.role || '').toLowerCase()
  if (role === 'admin' || role === 'administrator') return '/admin'
  if (role === 'librarian') return '/librarian'
  return '/my-borrows'
}

onMounted(() => {
  authStore.init()
  if (authStore.isAuthenticated) {
    router.push(resolveRedirect())
  }
})

// Demo credentials autofill
const fillDemo = (role: 'admin' | 'librarian' | 'student') => {
  isLogin.value = true
  if (role === 'admin') {
    loginForm.identifier = 'admin@mkau.edu.et'
    loginForm.password = 'admin123'
  } else if (role === 'librarian') {
    loginForm.identifier = 'librarian@mkau.edu.et'
    loginForm.password = 'lib123'
  } else {
    loginForm.identifier = 'student@mkau.edu.et'
    loginForm.password = 'student123'
  }
  showAlert(`Filled demo credentials for ${role.toUpperCase()}`, 'success')
}

// ───── HANDLE LOGIN ─────
const handleLogin = async () => {
  if (!loginForm.identifier || !loginForm.password) {
    showAlert('እባክዎ የተማሪ/ሰራተኛ መታወቂያ ወይም ኢሜይል እና የይለፍ ቃል ያስገቡ', 'error')
    return
  }

  loading.value = true
  feedback.show = false

  try {
    const res = await authStore.login({
      identifier: loginForm.identifier,
      password: loginForm.password,
    })

    if (res.success) {
      showAlert('✅ በተሳካ ሁኔታ ገብተዋል! (Login successful)', 'success')
      const target = resolveRedirect(res.data?.user?.userType)
      setTimeout(() => {
        router.push(target)
      }, 600)
    }
  } catch (err: any) {
    showAlert(err.message || 'Login failed. Please verify your credentials.', 'error')
  } finally {
    loading.value = false
  }
}

// ───── HANDLE REGISTER (NO OTP - STANDARD JWT FORM) ─────
const handleRegister = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.password) {
    showAlert('እባክዎ ስም፣ ኢሜይል እና የይለፍ ቃል ያስገቡ (Please fill all required fields)', 'error')
    return
  }

  if (registerForm.password.length < 6) {
    showAlert('የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት', 'error')
    return
  }

  if (registerForm.password !== registerForm.passwordConfirm) {
    showAlert('የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match)', 'error')
    return
  }

  loading.value = true
  feedback.show = false

  try {
    const res = await authStore.register({
      name: registerForm.name,
      userId: registerForm.userId || undefined,
      email: registerForm.email,
      department: registerForm.department,
      userType: registerForm.userType,
      password: registerForm.password,
      password_confirmation: registerForm.passwordConfirm,
    })

    if (res.success) {
      showAlert('🎉 መለያዎ ተፈጥሯል! በቀጥታ ገብተዋል። (Registration successful)', 'success')
      const target = resolveRedirect(res.data?.user?.userType)
      setTimeout(() => {
        router.push(target)
      }, 700)
    }
  } catch (err: any) {
    showAlert(err.message || 'Registration failed. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
    
    <!-- Top Branding -->
    <div class="text-center mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 mb-2">
        <div class="w-12 h-12 rounded-2xl bg-[#06387d] text-white flex items-center justify-center text-2xl shadow-md">
          📚
        </div>
      </NuxtLink>
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mekdela Amba University</h1>
      <p class="text-xs font-semibold text-slate-500">Library Circulation & Information Management System</p>
    </div>

    <!-- Main Auth Card -->
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
      
      <!-- Tab Buttons (Login vs Register) -->
      <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-black">
        <button
          type="button"
          @click="isLogin = true; feedback.show = false"
          :class="isLogin ? 'bg-white text-[#06387d] shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="py-2.5 rounded-xl transition cursor-pointer text-center"
        >
          🔑 መግቢያ (Sign In)
        </button>
        <button
          type="button"
          @click="isLogin = false; feedback.show = false"
          :class="!isLogin ? 'bg-white text-[#06387d] shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="py-2.5 rounded-xl transition cursor-pointer text-center"
        >
          📝 አዲስ ምዝገባ (Register)
        </button>
      </div>

      <!-- Feedback Alert -->
      <div
        v-if="feedback.show"
        :class="feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
        class="p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all"
      >
        <span>{{ feedback.message }}</span>
        <button @click="feedback.show = false" class="text-slate-400 hover:text-slate-600 font-bold ml-2">✕</button>
      </div>

      <!-- ══════════════ 1. LOGIN FORM ══════════════ -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1.5">
            የተማሪ/ሰራተኛ መታወቂያ ወይም ኢሜይል (ID / Email) *
          </label>
          <input
            v-model="loginForm.identifier"
            required
            type="text"
            placeholder="e.g. UGR/1245/14 or student@mkau.edu.et"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold uppercase text-slate-600">የይለፍ ቃል (Password) *</label>
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <input
            v-model="loginForm.password"
            required
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'እየገባ ነው...' : 'ግባ (Sign In)' }}</span>
        </button>

        <!-- Demo Quick Select -->
        <div class="pt-3 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase text-center mb-2">⚡ የሙከራ አካውንቶች (Quick Demo Logins):</p>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              @click="fillDemo('admin')"
              class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition text-center"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              @click="fillDemo('librarian')"
              class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition text-center"
            >
              📚 Librarian
            </button>
            <button
              type="button"
              @click="fillDemo('student')"
              class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition text-center"
            >
              🎓 Student
            </button>
          </div>
        </div>
      </form>

      <!-- ══════════════ 2. REGISTER FORM (NO OTP) ══════════════ -->
      <form v-else @submit.prevent="handleRegister" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">ሙሉ ስም (Full Name) *</label>
          <input
            v-model="registerForm.name"
            required
            type="text"
            placeholder="e.g. Abebe Bikila"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">መታወቂያ ቁጥር (ID) *</label>
            <input
              v-model="registerForm.userId"
              required
              type="text"
              placeholder="e.g. UGR/1245/14"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">የመለያ አይነት (Role)</label>
            <select
              v-model="registerForm.userType"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition font-medium"
            >
              <option value="Student">🎓 Student (ተማሪ)</option>
              <option value="Faculty">👨‍🏫 Faculty (መምህር / ፋከልቲ)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">ኢሜይል (Email Address) *</label>
          <input
            v-model="registerForm.email"
            required
            type="email"
            placeholder="e.g. abebe@mkau.edu.et"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">የትምህርት ክፍል (Department)</label>
          <input
            v-model="registerForm.department"
            type="text"
            placeholder="e.g. Computer Science, Law, Medicine..."
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">የይለፍ ቃል *</label>
            <input
              v-model="registerForm.password"
              required
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">አረጋግጥ *</label>
            <input
              v-model="registerForm.passwordConfirm"
              required
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'እየተመዘገበ ነው...' : 'ተመዝገብና ግባ (Register & Sign In)' }}</span>
        </button>
      </form>

      <!-- Back to Catalog link -->
      <div class="text-center pt-2">
        <NuxtLink to="/search" class="text-xs text-slate-500 hover:text-blue-700 font-semibold transition">
          ← ወደ መጻሕፍት ማውጫ ተመለስ (Back to Books Catalog)
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
