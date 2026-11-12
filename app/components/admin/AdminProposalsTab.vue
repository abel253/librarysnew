<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText :size="24" class="text-teal-600" /> Student Research & Proposals
        </h2>
        <p class="text-xs text-slate-500">Manage student capstone proposals, theses, and faculty research papers.</p>
      </div>

      <button 
        @click="$emit('add-proposal')"
        class="px-4 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#0b4db0] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
      >
        <Plus :size="16" /> Add New Proposal
      </button>
    </div>

    <!-- Filter Pills & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-for="t in ['All', 'Proposal', 'Thesis', 'Research']" :key="t"
          @click="typeFilter = t"
          :class="typeFilter === t ? 'bg-[#06387d] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {{ t }}
        </button>
      </div>

      <div class="relative w-full md:w-72">
        <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by topic, author, college..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
        />
      </div>
    </div>

    <!-- Proposals Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
            <th class="py-3 px-4">Research Topic & Author</th>
            <th class="py-3 px-4">College & Department</th>
            <th class="py-3 px-4">Document Type</th>
            <th class="py-3 px-4">Year</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in filteredList" :key="item.id || item.dbId" class="hover:bg-slate-50 transition-colors">
            <td class="py-3.5 px-4">
              <p class="font-bold text-slate-900 leading-snug">{{ item.title }}</p>
              <p class="text-xs text-slate-500">{{ item.author || item.authorName }}</p>
            </td>
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">
              <p>{{ item.college || 'College of Informatics' }}</p>
              <p class="text-[10px] text-slate-400 font-normal">{{ item.department || 'Software Engineering' }}</p>
            </td>
            <td class="py-3.5 px-4 whitespace-nowrap">
              <span 
                :class="item.documentType === 'Thesis' ? 'bg-blue-100 text-blue-800' : (item.documentType === 'Proposal' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')"
                class="px-2.5 py-1 rounded-full text-xs font-extrabold"
              >
                {{ item.documentType || 'Proposal' }}
              </span>
            </td>
            <td class="py-3.5 px-4 font-mono text-xs text-slate-600">{{ item.year || 2026 }}</td>
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                <button 
                  @click="$emit('edit-proposal', item)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                  title="Edit Proposal"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="$emit('delete-proposal', item.id || item.dbId)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete Proposal"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="5" class="py-12 text-center text-slate-400 text-xs">
              No research or proposals found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Plus, Search, Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  proposals: any[]
}>()

defineEmits<{
  (e: 'add-proposal'): void
  (e: 'edit-proposal', item: any): void
  (e: 'delete-proposal', id: number | string): void
}>()

const typeFilter = ref('All')
const searchQuery = ref('')

const filteredList = computed(() => {
  let list = props.proposals || []
  if (typeFilter.value !== 'All') {
    list = list.filter(p => (p.documentType || 'Proposal') === typeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      (p.author || p.authorName)?.toLowerCase().includes(q) ||
      p.college?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q)
    )
  }
  return list
})
</script>
