<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>⚡ Issue New Book Loan</span>
        </h3>
        <button @click="$emit('close')" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer">
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Select Book *</label>
          <select v-model="form.itemId" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer">
            <option value="" disabled>Choose a book from catalog...</option>
            <option v-for="b in books" :key="b.id || b.itemId" :value="b.id || b.itemId">
              {{ b.title }} ({{ b.author || 'Author N/A' }}) - {{ b.shelfNumber || 'Shelf N/A' }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Student / Borrower Name *</label>
            <input v-model="form.studentName" required type="text" placeholder="e.g. Birhanu Gize" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Student / Staff ID *</label>
            <input v-model="form.studentId" required type="text" placeholder="e.g. MAU/1234/14" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="0911000000" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Borrow Scope</label>
            <select v-model="form.borrowScope" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer">
              <option value="OUTSIDE">Outside Campus (Take Home)</option>
              <option value="INSIDE">Inside Library Only (Hall Reading)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Loan Type</label>
            <select v-model="form.loanType" @change="onLoanTypeChange" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer">
              <option value="SHORT">Short Borrow (1 - 3 Days)</option>
              <option value="LONG">Long Borrow (14 - 30 Days)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Duration (Days)</label>
            <input v-model.number="form.durationDays" type="number" min="1" max="30" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600 focus:bg-white" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button type="button" @click="$emit('close')" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50">
            {{ isSubmitting ? 'Issuing...' : 'Confirm Loan Issue' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  books: any[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: any): void
}>()

const form = reactive({
  itemId: '',
  studentName: '',
  studentId: '',
  phone: '',
  borrowScope: 'OUTSIDE',
  loanType: 'SHORT',
  durationDays: 3
})

const onLoanTypeChange = () => {
  form.durationDays = form.loanType === 'SHORT' ? 3 : 14
}

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
