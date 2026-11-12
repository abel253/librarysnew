<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
          <RotateCcw :size="22" class="text-emerald-600" /> Book Returns & Fines Collection
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          መጽሐፍ መልስ — Process book returns, inspect physical condition, settle overdue fines, and issue clearance certificates
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          Ready for Return: {{ activeLoans.length }}
        </span>
        <button 
          @click="$emit('refresh')" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
          title="Refresh Returns List"
        >
          <RefreshCw :size="14" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Active Loans Table Container -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
      
      <!-- Table Header & Search -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
          <BookOpen :size="16" class="text-blue-600" /> 
          <span>Active Loans & Student Return Slips (በተማሪዎች እጅ ያሉ እና ለመመለስ የቀረቡ)</span>
        </h3>

        <!-- Search Bar with Tracking Code, Student ID & Book Title support -->
        <div class="relative w-full md:w-80">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by code (RET-REQ-...), ID (1212), name..." 
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition" 
          />
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="text-slate-400 uppercase font-black border-b border-slate-100">
              <th class="py-3 px-3">TX / Tracking Code</th>
              <th class="py-3 px-3">Borrower Details</th>
              <th class="py-3 px-3">Book Title & Location</th>
              <th class="py-3 px-3 text-center">Loan Type</th>
              <th class="py-3 px-3">Due Date</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-right">Fine</th>
              <th class="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="loan in filteredList" 
              :key="loan.transactionId || loan.id"
              :class="loan.isOverdue ? 'bg-rose-50/50' : ''"
              class="hover:bg-slate-50 transition-colors group"
            >
              <!-- Column 1: TX & Tracking Code -->
              <td class="py-3 px-3">
                <div class="space-y-0.5">
                  <span class="font-mono font-bold text-slate-800 text-xs">#{{ loan.transactionId || loan.id }}</span>
                  <div class="flex items-center gap-1">
                    <span class="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                      RET-REQ-{{ String(loan.transactionId || loan.id).padStart(5, '0') }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Column 2: Borrower -->
              <td class="py-3 px-3">
                <div class="space-y-0.5">
                  <p class="font-bold text-slate-900 whitespace-nowrap">{{ loan.borrowerName || loan.studentName || 'Student Patron' }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">ID: {{ loan.borrowerId || loan.studentId || 'N/A' }}</p>
                  <p v-if="loan.department" class="text-[10px] text-slate-400">{{ loan.department }}</p>
                </div>
              </td>

              <!-- Column 3: Book Title & Shelf -->
              <td class="py-3 px-3">
                <div class="space-y-0.5 max-w-[220px]">
                  <p class="font-bold text-slate-800 truncate" :title="loan.bookTitle">{{ loan.bookTitle }}</p>
                  <div class="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span v-if="loan.shelfNumber">Shelf: {{ loan.shelfNumber }}</span>
                    <span v-if="loan.shelfType" class="text-blue-600 font-bold">({{ loan.shelfType }})</span>
                  </div>
                </div>
              </td>

              <!-- Column 4: Loan Type -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span 
                  :class="loan.loanType === 'SHORT' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                >
                  {{ loan.loanType || 'SHORT' }}
                </span>
              </td>

              <!-- Column 5: Due Date -->
              <td class="py-3 px-3 font-semibold whitespace-nowrap" :class="loan.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'">
                {{ formatDate(loan.dueDate) }}
              </td>

              <!-- Column 6: Overdue Status -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span v-if="loan.isOverdue" class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-200">
                  {{ loan.daysOverdue || 1 }} days late
                </span>
                <span v-else class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  On Time ✓
                </span>
              </td>

              <!-- Column 7: Calculated Fine -->
              <td class="py-3 px-3 text-right font-black whitespace-nowrap" :class="loan.fineAmount > 0 ? 'text-rose-600' : 'text-slate-400'">
                {{ loan.fineAmount > 0 ? loan.fineAmount + ' ETB' : '0.00 ETB' }}
              </td>

              <!-- Column 8: Action -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <button 
                  @click="openConfirmModal(loan)"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                >
                  <Check :size="13" />
                  <span>Confirm Return</span>
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400 text-xs">
                <div class="max-w-sm mx-auto space-y-1">
                  <p class="text-2xl">✨</p>
                  <p class="font-bold text-slate-700">No active book loans pending return.</p>
                  <p class="text-[11px] text-slate-400">All issued library books are up to date or returned.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= RETURN INSPECTION & CONFIRMATION MODAL ================= -->
    <div v-if="isModalOpen && selectedLoan" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📥</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">መጽሐፍ መቀበያ ማረጋገጫ (Confirm Book Return)</h3>
              <p class="text-[10px] text-slate-500">Transaction #{{ selectedLoan.transactionId || selectedLoan.id }}</p>
            </div>
          </div>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Student & Book Summary Card -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div class="flex justify-between items-start">
            <span class="text-slate-500">Borrower:</span>
            <span class="font-bold text-slate-900 text-right">{{ selectedLoan.borrowerName || selectedLoan.studentName }} ({{ selectedLoan.borrowerId || selectedLoan.studentId }})</span>
          </div>
          <div class="flex justify-between items-start">
            <span class="text-slate-500">Book Title:</span>
            <span class="font-black text-slate-900 text-right max-w-[220px] truncate">{{ selectedLoan.bookTitle }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Tracking Slip:</span>
            <span class="font-mono font-bold text-blue-700">RET-REQ-{{ String(selectedLoan.transactionId || selectedLoan.id).padStart(5, '0') }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200 pt-1.5">
            <span class="text-slate-600 font-bold">Fine Settlement:</span>
            <span :class="selectedLoan.fineAmount > 0 ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'">
              {{ selectedLoan.fineAmount > 0 ? selectedLoan.fineAmount + ' ETB (To Collect)' : '0.00 ETB (Cleared ✓)' }}
            </span>
          </div>
        </div>

        <!-- Physical Condition Selector -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
            Physical Book Condition *
          </label>
          <select 
            v-model="returnForm.condition" 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
          >
            <option value="Good Condition">✓ Good Condition (ጥሩ ሁኔታ ላይ ያለ)</option>
            <option value="Minor Wear">● Minor Wear (ቀላል መጎዳት)</option>
            <option value="Damaged">✕ Damaged / Requires Binding (የተጎዳ / መጠገን ያለበት)</option>
            <option value="Lost">⚠ Lost Book Replacement (የጠፋ መጽሐፍ ክፍያ)</option>
          </select>
        </div>

        <!-- Librarian Notes -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
            Librarian Notes (Optional)
          </label>
          <input 
            v-model="returnForm.notes" 
            type="text" 
            placeholder="e.g. Returned on desk, barcode verified" 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" 
          />
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="isModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="confirmReturnSubmit"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
          >
            <Check :size="14" />
            <span>Confirm & Return Book (መጽሐፉን ተረከብ)</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RotateCcw, RefreshCw, BookOpen, Search, Check } from 'lucide-vue-next'

const props = defineProps<{
  loans: any[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'return', payload: any): void
}>()

const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedLoan = ref<any>(null)
const returnForm = ref({
  condition: 'Good Condition',
  notes: '',
})

const activeLoans = computed(() => {
  return (props.loans || []).filter(l => l.status === 'ISSUED' || l.status === 'issued')
})

const filteredList = computed(() => {
  let list = activeLoans.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => 
      (l.borrowerName || l.studentName)?.toLowerCase().includes(q) ||
      (l.borrowerId || l.studentId)?.toLowerCase().includes(q) ||
      l.bookTitle?.toLowerCase().includes(q) ||
      String(l.transactionId || l.id).includes(q) ||
      `ret-req-${String(l.transactionId || l.id).padStart(5, '0')}`.includes(q)
    )
  }
  return list
})

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const openConfirmModal = (loan: any) => {
  selectedLoan.value = loan
  returnForm.value.condition = 'Good Condition'
  returnForm.value.notes = ''
  isModalOpen.value = true
}

const confirmReturnSubmit = () => {
  if (!selectedLoan.value) return
  emit('return', {
    id: selectedLoan.value.transactionId || selectedLoan.value.id,
    condition: returnForm.value.condition,
    notes: returnForm.value.notes,
  })
  isModalOpen.value = false
}
</script>