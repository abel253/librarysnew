<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BookOpen :size="24" class="text-blue-600" /> University Catalog Management
        </h2>
        <p class="text-xs text-slate-500">Configure Open Shelf, Closed Shelf, and Stacks Books.</p>
      </div>

      <button 
        @click="$emit('add-book')"
        class="px-4 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#0b4db0] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
      >
        <Plus :size="16" /> Add New Book
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search catalog by title, author, or ISBN..."
          class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition"
        />
      </div>

      <select 
        v-model="shelfFilter"
        class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
      >
        <option value="all">All Shelf Types</option>
        <option value="OPEN">Open Shelf</option>
        <option value="CLOSED">Closed Shelf</option>
      </select>
    </div>

    <!-- Books Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
            <th class="py-3 px-4">Title & Author</th>
            <th class="py-3 px-4">Category</th>
            <th class="py-3 px-4">Shelf Type</th>
            <th class="py-3 px-4">Location / Shelf</th>
            <th class="py-3 px-4">Copies</th>
            <th class="py-3 px-4">Borrows</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="book in filteredBooks" :key="book.id || book.itemId" class="hover:bg-slate-50 transition-colors">
            <td class="py-3.5 px-4">
              <p class="font-bold text-slate-900 leading-snug">{{ book.title }}</p>
              <p class="text-xs text-slate-500">{{ book.author || 'Unknown' }}</p>
              <p v-if="book.isbn" class="text-[10px] text-blue-600 font-mono mt-0.5">ISBN: {{ book.isbn }}</p>
            </td>
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-600">{{ book.category || book.subjectCategory || 'General' }}</td>
            <td class="py-3.5 px-4">
              <span 
                :class="isClosed(book) ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
                class="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
              >
                {{ isClosed(book) ? 'Closed Shelf' : 'Open Shelf' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-xs font-medium text-slate-600">
              <div class="flex items-center gap-1">
                <span class="font-bold text-slate-800">{{ book.shelfNumber || 'Shelf N/A' }}</span>
                <span v-if="book.subShelfNumber && book.subShelfNumber !== 'N/A'" class="text-slate-400">({{ book.subShelfNumber }})</span>
              </div>
              <p class="text-[10px] text-slate-400">{{ book.location || 'Main Library' }}</p>
            </td>
            <td class="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
              <span :class="Number(book.availableCopies ?? book.availableQuantity ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ book.availableCopies ?? book.availableQuantity ?? 0 }}
              </span>
              <span class="text-slate-400 font-normal"> / {{ book.copies ?? book.totalCopies ?? book.quantity ?? 1 }}</span>
            </td>
            <td class="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">{{ book.borrowCount || 0 }} times</td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <button 
                  @click="$emit('edit-book', book)" 
                  title="Edit Book / መጽሐፉን አርም"
                  class="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-all cursor-pointer"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="$emit('delete-book', book.id || book.itemId)" 
                  title="Delete Book / መጽሐፉን ሰርዝ"
                  class="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredBooks.length === 0">
            <td colspan="7" class="py-10 text-center text-slate-400 text-xs">
              No books found matching criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BookOpen, Plus, Search, Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  books: any[]
}>()

defineEmits<{
  (e: 'add-book'): void
  (e: 'edit-book', book: any): void
  (e: 'delete-book', id: number | string): void
}>()

const searchTerm = ref('')
const shelfFilter = ref('all')

const isClosed = (book: any) => {
  const t = String(book.shelfType || book.type || '').toUpperCase()
  return t.includes('CLOSED')
}

const filteredBooks = computed(() => {
  let list = props.books || []
  if (shelfFilter.value !== 'all') {
    list = list.filter(b => isClosed(b) === (shelfFilter.value === 'CLOSED'))
  }
  if (searchTerm.value.trim()) {
    const q = searchTerm.value.toLowerCase()
    list = list.filter(b => 
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q) ||
      b.shelfNumber?.toLowerCase().includes(q)
    )
  }
  return list
})
</script>
