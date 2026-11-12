<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 :size="24" class="text-blue-600" /> Executive Reports & Circulation Analytics
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          የአጠቃላይ ዩኒቨርሲቲው ቤተ-መጽሐፍት እንቅስቃሴ ሪፖርት እና የዳታ ትንተና — System-wide circulation, collection & fines metrics
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="$emit('refresh')" class="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition">
          <RefreshCw :size="14" /> Refresh
        </button>
        <button @click="printReport" class="flex items-center gap-2 px-4 py-2 bg-[#06387d] hover:bg-[#0b4db0] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition">
          <span>🖨️</span> Print / Export Report
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Catalog Titles</span>
        <p class="text-2xl font-black text-slate-900 mt-1.5">{{ summary.totalBooks }}</p>
        <span class="text-[10px] text-blue-600 font-semibold mt-1 inline-block">{{ summary.totalCopies }} total copies</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Active Loans</span>
        <p class="text-2xl font-black text-blue-900 mt-1.5">{{ summary.activeLoansCount }}</p>
        <span class="text-[10px] text-blue-700 font-semibold mt-1 inline-block">Currently out</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Utilization</span>
        <p class="text-2xl font-black text-emerald-700 mt-1.5">{{ summary.utilizationRate }}%</p>
        <span class="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Circulation rate</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-purple-600 tracking-wider">On-Time Return</span>
        <p class="text-2xl font-black text-purple-800 mt-1.5">{{ summary.returnComplianceRate }}%</p>
        <span class="text-[10px] text-purple-600 font-semibold mt-1 inline-block">Compliance score</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Overdue Items</span>
        <p class="text-2xl font-black text-rose-700 mt-1.5">{{ summary.overdueCount }}</p>
        <span class="text-[10px] text-rose-600 font-semibold mt-1 inline-block">Past deadline</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Accrued Fines</span>
        <p class="text-2xl font-black text-amber-900 mt-1.5">{{ summary.totalFineAmount }} <span class="text-xs font-bold text-amber-700">ETB</span></p>
        <span class="text-[10px] text-amber-700 font-semibold mt-1 inline-block">Overdue penalty</span>
      </div>
    </div>

    <!-- Category Breakdown Table -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
      <h3 class="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
        <span>📚</span> Circulation Breakdown by Subject Category
      </h3>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
              <th class="py-3 px-4">Subject / Faculty</th>
              <th class="py-3 px-4">Total Titles</th>
              <th class="py-3 px-4">Available Copies</th>
              <th class="py-3 px-4">Active Loans</th>
              <th class="py-3 px-4 text-right">Circulation Share</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cat in categoryList" :key="cat.name" class="hover:bg-slate-50 transition">
              <td class="py-3 px-4 font-bold text-slate-800">{{ cat.name }}</td>
              <td class="py-3 px-4 font-mono text-slate-600">{{ cat.titles }}</td>
              <td class="py-3 px-4 font-mono text-emerald-600 font-bold">{{ cat.available }}</td>
              <td class="py-3 px-4 font-mono text-blue-600 font-bold">{{ cat.loans }}</td>
              <td class="py-3 px-4 text-right font-mono font-bold text-slate-700">{{ cat.share }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  reportsData?: any
}>()

defineEmits<{
  (e: 'refresh'): void
}>()

const summary = computed(() => {
  return props.reportsData?.summary || {
    totalBooks: 3995,
    totalCopies: 8200,
    activeLoansCount: 420,
    utilizationRate: 72,
    returnComplianceRate: 94,
    overdueCount: 18,
    totalFineAmount: 850
  }
})

const categoryList = computed(() => {
  return props.reportsData?.categories || [
    { name: 'Computer Science & Informatics', titles: 940, available: 1650, loans: 180, share: 38 },
    { name: 'Health & Medical Sciences', titles: 820, available: 1400, loans: 120, share: 26 },
    { name: 'Engineering & Technology', titles: 780, available: 1350, loans: 95, share: 20 },
    { name: 'Business & Economics', titles: 650, available: 1100, loans: 60, share: 12 },
    { name: 'General Reference & Languages', titles: 405, available: 700, loans: 25, share: 4 }
  ]
})

const printReport = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}
</script>
