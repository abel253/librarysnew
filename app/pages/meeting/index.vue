<!-- app/pages/meeting/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const customRoomCode = ref('MAU-DIRECTOR-LIB')

const joinMeeting = (room?: string) => {
  const code = (room || customRoomCode.value).trim().toUpperCase()
  if (code) {
    router.push(`/meeting/${code}`)
  }
}

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
    
    <div class="max-w-md w-full bg-[#161b22] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
      <div class="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
        🏛️
      </div>

      <div>
        <h1 class="text-xl sm:text-2xl font-black text-white">MAU Library Staff Video Conference</h1>
        <p class="text-xs text-slate-400 mt-1">የመቅደላ አምባ ዩኒቨርሲቲ ቤተ-መጽሐፍት ዲሬክተር እና የሰራተኞች የቀጥታ የቪዲዮ ስብሰባ</p>
      </div>

      <!-- Quick Launch Default Rooms -->
      <div class="space-y-2.5 text-left">
        <label class="block text-[11px] font-bold uppercase text-slate-400">Available Meeting Channels:</label>
        
        <div
          @click="joinMeeting('MAU-DIRECTOR-LIB')"
          class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <p class="font-bold text-xs text-white group-hover:text-emerald-300 transition">Director & Head Librarian Room</p>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">Room: MAU-DIRECTOR-LIB • Live Consultation</p>
          </div>
          <span class="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">Join →</span>
        </div>

        <div
          @click="joinMeeting('MAU-CIRCULATION-SYNC')"
          class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p class="font-bold text-xs text-white group-hover:text-blue-300 transition">Circulation Desk & Stacks Review</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Room: MAU-CIRCULATION-SYNC • Daily Sync</p>
          </div>
          <span class="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">Join →</span>
        </div>
      </div>

      <!-- Custom Room Code Input -->
      <div class="pt-2 border-t border-white/10 space-y-2">
        <label class="block text-[11px] font-bold uppercase text-slate-400 text-left">ወይም በክፍል ኮድ ግባ (Or Enter Custom Room Code):</label>
        <div class="flex gap-2">
          <input
            v-model="customRoomCode"
            type="text"
            placeholder="e.g. MAU-ROOM-01"
            class="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500 uppercase"
            @keyup.enter="joinMeeting()"
          />
          <button
            @click="joinMeeting()"
            class="px-4 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
          >
            Launch
          </button>
        </div>
      </div>

      <!-- Back to Dashboard -->
      <div class="pt-2">
        <NuxtLink
          :to="authStore.isAdmin ? '/admin' : '/librarian'"
          class="text-xs text-slate-400 hover:text-white transition font-medium"
        >
          ← ወደ ዳሽቦርድ ተመለስ (Back to Dashboard)
        </NuxtLink>
      </div>

    </div>

  </div>
</template>
