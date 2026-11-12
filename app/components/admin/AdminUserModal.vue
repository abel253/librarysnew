<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{{ isEditing ? '✏️ Edit User & Role Privileges' : '👤 Create University Account (Librarian / Patron)' }}</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ isEditing ? 'Update patron/staff credentials, role permissions, and access status.' : 'Register a new central librarian, faculty member, or student into the database.' }}
          </p>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Row 1: User ID & Role -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              User ID / Card No. *
            </label>
            <input 
              v-model="form.userId" 
              :disabled="isEditing" 
              required 
              type="text" 
              placeholder="e.g. LIB-002 or MAU/045/14" 
              :class="isEditing ? 'bg-slate-100 cursor-not-allowed text-slate-500 font-mono' : 'bg-slate-50 focus:bg-white focus:border-blue-600'"
              class="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none transition" 
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Unique identification ID</span>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              Role / User Type *
            </label>
            <select 
              v-model="form.userType" 
              required 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="Librarian">📘 Librarian (Circulation & Desk)</option>
              <option value="Administrator">🏛️ Administrator (Executive & System)</option>
              <option value="Student">🎓 Student (Patron & Borrows)</option>
              <option value="Faculty">👨‍🏫 Faculty (Teaching & Research)</option>
            </select>
            <span class="text-[10px] text-blue-600 mt-0.5 block font-semibold">Defines system permissions</span>
          </div>
        </div>

        <!-- Row 2: Full Name & Email -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              Full Name *
            </label>
            <input 
              v-model="form.name" 
              required 
              type="text" 
              placeholder="e.g. Kassahun Bekele" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              University Email *
            </label>
            <input 
              v-model="form.email" 
              required 
              type="email" 
              placeholder="e.g. kassahun@mau.edu.et" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>
        </div>

        <!-- Row 3: Department & Borrowing Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              Department / Faculty
            </label>
            <input 
              v-model="form.department" 
              type="text" 
              placeholder="e.g. Central Library Circulation" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              Account / Borrowing Status
            </label>
            <select 
              v-model="form.status" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="ABLE_TO_BORROW">✓ Eligible (Active Patron/Staff)</option>
              <option value="BLOCKED">✕ Blocked / Suspended</option>
              <option value="ACTIVE">● Active (Staff Only)</option>
            </select>
          </div>
        </div>

        <!-- Row 4: Password -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
            {{ isEditing ? 'Reset Password (Optional - leave blank to keep current)' : 'Initial Password *' }}
          </label>
          <input 
            v-model="form.password" 
            :required="!isEditing"
            type="password" 
            :placeholder="isEditing ? 'Enter new password to reset...' : 'e.g. mau123456'" 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-blue-600 focus:bg-white" 
          />
          <span class="text-[10px] text-slate-400 mt-0.5 block">
            {{ isEditing ? 'Only fill this if you want to reset the user password.' : 'Default password: mau123456 (User can change after login)' }}
          </span>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
          >
            <Check :size="14" />
            <span>{{ isEditing ? 'Save Changes' : 'Create Account' }}</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  userData?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: any): void
}>()

const form = reactive({
  userId: '',
  name: '',
  email: '',
  userType: 'Librarian',
  department: 'Central Library Circulation',
  status: 'ABLE_TO_BORROW',
  password: '',
})

watch(() => props.userData, (newVal) => {
  if (newVal && props.isEditing) {
    form.userId = newVal.userId || newVal.id || ''
    form.name = newVal.name || ''
    form.email = newVal.email || ''
    form.userType = newVal.userType || 'Librarian'
    form.department = newVal.department || 'Central Library Circulation'
    form.status = newVal.status || 'ABLE_TO_BORROW'
    form.password = ''
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.isOpen, (open) => {
  if (open && !props.isEditing) {
    resetForm()
  }
})

function resetForm() {
  form.userId = ''
  form.name = ''
  form.email = ''
  form.userType = 'Librarian'
  form.department = 'Central Library Circulation'
  form.status = 'ABLE_TO_BORROW'
  form.password = 'mau123456'
}

function handleSubmit() {
  emit('save', { ...form })
}
</script>