<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
    
    <!-- Header with Title, Stats & Add User Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users :size="24" class="text-blue-600" /> University User & Patron Accounts
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Manage librarian accounts, faculty privileges, student cards and role-based access control.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Add User / Create Librarian Button -->
        <button 
          @click="$emit('add-user')" 
          class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <UserPlus :size="16" />
          <span>+ Add User / Create Librarian</span>
        </button>

        <!-- Refresh Button -->
        <button 
          @click="$emit('refresh')" 
          class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer" 
          title="Refresh Users"
        >
          <RefreshCw :size="16" />
        </button>
      </div>
    </div>

    <!-- Filter Pills & Search Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
      
      <!-- Role Filters -->
      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button 
          v-for="r in ['all', 'student', 'faculty', 'librarian', 'administrator']" :key="r"
          @click="roleFilter = r"
          :class="roleFilter === r ? 'bg-[#06387d] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
        >
          {{ r }}
          <span v-if="r !== 'all'" class="text-[10px] ml-1 opacity-75 font-mono">
            ({{ countByRole(r) }})
          </span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative w-full md:w-72">
        <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by name, ID, email..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition"
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
            <th class="py-3 px-4">User Details</th>
            <th class="py-3 px-4">Role / Type</th>
            <th class="py-3 px-4">Department / Faculty</th>
            <th class="py-3 px-4">Borrowing Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="user in filteredUsers" 
            :key="user.userId || user.id" 
            class="hover:bg-slate-50 transition group"
          >
            <!-- Column 1: Details -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {{ user.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div>
                  <p class="font-bold text-slate-900 leading-snug">{{ user.name }}</p>
                  <p class="text-xs text-slate-500 font-mono">{{ user.userId }}</p>
                  <p class="text-[10px] text-blue-600 font-mono">{{ user.email }}</p>
                </div>
              </div>
            </td>

            <!-- Column 2: Role / Type Badge -->
            <td class="py-3.5 px-4 whitespace-nowrap">
              <span 
                :class="roleBadgeClass(user.userType)"
                class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs"
              >
                <span>{{ roleIcon(user.userType) }}</span>
                <span>{{ user.userType || 'Student' }}</span>
              </span>
            </td>

            <!-- Column 3: Department -->
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">
              {{ user.department || 'Informatics & Computing' }}
            </td>

            <!-- Column 4: Borrowing Status -->
            <td class="py-3.5 px-4 whitespace-nowrap">
              <span 
                v-if="user.status === 'BLOCKED'"
                class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"
              >
                ✕ Blocked / Suspended
              </span>
              <span 
                v-else
                class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
              >
                ✓ Eligible (Active)
              </span>
            </td>

            <!-- Column 5: Actions (Edit & Delete) -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                
                <!-- Edit User & Role Button -->
                <button 
                  @click="$emit('edit-user', user)"
                  class="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                  title="Edit User & Role"
                >
                  <Pencil :size="15" />
                </button>

                <!-- Delete User Button -->
                <button 
                  @click="$emit('delete-user', user)"
                  class="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                  title="Delete User"
                >
                  <Trash2 :size="15" />
                </button>

              </div>
            </td>
          </tr>

          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="py-12 text-center text-slate-400 text-xs">
              No university patrons or staff found matching criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, Search, RefreshCw, UserPlus, Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  users?: any[]
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'add-user'): void
  (e: 'edit-user', user: any): void
  (e: 'delete-user', user: any): void
}>()

const roleFilter = ref('all')
const searchQuery = ref('')

const defaultUsers = [
  { userId: 'MAU/001/14', name: 'Birhanu Gize', email: 'birhanu@mau.edu.et', userType: 'Student', department: 'Software Engineering', status: 'ABLE_TO_BORROW' },
  { userId: 'MAU/042/14', name: 'Abebech Tadesse', email: 'abebech@mau.edu.et', userType: 'Student', department: 'Medicine', status: 'ABLE_TO_BORROW' },
  { userId: 'LIB-001', name: 'Kassahun Bekele', email: 'kassahun@mau.edu.et', userType: 'Librarian', department: 'Central Circulation', status: 'ABLE_TO_BORROW' },
  { userId: 'ADM-001', name: 'Dr. Mengistu Worku', email: 'mengistu@mau.edu.et', userType: 'Administrator', department: 'Academic Director', status: 'ABLE_TO_BORROW' },
  { userId: 'FAC-019', name: 'Prof. Solomon Haile', email: 'solomon@mau.edu.et', userType: 'Faculty', department: 'Electrical Engineering', status: 'ABLE_TO_BORROW' }
]

const userSourceList = computed(() => {
  return (props.users && props.users.length > 0) ? props.users : defaultUsers
})

const filteredUsers = computed(() => {
  let list = userSourceList.value
  if (roleFilter.value !== 'all') {
    list = list.filter(u => String(u.userType).toLowerCase() === roleFilter.value.toLowerCase())
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u => 
      u.name?.toLowerCase().includes(q) ||
      u.userId?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    )
  }
  return list
})

function countByRole(role: string): number {
  return userSourceList.value.filter(u => String(u.userType).toLowerCase() === role.toLowerCase()).length
}

function roleBadgeClass(type?: string): string {
  const t = String(type || '').toLowerCase()
  if (t === 'librarian') return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (t === 'administrator' || t === 'admin') return 'bg-purple-100 text-purple-800 border border-purple-200'
  if (t === 'faculty') return 'bg-amber-100 text-amber-800 border border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
}

function roleIcon(type?: string): string {
  const t = String(type || '').toLowerCase()
  if (t === 'librarian') return '📘'
  if (t === 'administrator' || t === 'admin') return '🏛️'
  if (t === 'faculty') return '👨‍🏫'
  return '🎓'
}
</script>