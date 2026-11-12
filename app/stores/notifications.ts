// app/stores/notifications.ts
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export interface AppNotification {
  id: string | number
  title: string
  message: string
  type: 'borrow' | 'return' | 'request' | 'system' | 'meeting'
  createdAt: string
  read: boolean
  link?: string
  tab?: string
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as AppNotification[],
    isInitialized: false,
  }),

  getters: {
    unreadCount: (state): number => state.notifications.filter((n) => !n.read).length,
    allNotifications: (state): AppNotification[] => state.notifications,
  },

  actions: {
    initNotifications() {
      if (this.isInitialized && this.notifications.length > 0) return

      const authStore = useAuthStore()
      const role = String(authStore.user?.userType || authStore.user?.role || '').toLowerCase()

      let defaultList: AppNotification[] = []

      if (role === 'librarian') {
        defaultList = [
          {
            id: 'lib-1',
            title: 'አዲስ የመጽሐፍ መልስ ጥያቄ (Return Request)',
            message: 'ተማሪዎች ለመመለስ ያዘጋጁት የመመለሻ ስሊፕ (RET-REQ-00009) በካውንተር ዝግጁ ነው።',
            type: 'return',
            createdAt: 'Just now',
            read: false,
            link: '/librarian',
            tab: 'returns',
          },
          {
            id: 'lib-2',
            title: 'የተዘጋ መደርደሪያ ፈቃድ (Closed Shelf)',
            message: 'አዲስ የዝግ መደርደሪያ መጽሐፍት ማረጋገጫ ጥያቄዎች ቀርበዋል።',
            type: 'request',
            createdAt: '15m ago',
            read: false,
            link: '/librarian',
            tab: 'closedShelf',
          },
          {
            id: 'lib-3',
            title: 'የውሰት ቀነ-ቀጠሮ ማሳሰቢያ (Due Reminder)',
            message: 'የአጭር ጊዜ ውሰት (Short Loan) የወሰዱ ተማሪዎች የመመለሻ ቀን ደርሷል።',
            type: 'borrow',
            createdAt: '1h ago',
            read: false,
            link: '/librarian',
            tab: 'borrowing',
          },
        ]
      } else if (role === 'admin' || role === 'administrator') {
        defaultList = [
          {
            id: 'adm-1',
            title: 'የሲስተም ሁኔታ ሪፖርት (Live Analytics)',
            message: 'የዛሬው የቤተ-መጽሐፍት የውሰት እና የመመለሻ ስታቲስቲክስ ዝግጁ ነው።',
            type: 'system',
            createdAt: '10m ago',
            read: false,
            link: '/admin',
            tab: 'reports',
          },
          {
            id: 'adm-2',
            title: 'የተጠቃሚዎች ምዝገባ (User Management)',
            message: 'አዲስ የላይብረሪያን እና የተማሪዎች አካውንት መፍጠርና ማስተካከል ይችላሉ።',
            type: 'system',
            createdAt: '45m ago',
            read: false,
            link: '/admin',
            tab: 'users',
          },
          {
            id: 'adm-3',
            title: 'የሰራተኞች የቪዲዮ ስብሰባ (Staff Video Meeting)',
            message: 'የላይብረሪ ስራ አመራር የቪዲዮ ስብሰባ ክፍል ዝግጁ ነው።',
            type: 'meeting',
            createdAt: '2h ago',
            read: false,
            link: '/admin',
            tab: 'meetings',
          },
        ]
      } else {
        // Students / Faculty / General Patrons
        defaultList = [
          {
            id: 'stu-1',
            title: 'የመጽሐፍ ውሰት ቀጠሮ (Due Date Notice)',
            message: 'የወሰዱት መጽሐፍ ቀነ-ቀጠሮ Nov 16, 2026 ነው። በሰዓቱ መልሰው ደረሰኝ ያግኙ።',
            type: 'borrow',
            createdAt: 'Just now',
            read: false,
            link: '/my-borrows',
          },
          {
            id: 'stu-2',
            title: 'የመመለሻ ስሊፕ (Return Slip Ready)',
            message: 'መጽሐፍ ለመመለስ የመመለሻ መለያ (RET-REQ) በመያዝ በዋናው ዴስክ ያስረክቡ።',
            type: 'return',
            createdAt: '25m ago',
            read: false,
            link: '/my-borrows',
          },
          {
            id: 'stu-3',
            title: 'አዲስ መጽሐፍት ተካተዋል (New Arrivals)',
            message: 'አዳዲስ የኮምፒውተር ሳይንስ እና ኢንጂነሪንግ መጽሐፍት ወደ ካታሎግ ገብተዋል።',
            type: 'system',
            createdAt: '3h ago',
            read: true,
            link: '/search',
          },
        ]
      }

      this.notifications = defaultList
      this.isInitialized = true
    },

    markAsRead(id: string | number) {
      const item = this.notifications.find((n) => n.id === id)
      if (item) {
        item.read = true
      }
    },

    markAllAsRead() {
      this.notifications.forEach((n) => {
        n.read = true
      })
    },

    addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
      this.notifications.unshift({
        ...notif,
        id: Date.now(),
        createdAt: 'Just now',
        read: false,
      })
    },

    clearNotification(id: string | number) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },
  },
})
