<template>
  <div class="relative" ref="dropdownRef">
    <!-- Notification Bell Trigger -->
    <button 
      type="button"
      @click="toggleDropdown" 
      class="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
      title="Notifications"
    >
      <Bell class="w-5 h-5 text-slate-700 hover:text-blue-600 transition-colors" />
      <span 
        v-if="unreadCount > 0" 
        class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown Panel -->
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
        class="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden font-sans select-none"
      >
        <!-- Header -->
        <div class="p-4 bg-gradient-to-r from-blue-900 to-[#006ea6] text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Bell :size="16" class="text-amber-300" />
            <span class="text-xs font-black tracking-wide">ማሳወቂያዎች (Notifications)</span>
            <span v-if="unreadCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {{ unreadCount }} አዲስ
            </span>
          </div>

          <button 
            v-if="unreadCount > 0"
            @click="markAllRead" 
            class="text-[11px] font-bold text-blue-100 hover:text-white hover:underline cursor-pointer transition"
          >
            ሁሉንም አንብብ (Mark all read)
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          <div 
            v-for="item in notifications" 
            :key="item.id"
            @click="handleNotificationClick(item)"
            :class="[
              'p-3.5 hover:bg-blue-50/50 transition cursor-pointer flex items-start gap-3',
              !item.read ? 'bg-blue-50/30' : ''
            ]"
          >
            <!-- Type Icon -->
            <div 
              :class="[
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5',
                item.type === 'return' ? 'bg-emerald-100 text-emerald-700' :
                item.type === 'request' ? 'bg-amber-100 text-amber-700' :
                item.type === 'borrow' ? 'bg-blue-100 text-blue-700' :
                item.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-700'
              ]"
            >
              <RotateCcw v-if="item.type === 'return'" :size="14" />
              <Lock v-else-if="item.type === 'request'" :size="14" />
              <ArrowLeftRight v-else-if="item.type === 'borrow'" :size="14" />
              <Video v-else-if="item.type === 'meeting'" :size="14" />
              <Info v-else :size="14" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <h4 class="text-xs font-black text-slate-900 truncate" :class="{ 'text-blue-900': !item.read }">
                  {{ item.title }}
                </h4>
                <span class="text-[10px] text-slate-400 font-medium shrink-0">{{ item.createdAt }}</span>
              </div>
              <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {{ item.message }}
              </p>
            </div>

            <!-- Unread Blue Dot -->
            <span v-if="!item.read" class="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
          </div>

          <!-- Empty State -->
          <div v-if="notifications.length === 0" class="p-8 text-center text-slate-400 space-y-2">
            <BellOff :size="28" class="mx-auto text-slate-300" />
            <p class="text-xs font-bold">ምንም አዲስ ማሳወቂያ የለም</p>
            <p class="text-[10px]">No new notifications available</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <span class="text-[10px] text-slate-400 font-medium">MAU Library Notification Hub</span>
        </div>

      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { 
  Bell, 
  BellOff, 
  RotateCcw, 
  Lock, 
  ArrowLeftRight, 
  Video, 
  Info 
} from 'lucide-vue-next'
import { useNotificationsStore, type AppNotification } from '~/stores/notifications'

const emit = defineEmits<{
  (e: 'select-tab', tab: string): void
}>()

const notificationsStore = useNotificationsStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const notifications = computed(() => notificationsStore.allNotifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const markAllRead = () => {
  notificationsStore.markAllAsRead()
}

const handleNotificationClick = (item: AppNotification) => {
  notificationsStore.markAsRead(item.id)
  isOpen.value = false

  if (item.tab) {
    emit('select-tab', item.tab)
  } else if (item.link) {
    navigateTo(item.link)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  notificationsStore.initNotifications()
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
