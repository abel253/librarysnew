<template>
  <div class="space-y-6">
    <!-- HERO BANNER -->
    <div class="relative rounded-3xl overflow-hidden shadow-md text-white min-h-[160px] flex items-center">
      <img 
        src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1500&q=80" 
        alt="MAU Library Interior" 
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-[#041a42]/95 via-[#082a63]/90 to-[#0c397a]/75 backdrop-blur-[1px]"></div>

      <div class="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5 max-w-xl">
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">MAU-LCS Admin Dashboard</h2>
          <p class="text-xs sm:text-sm text-blue-100 font-medium">
            Manage the library, track activities and provide better services.
          </p>
          <div class="w-16 h-1 bg-amber-400 rounded-full mt-2"></div>
        </div>

        <!-- Date Badge -->
        <div class="bg-[#0b2554]/90 border border-white/20 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-lg flex items-center gap-3.5 self-start md:self-auto">
          <div class="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
            <Calendar :size="20" />
          </div>
          <div>
            <p class="text-sm font-black text-amber-300">2/09/2018 E.C</p>
            <p class="text-[11px] text-blue-200">{{ currentDateFormatted }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Operating Status & Broadcast Control Card -->
    <div class="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div 
          :class="[
            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
            statusStore.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' :
            statusStore.status === 'CLOSED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
          ]"
        >
          <Clock :size="24" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-black text-slate-900">የቤተ-መጽሐፍት የአገልግሎት ሰዓት እና ሁኔታ (Operating Status)</h3>
            <span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white', statusStore.statusBadgeColor]">
              {{ statusStore.statusBadgeText }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ statusStore.noticeMessage }} • <strong>የሚከፈተው፡ {{ statusStore.reopenTime }}</strong>
          </p>
        </div>
      </div>

      <button 
        type="button"
        @click="$emit('open-status-modal')"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06387d] hover:bg-[#1b62db] text-white text-xs font-bold transition shadow-xs cursor-pointer self-stretch md:self-auto justify-center"
      >
        <Megaphone :size="14" />
        <span>ሁኔታ ቀይር / ማሳወቂያ አሳውቅ (Change Status)</span>
      </button>
    </div>

    <!-- 4 STATS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Books (Blue) -->
      <div class="bg-[#1976d2] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div class="p-3 bg-white/15 rounded-2xl">
          <BookOpen :size="32" class="text-white" />
        </div>
        <div class="text-right">
          <p class="text-3xl font-black">{{ statsData.totalBooks?.toLocaleString() || '3,995' }}</p>
          <p class="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Books</p>
          <span class="text-[11px] font-bold text-blue-200 flex items-center justify-end gap-1 mt-0.5">
            ↑ 12%
          </span>
        </div>
      </div>

      <!-- Total Students (Teal/Green) -->
      <div class="bg-[#00897b] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div class="p-3 bg-white/15 rounded-2xl">
          <Users :size="32" class="text-white" />
        </div>
        <div class="text-right">
          <p class="text-3xl font-black">{{ statsData.totalStudents?.toLocaleString() || '12,480' }}</p>
          <p class="text-xs font-semibold text-teal-100 uppercase tracking-wider">Total Students</p>
          <span class="text-[11px] font-bold text-teal-200 flex items-center justify-end gap-1 mt-0.5">
            ↑ 8%
          </span>
        </div>
      </div>

      <!-- Total Borrows (Purple) -->
      <div class="bg-[#6a1b9a] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div class="p-3 bg-white/15 rounded-2xl">
          <ArrowLeftRight :size="32" class="text-white" />
        </div>
        <div class="text-right">
          <p class="text-3xl font-black">{{ statsData.totalBorrows?.toLocaleString() || '2,340' }}</p>
          <p class="text-xs font-semibold text-purple-100 uppercase tracking-wider">Total Borrows</p>
          <span class="text-[11px] font-bold text-purple-200 flex items-center justify-end gap-1 mt-0.5">
            ↑ 15%
          </span>
        </div>
      </div>

      <!-- Active Users (Orange) -->
      <div class="bg-[#ef6c00] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div class="p-3 bg-white/15 rounded-2xl">
          <Calendar :size="32" class="text-white" />
        </div>
        <div class="text-right">
          <p class="text-3xl font-black">{{ statsData.activeUsers?.toLocaleString() || '1,245' }}</p>
          <p class="text-xs font-semibold text-amber-100 uppercase tracking-wider">Active Users</p>
          <span class="text-[11px] font-bold text-amber-200 flex items-center justify-end gap-1 mt-0.5">
            ↑ 10%
          </span>
        </div>
      </div>
    </div>

    <!-- CHARTS & RECENT ACTIVITY SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- 1. Line Chart: Library Usage Overview -->
      <div class="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <BarChart3 :size="18" class="text-blue-600" /> Library Usage Overview
          </h3>
          <div class="flex items-center gap-3 text-xs font-bold">
            <span class="flex items-center gap-1.5 text-blue-600">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Borrowings
            </span>
            <span class="flex items-center gap-1.5 text-emerald-600">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Returns
            </span>
          </div>
        </div>

        <div class="h-48 w-full relative pt-2">
          <svg viewBox="0 0 400 160" class="w-full h-full overflow-visible">
            <line x1="40" y1="20" x2="390" y2="20" stroke="#f1f5f9" stroke-width="1.5" />
            <line x1="40" y1="60" x2="390" y2="60" stroke="#f1f5f9" stroke-width="1.5" />
            <line x1="40" y1="100" x2="390" y2="100" stroke="#f1f5f9" stroke-width="1.5" />
            <line x1="40" y1="140" x2="390" y2="140" stroke="#e2e8f0" stroke-width="1.5" />

            <text x="10" y="24" fill="#94a3b8" font-size="10" font-weight="bold">2,000</text>
            <text x="10" y="64" fill="#94a3b8" font-size="10" font-weight="bold">1,500</text>
            <text x="10" y="104" fill="#94a3b8" font-size="10" font-weight="bold">1,000</text>
            <text x="10" y="144" fill="#94a3b8" font-size="10" font-weight="bold">0</text>

            <polyline fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="60,110 120,95 180,85 240,65 300,50 360,40" />
            <circle cx="60" cy="110" r="4" fill="#2563eb" />
            <circle cx="120" cy="95" r="4" fill="#2563eb" />
            <circle cx="180" cy="85" r="4" fill="#2563eb" />
            <circle cx="240" cy="65" r="4" fill="#2563eb" />
            <circle cx="300" cy="50" r="4" fill="#2563eb" />
            <circle cx="360" cy="40" r="4" fill="#2563eb" />

            <polyline fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="60,125 120,110 180,110 240,105 300,95 360,90" />
            <circle cx="60" cy="125" r="4" fill="#10b981" />
            <circle cx="120" cy="110" r="4" fill="#10b981" />
            <circle cx="180" cy="110" r="4" fill="#10b981" />
            <circle cx="240" cy="105" r="4" fill="#10b981" />
            <circle cx="300" cy="95" r="4" fill="#10b981" />
            <circle cx="360" cy="90" r="4" fill="#10b981" />

            <text x="50" y="156" fill="#94a3b8" font-size="10" font-weight="bold">Jan</text>
            <text x="110" y="156" fill="#94a3b8" font-size="10" font-weight="bold">Feb</text>
            <text x="170" y="156" fill="#94a3b8" font-size="10" font-weight="bold">Mar</text>
            <text x="230" y="156" fill="#94a3b8" font-size="10" font-weight="bold">Apr</text>
            <text x="290" y="156" fill="#94a3b8" font-size="10" font-weight="bold">May</text>
            <text x="350" y="156" fill="#94a3b8" font-size="10" font-weight="bold">Jun</text>
          </svg>
        </div>
      </div>

      <!-- 2. Donut Chart: Book Access Distribution -->
      <div class="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <h3 class="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-2">
          <Sparkles :size="18" class="text-amber-500" /> Book Access Distribution
        </h3>

        <div class="flex items-center justify-center gap-6 py-2">
          <div class="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" stroke-width="4.5" />
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1d68ed" stroke-width="4.5" stroke-dasharray="60 40" stroke-dashoffset="0" />
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10b981" stroke-width="4.5" stroke-dasharray="20 80" stroke-dashoffset="-60" />
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#8b5cf6" stroke-width="4.5" stroke-dasharray="10 90" stroke-dashoffset="-80" />
            </svg>
            <div class="absolute flex flex-col items-center justify-center text-center">
              <span class="text-xl font-black text-slate-900 leading-none">68%</span>
              <span class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Open Shelf</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#1d68ed]"></span>
              <div>
                <p class="font-bold text-slate-800">Open Shelf</p>
                <p class="text-[10px] text-slate-400 font-medium">(68%)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#10b981]"></span>
              <div>
                <p class="font-bold text-slate-800">Closed Shelf</p>
                <p class="text-[10px] text-slate-400 font-medium">(22%)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#8b5cf6]"></span>
              <div>
                <p class="font-bold text-slate-800">Others</p>
                <p class="text-[10px] text-slate-400 font-medium">(10%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Recent Activities Feed -->
      <div class="lg:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <span class="text-amber-500">⚡</span> Recent Activities
          </h3>
          <button @click="$emit('select-tab', 'borrowing')" class="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All →</button>
        </div>

        <div class="space-y-3">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ArrowLeftRight :size="13" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-800 truncate">{{ activity.text }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM SECTION: TOP BOOKS & FEATURES -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Top Borrowed Books -->
      <div class="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <span class="text-amber-500">🏆</span> Top Borrowed Books
          </h3>
          <button @click="$emit('select-tab', 'books')" class="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All →</button>
        </div>

        <div class="space-y-3">
          <div v-for="(book, index) in topBooks" :key="book.id" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="w-5 text-xs font-black text-slate-400">{{ index + 1 }}</span>
              <div class="w-8 h-8 rounded-lg bg-blue-900 text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0">
                {{ book.tag }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate max-w-[150px]">{{ book.title }}</p>
                <p class="text-[10px] text-slate-400 truncate">{{ book.author }}</p>
              </div>
            </div>
            <span class="text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono shrink-0">
              {{ book.borrows }} times
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts Grid -->
      <div class="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Star :size="16" class="text-amber-500 fill-amber-500" /> Library Circulation Shortcuts
          </h3>
          <span class="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Quick Actions</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button @click="$emit('select-tab', 'books')" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <BookOpen :size="22" class="text-blue-600" />
            <p class="text-[11px] font-black text-slate-800">Books</p>
            <span class="text-[9px] text-slate-400">Catalogue</span>
          </button>

          <button @click="$emit('select-tab', 'closed-shelf')" class="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200/60 hover:border-amber-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <Lock :size="22" class="text-amber-600" />
            <p class="text-[11px] font-black text-slate-800">Closed Shelf</p>
            <span class="text-[9px] text-slate-400">Approvals</span>
          </button>

          <button @click="$emit('select-tab', 'borrowing')" class="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200/60 hover:border-teal-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <ArrowLeftRight :size="22" class="text-teal-600" />
            <p class="text-[11px] font-black text-slate-800">Loans</p>
            <span class="text-[9px] text-slate-400">& Returns</span>
          </button>

          <button @click="$emit('select-tab', 'proposals')" class="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <FileText :size="22" class="text-indigo-600" />
            <p class="text-[11px] font-black text-slate-800">Research</p>
            <span class="text-[9px] text-slate-400">Proposals</span>
          </button>

          <button @click="$emit('select-tab', 'reports')" class="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <BarChart3 :size="22" class="text-rose-600" />
            <p class="text-[11px] font-black text-slate-800">Reports</p>
            <span class="text-[9px] text-slate-400">& Analytics</span>
          </button>

          <button @click="$emit('select-tab', 'meetings')" class="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-200 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer">
            <Video :size="22" class="text-emerald-600" />
            <p class="text-[11px] font-black text-slate-800">Video</p>
            <span class="text-[9px] text-slate-400">Meetings</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useServiceStatusStore } from '~/stores/serviceStatus'
import {
  Calendar,
  BookOpen,
  Users,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  Star,
  Lock,
  FileText,
  Video,
  Clock,
  Megaphone
} from 'lucide-vue-next'

const statusStore = useServiceStatusStore()

const props = defineProps<{
  statsData: any
}>()

defineEmits<{
  (e: 'select-tab', tab: string): void
  (e: 'open-status-modal'): void
}>()

const currentDateFormatted = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

const topBooks = computed(() => {
  return props.statsData?.topBooks || [
    { id: 1, title: 'Introduction to Algorithms', author: 'Cormen et al.', tag: 'CS', borrows: 420 },
    { id: 2, title: 'Harrison\'s Principles of Medicine', author: 'Kasper et al.', tag: 'MED', borrows: 380 },
    { id: 3, title: 'Fundamentals of Database Systems', author: 'Elmasri & Navathe', tag: 'CS', borrows: 310 },
    { id: 4, title: 'Structural Analysis', author: 'R.C. Hibbeler', tag: 'ENG', borrows: 290 }
  ]
})

const recentActivities = computed(() => {
  return props.statsData?.recentActivities || [
    { id: 1, text: 'Abebe Kebede borrowed "Computer Networks"', time: '10 mins ago' },
    { id: 2, text: 'Sara Tesfaye returned "Clinical Surgery"', time: '25 mins ago' },
    { id: 3, text: 'Closed Shelf request approved for Almaz Hailu', time: '1 hour ago' }
  ]
})
</script>
