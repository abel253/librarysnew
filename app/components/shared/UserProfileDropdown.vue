<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button in Navbar (Exact Screenshot 2 Matching Design) -->
    <div class="flex items-center gap-2 sm:gap-3">
      
      <!-- Interactive Functional Notification Dropdown -->
      <SharedNotificationDropdown 
        @select-tab="(tab) => $emit('select-tab', tab)" 
      />

      <!-- User Profile Trigger Pill -->
      <button 
        @click="isOpen = !isOpen"
        class="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-900/5 hover:bg-slate-900/10 border border-slate-200/90 transition-all cursor-pointer focus:outline-none"
      >
        <!-- Circle Avatar with Initial or Custom Image (Strict 32px) -->
        <div 
          class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0 border border-white aspect-square"
          style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px;"
        >
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="userName" 
            class="w-full h-full object-cover object-center aspect-square block" 
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <span v-else>{{ userInitial }}</span>
        </div>

        <!-- Name & Role -->
        <div class="hidden sm:flex flex-col text-left leading-none">
          <span class="text-xs font-bold text-slate-800 tracking-tight">{{ userName }}</span>
          <div class="mt-0.5">
            <span class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
              ✦ {{ userRole }}
            </span>
          </div>
        </div>

        <!-- Chevron Down -->
        <ChevronDown 
          class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0" 
          :class="{ 'rotate-180': isOpen }" 
        />
      </button>

    </div>

    <!-- Floating Dropdown Card (Exact Screenshot 2 Design - 100% Sized & Responsive) -->
    <transition
      enter-active-class="transition ease-out duration-150 transform"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100 transform"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div 
        v-if="isOpen" 
        class="absolute right-0 mt-2.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-3xl bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden font-sans select-none"
      >
        <!-- Header Banner with Gradient Background (Matches Screenshot 2) -->
        <div class="p-4 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white relative">
          <div class="flex items-center gap-3">
            
            <!-- Large Avatar (Strict 56px Circular Thumbnail) -->
            <div class="relative group shrink-0">
              <div 
                class="w-14 h-14 rounded-full overflow-hidden bg-white/20 border-2 border-white shadow-md flex items-center justify-center text-xl font-black text-white shrink-0 aspect-square"
                style="width: 56px; height: 56px; min-width: 56px; min-height: 56px; max-width: 56px; max-height: 56px;"
              >
                <img 
                  v-if="userAvatar" 
                  :src="userAvatar" 
                  :alt="userName" 
                  class="w-full h-full object-cover object-center aspect-square block" 
                  style="width: 100%; height: 100%; object-fit: cover;"
                />
                <span v-else>{{ userInitial }}</span>
              </div>

              <!-- Quick Upload Photo Icon on Avatar -->
              <button
                type="button"
                @click="triggerAvatarUpload"
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-indigo-700 shadow-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera class="w-3.5 h-3.5" />
              </button>

              <input 
                ref="avatarFileInput" 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleQuickAvatarUpload" 
              />
            </div>

            <!-- User Details -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-black truncate leading-tight text-white drop-shadow-xs">{{ userName }}</h4>
              <p class="text-[11px] text-purple-100 font-mono mt-0.5 truncate">{{ userIdentifier }}</p>
              
              <div class="mt-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-400 text-slate-900 uppercase tracking-wider shadow-xs">
                  ✦ {{ userRole }}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Menu Items List with Chevrons (Exact Screenshot 2 Items) -->
        <div class="p-2 space-y-0.5 text-xs text-slate-700 font-semibold">
          
          <!-- My Profile -->
          <button 
            @click="navigate('settings')" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <User class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>My Profile</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <!-- My Courses / My Borrows -->
          <button 
            @click="navigate('borrowing')" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <BookOpen class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>My Courses & Borrows</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <!-- My Progress / Analytics -->
          <button 
            @click="navigate('reports')" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <TrendingUp class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>My Progress</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <!-- Messages with Badge 3 -->
          <button 
            @click="navigate('meetings')" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <Mail class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>Messages</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">3</span>
              <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </div>
          </button>

          <!-- Settings -->
          <button 
            @click="navigate('settings')" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <Settings class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>Settings</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <!-- View Public Site (ወደ ፐብሊክ ገጽ) -->
          <NuxtLink 
            to="/" 
            @click="isOpen = false" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-[#006ea6] font-bold transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <Globe class="w-4 h-4 text-[#006ea6] shrink-0" />
              <span>View Public Site (የህዝብ ገጽ)</span>
            </div>
            <ExternalLink class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006ea6] shrink-0" />
          </NuxtLink>

          <!-- Help & Support -->
          <NuxtLink 
            to="/contact" 
            @click="isOpen = false" 
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <HelpCircle class="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
              <span>Help & Support</span>
            </div>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </NuxtLink>

        </div>

        <!-- Divider Line -->
        <div class="border-t border-slate-100 my-1"></div>

        <!-- Logout Action Button -->
        <div class="p-2">
          <button 
            @click="handleLogoutClick" 
            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
          >
            <LogOut class="w-4 h-4 text-rose-600 shrink-0" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  TrendingUp,
  Mail,
  Settings,
  HelpCircle,
  LogOut,
  Camera,
  Globe,
  ExternalLink,
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'select-tab', tab: string): void
  (e: 'logout'): void
}>()

const authStore = useAuthStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)

const userName = computed(() => authStore.user?.name || (authStore.isAdmin ? 'Abebe Shewa' : (authStore.isLibrarian ? 'Abel Mekonnen' : 'Birhanu Gize')))
const userRole = computed(() => {
  const r = authStore.user?.userType || authStore.user?.role || ''
  if (r) return r.toUpperCase()
  return authStore.isAdmin ? 'ADMINISTRATOR' : (authStore.isLibrarian ? 'LIBRARIAN' : 'STUDENT')
})
const userIdentifier = computed(() => {
  return authStore.user?.phone || authStore.user?.userId || '8911111111'
})
const userAvatar = computed(() => authStore.userAvatar)
const userInitial = computed(() => {
  const name = userName.value.trim()
  return name.charAt(0).toUpperCase() || 'U'
})

const navigate = (tab: string) => {
  emit('select-tab', tab)
  isOpen.value = false
}

const handleLogoutClick = () => {
  isOpen.value = false
  emit('logout')
}

const triggerAvatarUpload = () => {
  avatarFileInput.value?.click()
}

const handleQuickAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      authStore.updateUserProfile({ avatar: result })
    }
  }
  reader.readAsDataURL(file)
}

// Close dropdown on outside click
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>