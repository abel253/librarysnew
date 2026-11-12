<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Lock :size="24" class="text-amber-500" /> Book Requests & Stack Authorizations
        </h2>
        <p class="text-xs text-slate-500 mt-1">Review student requests for Closed Stack & Open Shelf books with Short/Long loans and penalty rules.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
          {{ pendingCount }} Pending
        </span>
        <button @click="$emit('refresh')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer" title="Refresh">
          <RefreshCw :size="16" />
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-col md:flex-row gap-3 pt-2">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchQuery" type="text" placeholder="Search by student name, ID, phone, book title, ISBN..." class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 transition" />
      </div>
      
      <!-- Filter Group -->
      <div class="flex gap-2 flex-wrap items-center">
        <!-- Status Filter -->
        <div class="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
          <button v-for="st in [['all', 'All Status'], ['requested', 'Pending'], ['issued', 'Approved'], ['denied', 'Denied']]" :key="st[0]"
            @click="statusFilter = st[0]"
            :class="statusFilter === st[0] ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
            class="px-2.5 py-1 rounded-lg transition cursor-pointer">
            {{ st[1] }}
          </button>
        </div>

        <!-- Shelf Filter -->
        <div class="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
          <button v-for="sh in [['all', 'All Shelves'], ['CLOSED', '🔒 Closed'], ['OPEN', '📚 Open']]" :key="sh[0]"
            @click="shelfFilter = sh[0]"
            :class="shelfFilter === sh[0] ? 'bg-[#06387d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'"
            class="px-2.5 py-1 rounded-lg transition cursor-pointer">
            {{ sh[1] }}
          </button>
        </div>

        <!-- Loan Type Filter -->
        <div class="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
          <button v-for="lt in [['all', 'All Loans'], ['SHORT', '⚡ Short'], ['LONG', '📚 Long']]" :key="lt[0]"
            @click="loanFilter = lt[0]"
            :class="loanFilter === lt[0] ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'"
            class="px-2.5 py-1 rounded-lg transition cursor-pointer">
            {{ lt[1] }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
            <th class="py-3 px-3">Req ID</th>
            <th class="py-3 px-3">Student / Patron</th>
            <th class="py-3 px-3">Book & Shelf</th>
            <th class="py-3 px-3">Loan & Scope</th>
            <th class="py-3 px-3">Due & Penalty Rule</th>
            <th class="py-3 px-3 text-center">Status</th>
            <th class="py-3 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="req in filteredList" :key="req.id" class="hover:bg-slate-50/80 transition">
            <!-- ID & Time -->
            <td class="py-3.5 px-3">
              <span class="font-mono font-bold text-xs text-slate-600 block">#{{ req.id }}</span>
              <span class="text-[10px] text-slate-400 block whitespace-nowrap">{{ req.requestedAt || 'Recent' }}</span>
            </td>

            <!-- Student -->
            <td class="py-3.5 px-3">
              <p class="font-bold text-slate-800 text-xs">{{ req.studentName }}</p>
              <p class="text-[11px] text-slate-500 font-mono">{{ req.studentId }}</p>
              <p v-if="req.studentPhone" class="text-[10px] text-blue-600 font-medium">📞 {{ req.studentPhone }}</p>
            </td>

            <!-- Book & Shelf -->
            <td class="py-3.5 px-3">
              <p class="font-bold text-slate-900 text-xs line-clamp-1 max-w-[200px]" :title="req.bookTitle">{{ req.bookTitle }}</p>
              <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                <span 
                  :class="req.isClosed || req.shelfType === 'Closed Shelf' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1"
                >
                  <span v-if="req.isClosed || req.shelfType === 'Closed Shelf'">🔒 Closed Shelf</span>
                  <span v-else>📚 Open Shelf</span>
                </span>
                <span v-if="req.shelfNumber && req.shelfNumber !== 'N/A'" class="text-[10px] font-mono text-slate-500">
                  Shelf: {{ req.shelfNumber }}
                </span>
              </div>
            </td>

            <!-- Loan & Scope -->
            <td class="py-3.5 px-3 whitespace-nowrap">
              <div class="space-y-1">
                <span 
                  :class="req.loanType === 'SHORT' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'"
                  class="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                >
                  {{ req.loanType === 'SHORT' ? '⚡ Short Loan' : '📚 Long Loan' }} ({{ req.durationDays || (req.loanType === 'SHORT' ? 3 : 14) }}d)
                </span>
                <p class="text-[10px] text-slate-500 font-medium">Scope: {{ req.borrowScope || 'Inside/Outside' }}</p>
              </div>
            </td>

            <!-- Due & Penalty Rule -->
            <td class="py-3.5 px-3 text-xs">
              <p class="font-mono text-slate-700 font-bold">{{ req.dueDate || 'Calculated at issue' }}</p>
              <p class="text-[10px] text-rose-600 font-medium">5 ETB / day late</p>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-3 text-center whitespace-nowrap">
              <span 
                v-if="req.status === 'requested'"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse inline-block"
              >
                Pending
              </span>
              <span 
                v-else-if="req.status === 'issued'"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-block"
              >
                Approved / Issued
              </span>
              <span 
                v-else
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 inline-block"
              >
                Denied
              </span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-3 text-right whitespace-nowrap">
              <div v-if="req.status === 'requested'" class="flex items-center justify-end gap-1.5">
                <button 
                  @click="$emit('approve', req.id)" 
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                >
                  Approve
                </button>
                <button 
                  @click="$emit('deny', req.id)" 
                  class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer transition"
                >
                  Deny
                </button>
              </div>
              <span v-else class="text-xs text-slate-400 font-medium">—</span>
            </td>
          </tr>

          <tr v-if="filteredList.length === 0">
            <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
              No authorization requests matching current filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lock, RefreshCw, Search } from 'lucide-vue-next'

const props = defineProps<{
  requests: any[]
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'approve', id: number | string): void
  (e: 'deny', id: number | string): void
}>()

const searchQuery = ref('')
const statusFilter = ref('all')
const shelfFilter = ref('all')
const loanFilter = ref('all')

const pendingCount = computed(() => {
  return (props.requests || []).filter(r => r.status === 'requested').length
})

const filteredList = computed(() => {
  let list = props.requests || []
  if (statusFilter.value !== 'all') {
    list = list.filter(r => r.status === statusFilter.value)
  }
  if (shelfFilter.value === 'CLOSED') {
    list = list.filter(r => r.isClosed || String(r.shelfType).toLowerCase().includes('closed'))
  } else if (shelfFilter.value === 'OPEN') {
    list = list.filter(r => !r.isClosed && String(r.shelfType).toLowerCase().includes('open'))
  }
  if (loanFilter.value !== 'all') {
    list = list.filter(r => r.loanType === loanFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => 
      r.studentName?.toLowerCase().includes(q) ||
      r.studentId?.toLowerCase().includes(q) ||
      r.bookTitle?.toLowerCase().includes(q) ||
      r.isbn?.toLowerCase().includes(q) ||
      r.studentPhone?.toLowerCase().includes(q)
    )
  }
  return list
})
</script>
