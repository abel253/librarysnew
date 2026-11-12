<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Video :size="26" class="text-emerald-600" />
          <span>Library Director & Staff Video Conference Hub</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          የመቅደላ አምባ ዩኒቨርሲቲ ቤተ-መጽሐፍት ዲሬክተር እና ሰራተኞች የቀጥታ የቪዲዮ ስብሰባ (WebRTC Audio/Video, Screen Share & Live Minutes)
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="startInstantMeeting"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition flex items-center gap-2"
        >
          <Video :size="16" />
          <span>ስብሰባ ጀምር (Start Instant Meeting)</span>
        </button>

        <button
          @click="$emit('schedule-room')"
          class="px-4 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
        >
          <Plus :size="16" />
          <span>+ Schedule Room</span>
        </button>

        <button
          @click="$emit('refresh')"
          class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          title="Refresh"
        >
          <RotateCcw :size="16" />
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase text-emerald-700">Live Video Channels</span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
        <p class="text-2xl font-black text-slate-900 mt-2">2 Active</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Encrypted WebRTC Audio/Video</p>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase text-blue-700">Collaboration Features</span>
        <p class="text-2xl font-black text-slate-900 mt-2">Meet Ready</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Screen Share, Live Minutes, Data Injection</p>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase text-purple-700">Recorded Directives</span>
        <p class="text-2xl font-black text-slate-900 mt-2">5 Resolutions</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Official minutes preserved in database</p>
      </div>
    </div>

    <!-- Active Meeting Rooms Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Main Chamber -->
      <div class="bg-gradient-to-br from-[#06387d] to-[#0b2554] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div class="relative z-10">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Broadcast
            </span>
            <span class="text-xs font-mono text-blue-200">Room: MAU-DIRECTOR-LIB</span>
          </div>

          <h3 class="text-xl font-black text-white mt-3">Director & Chief Librarian Briefing Room</h3>
          <p class="text-xs text-blue-100 mt-1 max-w-md">
            Direct executive video line between University Library Director and Central Librarians.
          </p>
        </div>

        <div class="pt-4 border-t border-blue-700/50 flex items-center justify-between relative z-10">
          <span class="text-xs text-amber-300 font-bold">Encrypted WebRTC Line</span>
          <button
            @click="joinRoom('MAU-DIRECTOR-LIB')"
            class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Video :size="16" />
            <span>ይግቡ (Join Call Now)</span>
          </button>
        </div>
      </div>

      <!-- Staff Coordination Chamber -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
        <div>
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
              Staff Chamber
            </span>
            <span class="text-xs font-mono text-slate-400">Room: MAU-STAFF-ROOM</span>
          </div>

          <h3 class="text-xl font-black text-slate-900 mt-3">Circulation Staff & Counter Meeting</h3>
          <p class="text-xs text-slate-500 mt-1">
            Daily shift coordination, overdue book reviews, and catalog updates.
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">Standard Meeting Room</span>
          <button
            @click="joinRoom('MAU-STAFF-ROOM')"
            class="px-5 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Video :size="16" />
            <span>Join Room</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Video, Plus, RotateCcw } from 'lucide-vue-next'

defineEmits<{
  (e: 'refresh'): void
  (e: 'schedule-room'): void
}>()

const startInstantMeeting = () => {
  navigateTo('/meeting/MAU-DIRECTOR-LIB')
}

const joinRoom = (roomId: string) => {
  navigateTo(`/meeting/${roomId}`)
}
</script>
