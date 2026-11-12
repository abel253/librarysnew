<template>
  <div class="space-y-6">
    <!-- Header & Summary Stats -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowLeftRight :size="24" class="text-blue-600" /> Circulation: Borrowing & Returns
          </h2>
          <p class="text-xs text-slate-500">Manage Short-Term (1-3 Days) and Long-Term (14-30 Days) loans, checkouts, and returns.</p>
        </div>

        <button 
          @click="$emit('issue-loan')"
          class="px-4 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#0b4db0] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
        >
          <Plus :size="16" /> Issue New Loan
        </button>
      </div>

      <!-- Mini Stats Cards for Borrowing -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
          <span class="text-[11px] font-bold uppercase text-blue-700 tracking-wider">Active Loans</span>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-black text-blue-900 font-mono">{{ activeLoansCount }}</span>
            <span class="text-[10px] text-blue-600 font-medium">Currently Out</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1">
              <Zap :size="13" class="text-amber-500 fill-amber-500" /> Short Borrow
            </span>
            <span class="text-[10px] bg-amber-200/60 text-amber-800 font-bold px-1.5 py-0.5 rounded">1-3 Days</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-black text-amber-900 font-mono">{{ shortLoansCount }}</span>
            <span class="text-[10px] text-amber-700 font-medium">Reference Books</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1">
              <BookOpen :size="13" class="text-indigo-600" /> Long Borrow
            </span>
            <span class="text-[10px] bg-indigo-200/60 text-indigo-800 font-bold px-1.5 py-0.5 rounded">14-30 Days</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-black text-indigo-900 font-mono">{{ longLoansCount }}</span>
            <span class="text-[10px] text-indigo-600 font-medium">Regular Loans</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col justify-between">
          <span class="text-[11px] font-bold uppercase text-rose-700 tracking-wider">Overdue Items</span>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-black text-rose-700 font-mono">{{ overdueCount }}</span>
            <span class="text-[11px] font-bold text-rose-700 font-mono">{{ overdueCount * 15 }} ETB</span>
          </div>
        </div>
      </div>

      <!-- Filter Pills & Search Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div class="flex flex-wrap items-center gap-2">
          <button 
            @click="loanFilter = 'all'"
            :class="loanFilter === 'all' ? 'bg-[#06387d] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            All Loans ({{ loans.length }})
          </button>

          <button 
            @click="loanFilter = 'SHORT'"
            :class="loanFilter === 'SHORT' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/50'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Zap :size="12" class="fill-current" /> Short Borrow
          </button>

          <button 
            @click="loanFilter = 'LONG'"
            :class="loanFilter === 'LONG' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/50'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <BookOpen :size="12" /> Long Borrow
          </button>

          <button 
            @click="loanFilter = 'overdue'"
            :class="loanFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ⚠️ Overdue ({{ overdueCount }})
          </button>

          <button 
            @click="loanFilter = 'returned'"
            :class="loanFilter === 'returned' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ✓ Returned
          </button>
        </div>

        <div class="relative w-full md:w-72">
          <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="loanSearch"
            type="text" 
            placeholder="Search by student, ID, or book..."
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      <!-- Loans Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
              <th class="py-3 px-4">Borrower Details</th>
              <th class="py-3 px-4">Book Title & Location</th>
              <th class="py-3 px-4">Borrow Type</th>
              <th class="py-3 px-4">Timeline (Issue - Due)</th>
              <th class="py-3 px-4">Status & Fines</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="loan in filteredLoans" :key="loan.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 leading-snug">{{ loan.borrowerName || loan.studentName }}</p>
                <p class="text-xs text-slate-500 font-mono">{{ loan.borrowerId || loan.studentId }}</p>
                <span class="text-[10px] text-blue-600 font-semibold">{{ loan.department || 'Undergraduate' }}</span>
              </td>

              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 leading-snug">{{ loan.bookTitle }}</p>
                <p class="text-xs text-slate-500">{{ loan.author || 'Author N/A' }}</p>
                <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                  Shelf: {{ loan.shelfNumber || 'Regular Stacks' }}
                </p>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap">
                <span 
                  v-if="loan.loanType === 'SHORT'"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200"
                >
                  <Zap :size="12" class="text-amber-600 fill-amber-600" /> Short ({{ loan.durationDays || 3 }} Days)
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200"
                >
                  <BookOpen :size="12" class="text-blue-600" /> Long ({{ loan.durationDays || 14 }} Days)
                </span>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap text-xs">
                <div class="flex items-center gap-1 font-mono text-slate-600 font-medium">
                  <span>{{ loan.issueDate || 'Recent' }}</span>
                  <span class="text-slate-300">→</span>
                  <span :class="loan.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'">{{ loan.dueDate || 'In 14 Days' }}</span>
                </div>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap">
                <span 
                  v-if="loan.status === 'RETURNED'"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700"
                >
                  ✓ Returned
                </span>
                <span 
                  v-else-if="loan.isOverdue"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse"
                >
                  Overdue
                </span>
                <span 
                  v-else
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
                >
                  On Time
                </span>
              </td>

              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <div v-if="loan.status !== 'RETURNED'" class="flex items-center justify-end gap-2">
                  <button 
                    @click="$emit('return-book', loan.id)"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle :size="13" /> Return Book
                  </button>

                  <button 
                    @click="$emit('renew-loan', loan.id)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Renew for +7 Days"
                  >
                    <RotateCcw :size="14" />
                  </button>
                </div>
                <span v-else class="text-xs text-slate-400 font-medium">Completed</span>
              </td>
            </tr>

            <tr v-if="filteredLoans.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                No loans found matching selected filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeftRight, Plus, Zap, BookOpen, Search, CheckCircle, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  loans: any[]
}>()

defineEmits<{
  (e: 'issue-loan'): void
  (e: 'return-book', id: number | string): void
  (e: 'renew-loan', id: number | string): void
}>()

const loanFilter = ref('all')
const loanSearch = ref('')

const activeLoansCount = computed(() => (props.loans || []).filter(l => l.status !== 'RETURNED').length)
const shortLoansCount = computed(() => (props.loans || []).filter(l => l.loanType === 'SHORT').length)
const longLoansCount = computed(() => (props.loans || []).filter(l => l.loanType === 'LONG').length)
const overdueCount = computed(() => (props.loans || []).filter(l => l.isOverdue).length)

const filteredLoans = computed(() => {
  let list = props.loans || []
  if (loanFilter.value === 'SHORT') list = list.filter(l => l.loanType === 'SHORT')
  else if (loanFilter.value === 'LONG') list = list.filter(l => l.loanType === 'LONG')
  else if (loanFilter.value === 'overdue') list = list.filter(l => l.isOverdue)
  else if (loanFilter.value === 'returned') list = list.filter(l => l.status === 'RETURNED')

  if (loanSearch.value.trim()) {
    const q = loanSearch.value.toLowerCase()
    list = list.filter(l => 
      (l.borrowerName || l.studentName)?.toLowerCase().includes(q) ||
      (l.borrowerId || l.studentId)?.toLowerCase().includes(q) ||
      l.bookTitle?.toLowerCase().includes(q)
    )
  }
  return list
})
</script>
