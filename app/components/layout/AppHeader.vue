<template>
  <header class="relative w-full z-50 bg-gradient-to-r from-[#006ea6] via-[#0194d3] to-[#01ACF2] shadow-md">
    
    <!-- ==================== DESKTOP HEADER ==================== -->
    <div class="hidden lg:block relative h-[88px] xl:h-[92px]">
      
      <!-- TOP UTILITIES ROW (Top-Right) -->
      <div class="container-custom flex justify-end items-center pt-1.5 pb-1 text-white text-[11px] font-medium gap-2.5 relative z-20">
        <!-- Compact Search Bar (Functional) -->
        <form @submit.prevent="handleDesktopSearch" class="relative mr-2">
          <input 
            v-model="desktopSearchQuery"
            type="text" 
            placeholder="Search books, author, ISBN..." 
            class="bg-white/15 hover:bg-white/25 focus:bg-white focus:text-[#0B2545] text-white border border-white/30 rounded-full pl-3 pr-7 py-0.5 text-[11px] w-44 xl:w-56 focus:outline-none transition-all placeholder-white/70 shadow-inner"
          />
          <button type="submit" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
        
        <!-- Live Library Operating Status Indicator -->
        <div 
          :class="[
            'hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition shadow-2xs mr-1',
            statusStore.status === 'OPEN' ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50' :
            statusStore.status === 'CLOSED' ? 'bg-rose-500/30 text-rose-200 border-rose-400/60 animate-pulse' :
            'bg-amber-500/25 text-amber-200 border-amber-400/50'
          ]"
          :title="statusStore.noticeMessage + ' • ' + statusStore.reopenTime"
        >
          <span :class="['w-1.5 h-1.5 rounded-full', statusStore.statusBadgeColor]"></span>
          <span>{{ statusStore.status === 'OPEN' ? 'ክፍት ነው (Open)' : (statusStore.status === 'CLOSED' ? 'ዝግ ነው (Closed)' : 'Notice') }}</span>
        </div>

        <!-- User Auth State -->
        <template v-if="authStore.isAuthenticated">
          <!-- Notification Bell in Public Header -->
          <div class="mr-1">
            <SharedNotificationDropdown />
          </div>

          <span class="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            👤 {{ authStore.user?.name || 'User' }} ({{ authStore.userRoleBadge }})
          </span>

          <!-- Role-specific quick link -->
          <NuxtLink v-if="authStore.isAdmin" to="/admin" class="hover:text-amber-300 font-bold transition-colors">
            ⚙️ Admin
          </NuxtLink>
          <NuxtLink v-else-if="authStore.isLibrarian" to="/librarian" class="hover:text-amber-300 font-bold transition-colors">
            📖 Librarian
          </NuxtLink>
          <NuxtLink v-else to="/my-borrows" class="hover:text-amber-300 font-bold transition-colors">
            📚 My Borrows
          </NuxtLink>

          <span class="text-white/40 text-[10px]">|</span>
          <button @click="authStore.logout()" class="hover:text-rose-200 text-amber-200 font-bold transition-colors cursor-pointer">
            Sign Out
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/auth" class="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-3 py-0.5 rounded-full transition shadow-xs">
            🔑 Sign In
          </NuxtLink>
        </template>
        <span class="text-white/40 text-[10px]">|</span>
        
        <NuxtLink to="/contact" class="hover:text-amber-300 transition-colors">Help</NuxtLink>
        <span class="text-white/40 text-[10px]">|</span>
        
        <!-- Language Selector -->
        <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>EN</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- BRANDING: LOGO, TITLE & MOTTO (Left Side) -->
      <div class="absolute left-4 xl:left-8 top-1.5 flex items-center z-20 pointer-events-none">
        <!-- Diamond Logo -->
        <NuxtLink to="/" class="relative w-14 h-14 xl:w-16 xl:h-16 flex items-center justify-center mr-3 xl:mr-4 shrink-0 pointer-events-auto">
          <div class="w-11 h-11 xl:w-12 xl:h-12 bg-white rotate-45 overflow-hidden border-[2px] border-white/80 shadow-md flex items-center justify-center">
            <img src="~/assets/images/maus.jpg" class="w-[140%] h-[140%] -rotate-45 object-contain" alt="MAU Logo" />
          </div>
        </NuxtLink>
        
        <!-- Text Group -->
        <div class="text-white drop-shadow-sm select-none">
          <h1 class="text-white text-base xl:text-lg font-serif font-bold tracking-wide leading-tight">
            Mekdela Amba University
          </h1>
          <h2 class="text-amber-300 text-xs xl:text-sm font-serif font-semibold tracking-wide leading-tight">
            መቅደላ አምባ ዩኒቨርሲቲ
          </h2>
          <!-- University Motto -->
          <p class="text-blue-100/85 text-[10px] xl:text-[11px] font-medium tracking-wide mt-0.5">
            Knowledge <span class="text-amber-300 font-bold">•</span> Innovation <span class="text-amber-300 font-bold">•</span> Service for Society
          </p>
        </div>
      </div>

      <!-- DESKTOP SLENDER WHITE NAV BAR (Bottom Right with Smooth Curve) -->
      <div class="absolute bottom-0 right-0 h-8 xl:h-8.5 z-30 flex items-end">
        
        <!-- Smooth Left Curve -->
        <svg class="h-full w-9 text-white/95 fill-current shrink-0 -mr-[1px] pointer-events-none drop-shadow-sm" viewBox="0 0 36 34" preserveAspectRatio="none">
          <path d="M36 0 C22 0 14 34 0 34 L36 34 Z" />
        </svg>

        <!-- White Menu Bar Body -->
        <div class="h-full bg-white/95 backdrop-blur-sm shadow-md pl-2 pr-6 xl:pr-10 flex items-center">
          <ul class="flex items-center gap-1.5 xl:gap-2.5 h-full text-[#0B2545] text-[11px] xl:text-xs font-semibold">
            <li v-for="(link, index) in navLinks" :key="link.label" class="h-full flex items-center">
              <NuxtLink 
                :to="link.path" 
                :target="link.target || '_self'"
                :external="link.external || false"
                class="h-full flex items-center px-2 hover:text-[#01ACF2] transition-colors relative"
                :class="{ 'text-[#01ACF2] font-bold': $route.path === link.path }"
              >
                {{ link.label }}
                <svg v-if="link.hasDropdown" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 ml-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
                <!-- Active Underline Indicator -->
                <span v-if="$route.path === link.path" class="absolute bottom-0 left-2 right-2 h-[2.5px] bg-amber-500 rounded-t"></span>
              </NuxtLink>

              <!-- Subtle Divider Lines -->
              <span v-if="index !== navLinks.length - 1" class="text-gray-300 text-[10px] ml-1 xl:ml-1.5 select-none opacity-60">|</span>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <!-- ==================== MOBILE HEADER ==================== -->
    <div class="lg:hidden bg-gradient-to-r from-[#006ea6] to-[#01ACF2] px-4 py-2 flex items-center justify-between shadow-md">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <div class="w-9 h-9 bg-white rotate-45 overflow-hidden flex items-center justify-center shadow">
          <img src="~/assets/images/maus.jpg" class="w-[140%] h-[140%] -rotate-45 object-contain" alt="MAU Logo" />
        </div>
        <div>
          <span class="block text-white font-serif font-bold text-sm leading-tight">Mekdela Amba</span>
          <span class="block text-amber-300 font-serif text-[10px]">ዩኒቨርሲቲ</span>
        </div>
      </NuxtLink>

      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-1.5 rounded-md text-white hover:bg-white/10 transition-colors">
        <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- MOBILE MENU CONTENT -->
    <transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="lg:hidden bg-[#f4fbff] shadow-xl border-t border-blue-100">
        <!-- Mobile User State -->
        <div class="p-3 border-b border-blue-100 bg-white">
          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>👤</span>
                <span class="truncate max-w-[150px]">{{ authStore.user?.name || 'User' }}</span>
                <span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{{ authStore.userRoleBadge }}</span>
              </span>
              <button @click="authStore.logout(); isMobileMenuOpen = false" class="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer">
                Sign Out
              </button>
            </div>
            <NuxtLink to="/my-borrows" @click="isMobileMenuOpen = false" class="block text-xs font-bold text-[#006ea6] hover:underline">
              📚 My Borrows & Requests
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/auth" @click="isMobileMenuOpen = false" class="block text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold py-2 rounded-lg text-xs shadow-xs transition">
              🔑 Sign In / Register
            </NuxtLink>
          </template>
        </div>

        <div class="p-3 border-b border-blue-100">
          <form @submit.prevent="handleMobileSearch" class="relative">
            <input 
              v-model="mobileSearchQuery" 
              type="text" 
              placeholder="Search library books..." 
              class="w-full pl-3 pr-8 py-1.5 text-xs border border-blue-200 rounded-md bg-white focus:outline-none focus:border-[#01ACF2]" 
            />
            <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#01ACF2] cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        <div class="p-2 divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.label" 
            :to="link.path" 
            :target="link.target || '_self'"
            :external="link.external || false"
            @click="isMobileMenuOpen = false"
            class="block px-3 py-2 text-xs text-[#0B2545] font-semibold hover:bg-white rounded transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>
    </transition>
    
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useServiceStatusStore } from '~/stores/serviceStatus'

const isMobileMenuOpen = ref(false)
const desktopSearchQuery = ref('')
const mobileSearchQuery = ref('')
const authStore = useAuthStore()
const statusStore = useServiceStatusStore()

const handleDesktopSearch = () => {
  if (!desktopSearchQuery.value.trim()) return
  navigateTo({
    path: '/search',
    query: { q: desktopSearchQuery.value.trim() },
  })
}

const handleMobileSearch = () => {
  if (!mobileSearchQuery.value.trim()) return
  navigateTo({
    path: '/search',
    query: { q: mobileSearchQuery.value.trim() },
  })
  isMobileMenuOpen.value = false
}

onMounted(() => {
  authStore.init()
  statusStore.fetchStatus()
})

// Dynamic Role-Aware Functional Navigation Links
const navLinks = computed(() => {
  const links = [
    { path: '/', label: 'Home', hasDropdown: false },
    { path: '/about', label: 'About', hasDropdown: true },
    { path: '/search', label: 'Search Books', hasDropdown: true },
  ]

  // If user is authenticated, show My Borrows
  if (authStore.isAuthenticated && !authStore.isAdmin && !authStore.isLibrarian) {
    links.push({ path: '/my-borrows', label: 'My Borrows', hasDropdown: false })
  }

  links.push({ path: '/research', label: 'Research', hasDropdown: true })
  
  links.push({ 
    path: 'https://lms.mkau.edu.et/', 
    label: 'Student Portal', 
    hasDropdown: false, 
    target: '_blank', 
    external: true 
  })


  // Strict Role Segregation for Staff Portals:
  // 1. Admin logs in -> Admin link is visible, Librarian is HIDDEN
  if (authStore.isAdmin) {
    links.push({ path: '/admin', label: 'Admin', hasDropdown: false })
  }
  // 2. Librarian logs in -> Librarian link is visible, Admin is HIDDEN
  else if (authStore.isLibrarian) {
    links.push({ path: '/librarian', label: 'Librarian', hasDropdown: false })
  }
  // 3. Student or Faculty logs in -> NEITHER Admin NOR Librarian is visible!

  return links
})
</script>

<style scoped>
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: all 0.25s ease-in-out;
  max-height: 400px;
  overflow: hidden;
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>