// app/stores/serviceStatus.ts
import { defineStore } from 'pinia'

export interface ServiceStatusState {
  isOpen: boolean
  status: 'OPEN' | 'CLOSED' | 'MAINTENANCE'
  noticeMessage: string
  reopenTime: string
  workingHours: string
  isAnnouncementActive: boolean
  updatedBy: string
  updatedAt: string | null
  isLoading: boolean
  isDismissed: boolean
}

export const useServiceStatusStore = defineStore('serviceStatus', {
  state: (): ServiceStatusState => ({
    isOpen: true,
    status: 'OPEN',
    noticeMessage: 'ላይብረሪው ክፍት ነው (Library service is open)',
    reopenTime: 'ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)',
    workingHours: 'ከሰኞ - አርብ፡ 2:00 ጥዋት - 4:00 ማታ | ቅዳሜና እሁድ፡ 2:30 ጥዋት - 12:00 ቀን',
    isAnnouncementActive: false,
    updatedBy: 'MAU Library Circulation',
    updatedAt: null,
    isLoading: false,
    isDismissed: false,
  }),

  getters: {
    shouldShowBanner: (state) => {
      if (state.isDismissed) return false
      return !state.isOpen || state.status !== 'OPEN' || state.isAnnouncementActive
    },
    statusBadgeText: (state) => {
      if (state.status === 'OPEN') return 'ክፍት ነው (Open)'
      if (state.status === 'CLOSED') return 'አገልግሎት አይሰጥም (Closed)'
      return 'በጥገና ላይ (Maintenance)'
    },
    statusBadgeColor: (state) => {
      if (state.status === 'OPEN') return 'bg-emerald-500'
      if (state.status === 'CLOSED') return 'bg-rose-500'
      return 'bg-amber-500'
    }
  },

  actions: {
    async fetchStatus() {
      try {
        this.isLoading = true
        const res: any = await $fetch('/api/service-status')
        if (res && res.success) {
          this.isOpen = Boolean(res.isOpen)
          this.status = res.status || (this.isOpen ? 'OPEN' : 'CLOSED')
          this.noticeMessage = res.noticeMessage || ''
          this.reopenTime = res.reopenTime || ''
          this.workingHours = res.workingHours || ''
          this.isAnnouncementActive = Boolean(res.isAnnouncementActive)
          this.updatedBy = res.updatedBy || ''
          this.updatedAt = res.updatedAt || null
        }
      } catch (err) {
        console.error('Failed to load service status:', err)
      } finally {
        this.isLoading = false
      }
    },

    async updateStatus(payload: {
      status: 'OPEN' | 'CLOSED' | 'MAINTENANCE'
      noticeMessage: string
      reopenTime: string
      workingHours: string
      isAnnouncementActive?: boolean
      updatedBy?: string
    }) {
      this.isLoading = true
      try {
        const res: any = await $fetch('/api/service-status', {
          method: 'POST',
          body: {
            ...payload,
            isOpen: payload.status === 'OPEN'
          }
        })
        if (res?.data) {
          this.isOpen = Boolean(res.data.isOpen)
          this.status = res.data.status
          this.noticeMessage = res.data.noticeMessage
          this.reopenTime = res.data.reopenTime
          this.workingHours = res.data.workingHours
          this.isAnnouncementActive = Boolean(res.data.isAnnouncementActive)
          this.updatedBy = res.data.updatedBy
          this.updatedAt = res.data.updatedAt
          this.isDismissed = false // Reset dismissal so everyone sees the new announcement
        }
        return res
      } catch (err: any) {
        throw new Error(err?.data?.message || err?.message || 'Failed to update operating status')
      } finally {
        this.isLoading = false
      }
    },

    dismissBanner() {
      this.isDismissed = true
    }
  }
})
