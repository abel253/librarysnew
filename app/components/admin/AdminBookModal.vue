<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>{{ isEditing ? '✏️ Edit Book Details' : '📚 Add New Book to Catalog' }}</span>
        </h3>
        <button @click="$emit('close')" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer">
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Book Title *</label>
          <input v-model="form.title" required type="text" placeholder="e.g. Modern Operating Systems" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Author *</label>
            <input v-model="form.author" required type="text" placeholder="e.g. Andrew S. Tanenbaum" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">ISBN Number</label>
            <input v-model="form.isbn" type="text" placeholder="978-0133591620" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Subject Category</label>
            <input v-model="form.category" type="text" placeholder="Computer Science" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Shelf Type *</label>
            <select v-model="form.shelfType" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer">
              <option value="OPEN">Open Shelf (Self-Service)</option>
              <option value="CLOSED">Closed Shelf (Approval Required)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Shelf Number</label>
            <input v-model="form.shelfNumber" type="text" placeholder="CS-302" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Sub Shelf</label>
            <input v-model="form.subShelfNumber" type="text" placeholder="Row 4" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Total Copies</label>
            <input v-model.number="form.copies" min="1" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono font-bold" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button type="button" @click="$emit('close')" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#0b4db0] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add to Catalog') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  isEditing?: boolean
  bookData?: any
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: any): void
}>()

const form = reactive({
  id: null,
  title: '',
  author: '',
  isbn: '',
  category: 'Computer Science',
  shelfType: 'OPEN',
  shelfNumber: 'A-01',
  subShelfNumber: 'Row 1',
  copies: 5
})

watch(() => props.bookData, (newVal) => {
  if (newVal) {
    form.id = newVal.id || newVal.itemId || null
    form.title = newVal.title || ''
    form.author = newVal.author || ''
    form.isbn = newVal.isbn || ''
    form.category = newVal.category || newVal.subjectCategory || 'General'
    const isCls = String(newVal.shelfType || newVal.type || '').toUpperCase().includes('CLOSED')
    form.shelfType = isCls ? 'CLOSED' : 'OPEN'
    form.shelfNumber = newVal.shelfNumber || 'A-01'
    form.subShelfNumber = newVal.subShelfNumber || 'Row 1'
    form.copies = newVal.copies || newVal.totalCopies || newVal.quantity || 1
  } else {
    form.id = null
    form.title = ''
    form.author = ''
    form.isbn = ''
    form.category = 'Computer Science'
    form.shelfType = 'OPEN'
    form.shelfNumber = 'A-01'
    form.subShelfNumber = 'Row 1'
    form.copies = 5
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
