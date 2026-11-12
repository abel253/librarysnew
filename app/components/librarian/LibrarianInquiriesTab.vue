<template>
  <div class="space-y-6">
    <!-- Header & Summary Stats -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquareText :size="24" class="text-blue-600" /> 
          <span>Student Inquiries & Helpdesk (የተማሪዎች ጥያቄዎች እና መልዕክቶች)</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          በ Contact / Help ቅጽ በኩል የተላኩ የተማሪዎች ጥያቄዎች በቀጥታ ለላይብረሪያኑ የሚደርሱበት ገጽ
        </p>
      </div>

      <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
        <button 
          @click="$emit('refresh')" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          title="Refresh Inquiries"
        >
          <RefreshCw :size="14" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Mini Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">ጠቅላላ ጥያቄዎች (Total)</span>
          <p class="text-2xl font-black text-slate-900 font-mono mt-0.5">{{ inquiries.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Inbox :size="20" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-2xs flex items-center justify-between bg-rose-50/20">
        <div>
          <span class="text-[10px] font-black uppercase text-rose-600 tracking-wider">ያልተነበቡ / አዲስ (Unread)</span>
          <p class="text-2xl font-black text-rose-700 font-mono mt-0.5">{{ unreadCount }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle :size="20" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-2xs flex items-center justify-between bg-emerald-50/20">
        <div>
          <span class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">ምላሽ የተሰጣቸው (Resolved)</span>
          <p class="text-2xl font-black text-emerald-800 font-mono mt-0.5">{{ resolvedCount }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 :size="20" />
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      
      <!-- Search & Filters -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="f in ['ALL', 'UNREAD', 'RESOLVED']"
            :key="f"
            type="button"
            @click="activeStatusFilter = f"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
              activeStatusFilter === f 
                ? 'bg-[#06387d] text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ f === 'ALL' ? 'ሁሉንም (All)' : (f === 'UNREAD' ? 'ያልተነበቡ (Unread)' : 'የተፈቱ (Resolved)') }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by student name, ID, email..." 
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition" 
          />
        </div>
      </div>

      <!-- Inquiries List -->
      <div class="space-y-4">
        
        <!-- Individual Inquiry Card -->
        <div 
          v-for="item in filteredInquiries" 
          :key="item.id"
          :class="[
            'p-4 sm:p-5 rounded-2xl border transition-all space-y-3',
            item.status === 'UNREAD' 
              ? 'bg-blue-50/40 border-blue-200 shadow-2xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          ]"
        >
          <!-- Card Header: Student Info & Category -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 text-sm shadow-xs"
                :class="item.status === 'UNREAD' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-slate-400'"
              >
                {{ (item.name || 'P').charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-black text-slate-900 text-sm">{{ item.name }}</h4>
                  <span 
                    v-if="item.status === 'UNREAD'" 
                    class="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white animate-pulse"
                  >
                    አዲስ (New)
                  </span>
                  <span 
                    v-else 
                    class="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800"
                  >
                    ተፈቷል (Resolved)
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span v-if="item.studentId && item.studentId !== 'N/A'">ID: {{ item.studentId }}</span>
                  <span v-if="item.studentId && item.studentId !== 'N/A'">•</span>
                  <span>{{ item.email }}</span>
                  <span v-if="item.phone && item.phone !== 'N/A'">• {{ item.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Category Badge & Time -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider',
                  item.category.includes('Book') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  item.category.includes('Digital') ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                  'bg-blue-100 text-blue-900 border border-blue-200'
                ]"
              >
                {{ item.category }}
              </span>
              <span class="text-[11px] text-slate-400 font-medium">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Message Body -->
          <div class="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-800 leading-relaxed">
            <p class="font-medium whitespace-pre-wrap">{{ item.message }}</p>
          </div>

          <!-- Card Actions -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div class="flex items-center gap-2">
              <!-- Direct Email Reply -->
              <a 
                :href="`mailto:${item.email}?subject=${encodeURIComponent('Re: MAU Library Inquiry - ' + item.category)}&body=${encodeURIComponent('Dear ' + item.name + ',\n\nRegarding your inquiry at Mekdela Amba University Library:\n\n')}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs border border-blue-200"
              >
                <Mail :size="13" />
                <span>በኢሜይል ምላሽ ስጥ (Reply Email)</span>
              </a>

              <!-- Direct Phone Call if available -->
              <a 
                v-if="item.phone && item.phone !== 'N/A'"
                :href="`tel:${item.phone}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <Phone :size="13" />
                <span>ደውል (Call)</span>
              </a>
            </div>

            <!-- Mark Resolved / Unread Action -->
            <div>
              <button 
                v-if="item.status === 'UNREAD'"
                type="button"
                @click="updateInquiryStatus(item.id, 'RESOLVED')"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check :size="13" />
                <span>ተፈትቷል / አረጋግጥ (Mark Resolved)</span>
              </button>
              <button 
                v-else
                type="button"
                @click="updateInquiryStatus(item.id, 'UNREAD')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
              >
                <span>እንደገና ክፈት (Reopen)</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Empty State -->
        <div v-if="filteredInquiries.length === 0" class="p-12 text-center text-slate-400 space-y-2">
          <Inbox :size="36" class="mx-auto text-slate-300" />
          <p class="text-sm font-bold text-slate-600">ምንም የተማሪ የእርዳታ ጥያቄ አልተገኘም</p>
          <p class="text-xs">No inquiries matching the selected filter or search term</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  MessageSquareText, 
  RefreshCw, 
  Inbox, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Mail, 
  Phone, 
  Check 
} from 'lucide-vue-next'

const props = defineProps<{
  inquiries: any[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'update-status', payload: { id: number; status: string }): void
}>()

const searchQuery = ref('')
const activeStatusFilter = ref('ALL')

const unreadCount = computed(() => {
  return (props.inquiries || []).filter(i => i.status === 'UNREAD').length
})

const resolvedCount = computed(() => {
  return (props.inquiries || []).filter(i => i.status === 'RESOLVED').length
})

const filteredInquiries = computed(() => {
  let list = props.inquiries || []

  if (activeStatusFilter.value !== 'ALL') {
    list = list.filter(i => i.status === activeStatusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(i => 
      (i.name || '').toLowerCase().includes(q) ||
      (i.studentId || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q) ||
      (i.category || '').toLowerCase().includes(q) ||
      (i.message || '').toLowerCase().includes(q)
    )
  }

  return list
})

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateInquiryStatus = (id: number, status: string) => {
  emit('update-status', { id, status })
}
</script>
