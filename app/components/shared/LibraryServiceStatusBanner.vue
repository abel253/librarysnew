<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div 
      v-if="statusStore.shouldShowBanner" 
      :class="[
        'w-full text-white text-xs z-50 shadow-md transition-colors relative',
        statusStore.status === 'CLOSED' ? 'bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 border-b-2 border-rose-400' :
        statusStore.status === 'MAINTENANCE' ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-b-2 border-amber-400' :
        'bg-gradient-to-r from-[#004f77] via-[#006ea6] to-[#0194d3] border-b-2 border-sky-400'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        
        <!-- Left: Status Badge & Message -->
        <div class="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <span 
            :class="[
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs',
              statusStore.status === 'CLOSED' ? 'bg-rose-500 text-white animate-pulse' :
              statusStore.status === 'MAINTENANCE' ? 'bg-amber-400 text-slate-900' :
              'bg-emerald-400 text-slate-900'
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-white animate-ping" v-if="statusStore.status === 'CLOSED'"></span>
            <AlertTriangle v-if="statusStore.status === 'CLOSED'" :size="12" />
            <Megaphone v-else :size="12" />
            <span>{{ statusStore.statusBadgeText }}</span>
          </span>

          <span class="font-bold text-white tracking-wide text-xs drop-shadow-xs">
            {{ statusStore.noticeMessage }}
          </span>
        </div>

        <!-- Center: Reopen Time & Hours -->
        <div class="flex items-center gap-3 text-[11px] text-white/90 flex-wrap justify-center">
          <div v-if="statusStore.status === 'CLOSED' || statusStore.reopenTime" class="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-lg border border-white/10">
            <Clock :size="13" class="text-amber-300 shrink-0" />
            <span class="text-amber-200 font-medium">የሚከፈተው፡</span>
            <strong class="text-white font-black">{{ statusStore.reopenTime }}</strong>
          </div>

          <div class="hidden md:flex items-center gap-1 text-white/80">
            <Calendar :size="13" class="shrink-0 text-sky-200" />
            <span>{{ statusStore.workingHours }}</span>
          </div>

          <!-- Dismiss Button -->
          <button 
            type="button"
            @click="statusStore.dismissBanner()" 
            class="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="Dismiss Announcement"
          >
            <X :size="15" />
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertTriangle, Megaphone, Clock, Calendar, X } from 'lucide-vue-next'
import { useServiceStatusStore } from '~/stores/serviceStatus'

const statusStore = useServiceStatusStore()

onMounted(() => {
  statusStore.fetchStatus()
})
</script>
