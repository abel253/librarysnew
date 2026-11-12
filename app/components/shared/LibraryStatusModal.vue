<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Clock :size="20" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900">የአገልግሎት ሰዓት እና ማሳወቂያ መቆጣጠሪያ</h3>
            <p class="text-xs text-slate-500">Broadcast library operating hours & out-of-service notices to all users</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSaveStatus" class="space-y-4 text-xs font-sans">
        
        <!-- 1. Operating Status Selection -->
        <div>
          <label class="block font-black text-slate-700 uppercase tracking-wider mb-2">
            የሲስተም / ቤተ-መጽሐፍት የስራ ሁኔታ (Operating Status) *
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            <!-- Open Option -->
            <button
              type="button"
              @click="form.status = 'OPEN'; onStatusChange('OPEN')"
              :class="[
                'p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer',
                form.status === 'OPEN' 
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span v-if="form.status === 'OPEN'" class="text-[10px] font-black text-emerald-700">✓ Active</span>
              </div>
              <div class="mt-2">
                <p class="font-black text-xs">ክፍት ነው (Open)</p>
                <p class="text-[10px] text-slate-500 mt-0.5">በአገልግሎት ላይ</p>
              </div>
            </button>

            <!-- Closed Option -->
            <button
              type="button"
              @click="form.status = 'CLOSED'; onStatusChange('CLOSED')"
              :class="[
                'p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer',
                form.status === 'CLOSED' 
                  ? 'border-rose-500 bg-rose-50/70 text-rose-900 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                <span v-if="form.status === 'CLOSED'" class="text-[10px] font-black text-rose-700">✓ Active</span>
              </div>
              <div class="mt-2">
                <p class="font-black text-xs">አገልግሎት አይሰጥም (Closed)</p>
                <p class="text-[10px] text-slate-500 mt-0.5">በዚህ ሰዓት ዝግ ነው</p>
              </div>
            </button>

            <!-- Maintenance Option -->
            <button
              type="button"
              @click="form.status = 'MAINTENANCE'; onStatusChange('MAINTENANCE')"
              :class="[
                'p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer',
                form.status === 'MAINTENANCE' 
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                <span v-if="form.status === 'MAINTENANCE'" class="text-[10px] font-black text-amber-700">✓ Active</span>
              </div>
              <div class="mt-2">
                <p class="font-black text-xs">ልዩ ማሳሰቢያ / ጥገና</p>
                <p class="text-[10px] text-slate-500 mt-0.5">ጥገና ወይም ልዩ ሰዓት</p>
              </div>
            </button>

          </div>
        </div>

        <!-- 2. Reopening Time with Quick Choice Chips -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-black text-slate-700 uppercase tracking-wider">
              የሚከፈትበት ሰዓት (Next Opening Time) *
            </label>
            <span class="text-[10px] text-slate-400">ለምሳሌ፡ ነገ ጥዋት 2:30 ሰዓት</span>
          </div>

          <input 
            v-model="form.reopenTime" 
            required 
            type="text" 
            placeholder="e.g. ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)" 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white" 
          />

          <!-- Quick Chips -->
          <div class="flex items-center gap-1.5 flex-wrap mt-2">
            <span class="text-[10px] text-slate-400 font-bold">ፈጣን ምርጫዎች:</span>
            <button 
              v-for="chip in quickTimeChips" 
              :key="chip"
              type="button"
              @click="form.reopenTime = chip"
              class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-medium transition cursor-pointer border border-slate-200/60"
            >
              {{ chip }}
            </button>
          </div>
        </div>

        <!-- 3. Announcement Message Textarea with Templates -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-black text-slate-700 uppercase tracking-wider">
              የማሳሰቢያ መልዕክት (Public Notice Message) *
            </label>
            <span class="text-[10px] text-blue-600 font-bold">በመላው ድረ-ገጽ ለሁሉም ይታያል</span>
          </div>

          <textarea 
            v-model="form.noticeMessage" 
            required 
            rows="3" 
            placeholder="ለምሳሌ፡ ውድ ተማሪዎች እና መምህራን፣ የቤተ-መጽሐፍት የውሰትና መመለሻ አገልግሎት በዚህ ሰዓት ዝግ ነው።"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"
          ></textarea>

          <!-- Quick Template Chips -->
          <div class="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span class="text-[10px] text-slate-400 font-bold">መልዕክት ምሳሌዎች:</span>
            <button 
              type="button"
              @click="applyTemplate('NIGHT')"
              class="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-bold hover:bg-rose-100 transition cursor-pointer border border-rose-200"
            >
              🌙 የምሽት መዘጋት
            </button>
            <button 
              type="button"
              @click="applyTemplate('WEEKEND')"
              class="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer border border-amber-200"
            >
              🏖️ የሳምንቱ መጨረሻ
            </button>
            <button 
              type="button"
              @click="applyTemplate('OPEN')"
              class="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer border border-emerald-200"
            >
              ☀️ መደበኛ ክፍት
            </button>
          </div>
        </div>

        <!-- 4. Standard Working Hours -->
        <div>
          <label class="block font-black text-slate-700 uppercase tracking-wider mb-1">
            መደበኛ የስራ ሰዓት (Standard Working Hours)
          </label>
          <input 
            v-model="form.workingHours" 
            type="text" 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white" 
          />
        </div>

        <!-- 5. Active Announcement Broadcast Checkbox -->
        <div class="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between">
          <div>
            <p class="font-black text-blue-900 text-xs">ማሳወቂያው ለሁሉም ተጠቃሚዎች ይተላለፍ?</p>
            <p class="text-[10px] text-blue-700">Broadcast banner on all public pages, catalog search, and portals</p>
          </div>
          <input 
            v-model="form.isAnnouncementActive" 
            type="checkbox" 
            class="w-5 h-5 accent-blue-600 rounded cursor-pointer" 
          />
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            ዝጋ (Cancel)
          </button>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
          >
            <Megaphone :size="14" />
            <span>{{ isSubmitting ? 'እየተላለፈ ነው...' : 'አሳውቅና አስተላልፍ (Broadcast)' }}</span>
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Clock, X, Megaphone } from 'lucide-vue-next'
import { useServiceStatusStore } from '~/stores/serviceStatus'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const statusStore = useServiceStatusStore()
const authStore = useAuthStore()
const isSubmitting = ref(false)

const form = ref({
  status: 'OPEN' as 'OPEN' | 'CLOSED' | 'MAINTENANCE',
  reopenTime: 'ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)',
  noticeMessage: 'ላይብረሪው በዚህ ሰዓት አገልግሎት አይሰጥም፣ በስራ ሰዓት ይጠቀሙ።',
  workingHours: 'ከሰኞ - አርብ፡ 2:00 ጥዋት - 4:00 ማታ | ቅዳሜና እሁድ፡ 2:30 ጥዋት - 12:00 ቀን',
  isAnnouncementActive: true
})

const quickTimeChips = [
  'ነገ ጥዋት 2:30 ሰዓት (Tomorrow 8:30 AM)',
  'ሰኞ ጥዋት 2:30 ሰዓት (Monday 8:30 AM)',
  'ከምሳ በኋላ 8:00 ሰዓት (2:00 PM)',
  'በቅርቡ ይከፈታል (Opening Soon)'
]

const onStatusChange = (status: 'OPEN' | 'CLOSED' | 'MAINTENANCE') => {
  if (status === 'OPEN') {
    form.value.noticeMessage = 'የቤተ-መጽሐፍት የውሰትና መመለሻ አገልግሎት ክፍት ነው። እንኳን በደህና መጡ!'
    form.value.isAnnouncementActive = false
  } else if (status === 'CLOSED') {
    form.value.noticeMessage = 'ውድ ተማሪዎች እና መምህራን፣ የቤተ-መጽሐፍት የውሰትና መመለሻ አገልግሎት በዚህ ሰዓት ዝግ ነው።'
    form.value.isAnnouncementActive = true
  } else {
    form.value.noticeMessage = 'የቤተ-መጽሐፍት ሲስተም በጥገና ላይ ስለሆነ ለጥቂት ጊዜያት አገልግሎት አይሰጥም።'
    form.value.isAnnouncementActive = true
  }
}

const applyTemplate = (type: 'NIGHT' | 'WEEKEND' | 'OPEN') => {
  if (type === 'NIGHT') {
    form.value.status = 'CLOSED'
    form.value.reopenTime = 'ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)'
    form.value.noticeMessage = 'የዛሬው የላይብረሪ የስራ ሰዓት ተጠናቋል። የውሰትና መመለሻ አገልግሎት ነገ ጥዋት ይቀጥላል።'
    form.value.isAnnouncementActive = true
  } else if (type === 'WEEKEND') {
    form.value.status = 'CLOSED'
    form.value.reopenTime = 'ሰኞ ጥዋት 2:30 ሰዓት (Monday at 8:30 AM)'
    form.value.noticeMessage = 'የሳምንቱ መጨረሻ የላይብረሪ የስራ ሰዓት ተጠናቋል። መደበኛ አገልግሎት ሰኞ ጥዋት 2:30 ሰዓት ይከፈታል።'
    form.value.isAnnouncementActive = true
  } else {
    form.value.status = 'OPEN'
    form.value.reopenTime = 'በአገልግሎት ላይ ነው (Open Now)'
    form.value.noticeMessage = 'የቤተ-መጽሐፍት የውሰትና መመለሻ አገልግሎት ክፍት ነው።'
    form.value.isAnnouncementActive = false
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    form.value.status = statusStore.status
    form.value.reopenTime = statusStore.reopenTime || 'ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)'
    form.value.noticeMessage = statusStore.noticeMessage || 'ላይብረሪው በዚህ ሰዓት አገልግሎት አይሰጥም፣ በስራ ሰዓት ይጠቀሙ።'
    form.value.workingHours = statusStore.workingHours || 'ከሰኞ - አርብ፡ 2:00 ጥዋት - 4:00 ማታ | ቅዳሜና እሁድ፡ 2:30 ጥዋት - 12:00 ቀን'
    form.value.isAnnouncementActive = statusStore.isAnnouncementActive || statusStore.status !== 'OPEN'
  }
})

const handleSaveStatus = async () => {
  isSubmitting.value = true
  try {
    const updaterName = `${authStore.user?.name || 'Staff'} (${authStore.userRoleBadge || 'Librarian/Admin'})`
    await statusStore.updateStatus({
      status: form.value.status,
      noticeMessage: form.value.noticeMessage,
      reopenTime: form.value.reopenTime,
      workingHours: form.value.workingHours,
      isAnnouncementActive: form.value.isAnnouncementActive,
      updatedBy: updaterName
    })
    alert('የቤተ-መጽሐፍት የስራ ሰዓት እና ማሳወቂያ በተሳካ ሁኔታ ተላልፏል! (Operating status updated and broadcasted to everyone!)')
    emit('saved')
    emit('close')
  } catch (err: any) {
    alert(err?.message || 'Failed to update operating status')
  } finally {
    isSubmitting.value = false
  }
}
</script>
