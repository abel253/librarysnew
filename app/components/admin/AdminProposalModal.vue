<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>{{ isEditing ? '✏️ Edit Proposal / Research' : '📄 Add Research Proposal' }}</span>
        </h3>
        <button @click="$emit('close')" class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer">
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Proposal Topic / Title *</label>
          <input v-model="form.title" required type="text" placeholder="e.g. AI-Based Crop Disease Detection" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Author Name *</label>
          <input v-model="form.author" required type="text" placeholder="e.g. Birhanu Gize" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">College</label>
            <input v-model="form.college" type="text" placeholder="College of Informatics" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Department</label>
            <input v-model="form.department" type="text" placeholder="Software Engineering" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Document Type</label>
            <select v-model="form.documentType" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer">
              <option value="Proposal">Proposal</option>
              <option value="Thesis">Thesis</option>
              <option value="Research">Research Paper</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Year</label>
            <input v-model.number="form.year" type="number" min="2000" max="2030" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600 focus:bg-white" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button type="button" @click="$emit('close')" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit Proposal') }}
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
  proposalData?: any
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
  college: 'College of Informatics',
  department: 'Software Engineering',
  documentType: 'Proposal',
  year: 2026
})

watch(() => props.proposalData, (newVal) => {
  if (newVal) {
    form.id = newVal.id || newVal.dbId || null
    form.title = newVal.title || ''
    form.author = newVal.author || newVal.authorName || ''
    form.college = newVal.college || 'College of Informatics'
    form.department = newVal.department || 'Software Engineering'
    form.documentType = newVal.documentType || 'Proposal'
    form.year = newVal.year || 2026
  } else {
    form.id = null
    form.title = ''
    form.author = ''
    form.college = 'College of Informatics'
    form.department = 'Software Engineering'
    form.documentType = 'Proposal'
    form.year = 2026
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
