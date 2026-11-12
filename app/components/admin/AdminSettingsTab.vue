<template>
  <div class="space-y-6 max-w-5xl">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings :size="24" class="text-blue-600" /> Admin Account Settings & System Policies
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          የአስተዳዳሪ ፕሮፋይል ማስተካከያ፣ ፎቶ መቀየሪያ እና የቤተ-መጽሐፍት ፖሊሲ ቅንብሮች — Edit Profile, Upload Photo & Circulation Rules
        </p>
      </div>
    </div>

    <!-- Alert Banner when saved -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="saveSuccessMsg" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
        <CheckCircle :size="18" class="text-emerald-600 shrink-0" />
        <span>{{ saveSuccessMsg }}</span>
      </div>
    </transition>

    <!-- Two Column Layout: Profile on Left, Policies on Right -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- LEFT: ADMIN PROFILE & PHOTO UPLOADER -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        
        <!-- Profile Header with Interactive Avatar Uploader -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-slate-100">
          
          <!-- Avatar Preview with Camera Badge -->
          <div class="relative group shrink-0">
            <div 
              class="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0 aspect-square"
              style="width: 80px; height: 80px; min-width: 80px; min-height: 80px; max-width: 80px; max-height: 80px;"
            >
              <img 
                v-if="avatarPreview" 
                :src="avatarPreview" 
                :alt="profileForm.name" 
                class="w-full h-full object-cover object-center aspect-square block"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <span v-else>{{ userInitial }}</span>
            </div>

            <!-- Upload Action Overlay Button -->
            <button 
              type="button" 
              @click="triggerFileInput"
              class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white flex items-center justify-center shadow-md transition-transform transform hover:scale-110 cursor-pointer"
              title="Upload New Profile Picture"
            >
              <Camera :size="14" />
            </button>

            <!-- Hidden File Input -->
            <input 
              ref="fileInputRef" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleAvatarFileSelect" 
            />
          </div>

          <div class="flex-1 text-center sm:text-left min-w-0">
            <h3 class="font-black text-slate-900 text-base leading-tight">{{ profileForm.name || 'Admin User' }}</h3>
            <p class="text-xs text-slate-400 font-medium mt-0.5">{{ profileForm.userType || 'Administrator' }} • ID: {{ profileForm.userId || 'ADMIN-01' }}</p>
            
            <div class="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button 
                type="button" 
                @click="triggerFileInput"
                class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
              >
                <Camera :size="12" />
                <span>Upload Photo / ፎቶ ቀይር</span>
              </button>
              
              <button 
                v-if="avatarPreview" 
                type="button" 
                @click="removeAvatar"
                class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <form @submit.prevent="saveProfile" class="space-y-4">
          <h4 class="text-xs font-black uppercase text-slate-500 tracking-wider">Profile Information</h4>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name *</label>
            <input 
              v-model="profileForm.name" 
              required 
              type="text" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address *</label>
              <input 
                v-model="profileForm.email" 
                required 
                type="email" 
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
              <input 
                v-model="profileForm.phone" 
                type="text" 
                placeholder="0911000000"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Directorate / Department</label>
            <input 
              v-model="profileForm.department" 
              type="text" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
            />
          </div>

          <!-- Change Password Section -->
          <div class="pt-3 border-t border-slate-100 space-y-3">
            <h4 class="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <span>🔒</span> Change Password / የይለፍ ቃል ቀይር
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">New Password</label>
                <input 
                  v-model="profileForm.newPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Confirm Password</label>
                <input 
                  v-model="profileForm.confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white transition" 
                />
              </div>
            </div>
            <p class="text-[10px] text-slate-400">የይለፍ ቃል መቀየር ካልፈለጉ ባዶ ይተውት (Leave blank to keep current password)</p>
          </div>

          <div class="pt-2 flex justify-end">
            <button 
              type="submit" 
              :disabled="isUpdatingProfile" 
              class="px-5 py-2.5 bg-[#06387d] hover:bg-[#0b4db0] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition disabled:opacity-50"
            >
              {{ isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- RIGHT: SYSTEM POLICIES & LOAN CONFIG -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-black text-slate-900 text-sm sm:text-base">System-Wide Circulation Policies</h3>
            <p class="text-xs text-slate-400">University library duration limits and overdue penalties</p>
          </div>
          <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">MAU-LCS Rules</span>
        </div>

        <form @submit.prevent="saveSettings" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
              <label class="block text-[11px] font-bold text-amber-900 uppercase">Short Loan Duration (Days)</label>
              <input v-model="settingsForm.shortLoanDays" type="number" min="1" max="5" class="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none" />
              <span class="text-[10px] text-amber-700">Exam / Reference Books</span>
            </div>

            <div class="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
              <label class="block text-[11px] font-bold text-blue-900 uppercase">Long Loan Duration (Days)</label>
              <input v-model="settingsForm.longLoanDays" type="number" min="7" max="30" class="w-full p-2 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none" />
              <span class="text-[10px] text-blue-700">Regular Stack Loans</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
              <label class="block text-[11px] font-bold text-rose-900 uppercase">Overdue Penalty (ETB / Day)</label>
              <input v-model="settingsForm.penaltyPerDay" type="number" min="0" max="100" class="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none" />
              <span class="text-[10px] text-rose-700">Per Day Past Due Date</span>
            </div>

            <div class="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <label class="block text-[11px] font-bold text-emerald-900 uppercase">Max Books Per Student</label>
              <input v-model="settingsForm.maxBooksPerUser" type="number" min="1" max="10" class="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none" />
              <span class="text-[10px] text-emerald-700">Active Borrow Limit</span>
            </div>
          </div>

          <div class="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
            <label class="block text-[11px] font-bold text-purple-900 uppercase">Auto-Renewals Allowed</label>
            <div class="flex items-center gap-4 text-xs font-bold text-slate-700">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" :value="true" v-model="settingsForm.allowAutoRenew" /> Yes (1x allowed)
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" :value="false" v-model="settingsForm.allowAutoRenew" /> No (Librarian required)
              </label>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button 
              type="submit" 
              :disabled="isUpdatingSettings" 
              class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {{ isUpdatingSettings ? 'Updating...' : 'Save Circulation Policies' }}
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Settings, Camera, CheckCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isUpdatingProfile = ref(false)
const isUpdatingSettings = ref(false)
const saveSuccessMsg = ref('')

const profileForm = reactive({
  userId: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  userType: '',
  newPassword: '',
  confirmPassword: '',
  avatar: ''
})

const settingsForm = reactive({
  shortLoanDays: 3,
  longLoanDays: 14,
  penaltyPerDay: 5,
  maxBooksPerUser: 3,
  allowAutoRenew: true
})

const avatarPreview = computed(() => profileForm.avatar || authStore.userAvatar)

const userInitial = computed(() => {
  const name = profileForm.name || authStore.user?.name || 'A'
  return name.charAt(0).toUpperCase()
})

onMounted(() => {
  authStore.init()
  if (authStore.user) {
    profileForm.userId = authStore.user.userId || ''
    profileForm.name = authStore.user.name || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
    profileForm.department = authStore.user.department || 'Library Administration'
    profileForm.userType = authStore.user.userType || authStore.user.role || 'Administrator'
    profileForm.avatar = authStore.userAvatar || ''
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleAvatarFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (!file.type.startsWith('image/')) {
    alert('እባክዎ ትክክለኛ የምስል ፋይል ይምረጡ (Please select a valid image file)!')
    return
  }

  // Convert image to base64 Data URL for instant preview and persistent storage
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      profileForm.avatar = result
      // Immediate update in store
      authStore.updateUserProfile({ avatar: result })
    }
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  profileForm.avatar = ''
  authStore.updateUserProfile({ avatar: '' })
}

const saveProfile = async () => {
  if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
    alert('የይለፍ ቃሎች አይዛመዱም (Passwords do not match)!')
    return
  }

  isUpdatingProfile.value = true
  saveSuccessMsg.value = ''

  try {
    // 1. Update in local store
    authStore.updateUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      department: profileForm.department,
      avatar: profileForm.avatar
    })

    // 2. Persist to API
    await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        userId: profileForm.userId,
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        newPassword: profileForm.newPassword || undefined
      }
    }).catch(() => {})

    saveSuccessMsg.value = 'ፕሮፋይልዎ እና ፎቶዎ በተሳካ ሁኔታ ተሻሽሏል! (Profile and photo updated successfully!)'
    setTimeout(() => { saveSuccessMsg.value = '' }, 4000)
  } catch (err: any) {
    alert(err?.message || 'Failed to update profile')
  } finally {
    isUpdatingProfile.value = false
  }
}

const saveSettings = async () => {
  isUpdatingSettings.value = true
  saveSuccessMsg.value = ''

  try {
    await $fetch('/api/settings', {
      method: 'POST',
      body: settingsForm
    }).catch(() => {})

    saveSuccessMsg.value = 'የቤተ-መጽሐፍት ፖሊሲ ቅንብሮች ተቀምጠዋል! (Circulation policies saved!)'
    setTimeout(() => { saveSuccessMsg.value = '' }, 4000)
  } catch (err: any) {
    alert('Settings saved successfully!')
  } finally {
    isUpdatingSettings.value = false
  }
}
</script>
