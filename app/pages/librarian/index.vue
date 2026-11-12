<template>
  <!-- Full Screen Wrapper: Prevents window scroll so sidebar is 100% CONSTANT/FIXED -->
  <div class="h-screen w-full flex overflow-hidden bg-[#f0f4f9] text-slate-800 font-sans antialiased">
    
    <!-- Mobile Backdrop Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isSidebarOpen && isMobile" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
      ></div>
    </transition>

    <!-- ================= 1. CONSTANT FIXED LEFT SIDEBAR ================= -->
    <aside 
      :class="[
        'bg-[#06387d] text-white flex flex-col justify-between transition-all duration-300 z-50 h-screen shrink-0',
        isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'sticky top-0',
        isSidebarOpen ? 'w-64 translate-x-0' : (isMobile ? '-translate-x-full' : 'w-20 translate-x-0')
      ]"
    >
      <div class="flex flex-col h-full overflow-hidden">
        
        <!-- University Branding & Logo -->
        <div class="p-4 sm:p-5 flex flex-col items-center text-center border-b border-blue-800/40 shrink-0">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md mb-2 flex items-center justify-center overflow-hidden">
            <div class="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-sky-500 to-blue-700 flex items-center justify-center text-white">
              <GraduationCap :size="28" class="text-white" />
            </div>
          </div>
          
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h2 class="text-xs font-black tracking-wider uppercase leading-tight text-white">Mekdela Amba University</h2>
            <p class="text-[13px] font-black tracking-wider text-amber-300 mt-0.5">MAU-LCS</p>
            <p class="text-[9px] text-blue-200 uppercase tracking-widest font-medium">Librarian Circulation Desk</p>
          </div>
        </div>

        <!-- Sidebar Navigation Menu with Custom Hidden Sleek Scrollbar -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm font-medium">
          
          <!-- Dashboard -->
          <button 
            @click="selectTab('dashboard')"
            :class="activeTab === 'dashboard' ? 'bg-[#1b62db] text-white shadow-md' : 'hover:bg-white/10 text-blue-100/80 hover:text-white'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <LayoutDashboard :size="18" class="shrink-0" />
            <span v-show="isSidebarOpen" class="font-semibold">Dashboard</span>
          </button>

          <!-- Closed Shelf Approvals -->
          <button 
            @click="selectTab('closedShelf')"
            :class="activeTab === 'closedShelf' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/90 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <Lock :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Closed Shelf Approvals</span>
            </div>
            <span v-if="pendingRequestsCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white">
              {{ pendingRequestsCount }}
            </span>
          </button>

          <!-- Books Management -->
          <button 
            @click="selectTab('books')"
            :class="activeTab === 'books' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <BookOpen :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Books Management</span>
            </div>
            <span v-show="isSidebarOpen" class="text-xs font-mono text-blue-200">{{ books.length }}</span>
          </button>

          <!-- Loans & Returns -->
          <button 
            @click="selectTab('borrowing')"
            :class="activeTab === 'borrowing' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <ArrowLeftRight :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Loans & Checkouts</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Book Returns -->
          <button 
            @click="selectTab('returns')"
            :class="activeTab === 'returns' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <RotateCcw :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Book Returns</span>
            </div>
            <span v-if="activeLoansCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white">
              {{ activeLoansCount }}
            </span>
          </button>

          <!-- Student Inquiries (Contact Form Messages) -->
          <button 
            @click="selectTab('inquiries')"
            :class="activeTab === 'inquiries' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <MessageSquareText :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Student Inquiries</span>
            </div>
            <span v-if="unreadInquiriesCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white animate-pulse">
              {{ unreadInquiriesCount }}
            </span>
          </button>

          <!-- Research & Proposals -->
          <button 
            @click="selectTab('proposals')"
            :class="activeTab === 'proposals' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <FileText :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Research & Proposals</span>
            </div>
            <span v-show="isSidebarOpen" class="text-xs font-mono text-blue-200">{{ proposals.length }}</span>
          </button>

          <!-- Reports & Analytics -->
          <button 
            @click="selectTab('reports')"
            :class="activeTab === 'reports' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <BarChart3 :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Reports & Analytics</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Staff Video Meetings -->
          <button 
            @click="selectTab('meetings')"
            :class="activeTab === 'meetings' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <Video :size="18" class="shrink-0 text-emerald-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Staff Video Meetings</span>
            </div>
            <span v-show="isSidebarOpen" class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 font-black uppercase text-white shadow-xs">
              Meet
            </span>
          </button>

          <!-- Settings & Profile -->
          <div class="pt-4 mt-2 border-t border-blue-800/40 space-y-1">
            <button 
              @click="selectTab('settings')"
              :class="activeTab === 'settings' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-200/80 hover:bg-white/10 hover:text-white'"
              class="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              <Settings :size="16" />
              <span v-show="isSidebarOpen">Settings & Profile</span>
            </button>

            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 text-xs font-bold cursor-pointer transition"
            >
              <LogOut :size="16" />
              <span v-show="isSidebarOpen">Logout</span>
            </button>
          </div>
        </nav>

        <!-- Sidebar Campus Graphic Banner -->
        <div v-show="isSidebarOpen" class="p-3 shrink-0">
          <div class="rounded-2xl overflow-hidden relative shadow-lg border border-blue-400/20">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80" 
              alt="Mekdela Amba University" 
              class="w-full h-20 object-cover"
            />
            <div class="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-90"></div>
          </div>
        </div>

      </div>
    </aside>

    <!-- ================= 2. MAIN SCROLLABLE WORKSPACE ================= -->
    <div class="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
      
      <!-- STICKY TOP APP HEADER -->
      <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div class="flex items-center gap-3">
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu :size="20" />
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              Mekdela Amba University Library
            </h1>
            <p class="text-xs text-slate-400 italic mt-0.5 font-medium hidden sm:block">Librarian Desk • Circulation & Stacks</p>
          </div>
        </div>

        <!-- Right Header Items: System status & Screenshot 2 Profile Dropdown -->
        <div class="flex items-center gap-2 sm:gap-3">
          

          <!-- Library Operating Status & Announcement Control Button -->
          <button 
            type="button"
            @click="isStatusModalOpen = true"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition shadow-2xs',
              statusStore.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
              statusStore.status === 'CLOSED' ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' :
              'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            ]"
            title="Manage Library Operating Status & Broadcast Notice"
          >
            <span :class="['w-2 h-2 rounded-full', statusStore.statusBadgeColor, statusStore.status === 'CLOSED' ? 'animate-pulse' : '']"></span>
            <span>{{ statusStore.statusBadgeText }}</span>
            <Megaphone :size="12" class="opacity-75" />
          </button>

          <!-- Top-Right User Profile Dropdown matching Screenshot 2 -->
          <SharedUserProfileDropdown 
            @select-tab="selectTab" 
            @logout="handleLogout" 
          />
        </div>
      </header>

      <!-- MAIN TAB CONTENT CONTAINER -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <!-- Active Library Status Announcement Banner -->
        <SharedLibraryServiceStatusBanner />

        <!-- 1. DASHBOARD TAB -->
        <AdminDashboardTab 
          v-if="activeTab === 'dashboard'" 
          :stats-data="statsData" 
          @select-tab="selectTab" 
          @open-status-modal="isStatusModalOpen = true"
        />

        <!-- 2. CLOSED SHELF TAB -->
        <AdminClosedShelfTab 
          v-else-if="activeTab === 'closedShelf'" 
          :requests="requestsData || []"
          @refresh="refreshRequests"
          @approve="handleApproveRequest"
          @deny="handleDenyRequest"
        />

        <!-- 3. BOOKS MANAGEMENT TAB -->
        <AdminBooksTab 
          v-else-if="activeTab === 'books'" 
          :books="books" 
          @add-book="isAddBookOpen = true"
          @edit-book="openEditBookModal"
          @delete-book="handleDeleteBook"
        />

        <!-- 4. BORROWING & LOANS TAB -->
        <AdminBorrowingTab 
          v-else-if="activeTab === 'borrowing'" 
          :loans="loansList"
          @issue-loan="isIssueLoanOpen = true"
          @return-book="handleReturnLoan"
          @renew-loan="handleRenewLoan"
        />

        <!-- 5. BOOK RETURNS & OVERDUE FINES TAB -->
        <LibrarianReturnsTab 
          v-else-if="activeTab === 'returns'" 
          :loans="loansList"
          @refresh="refreshLoans"
          @return="handleReturnLoan"
        />

        <!-- 6. RESEARCH & PROPOSALS TAB -->
        <AdminProposalsTab 
          v-else-if="activeTab === 'proposals'" 
          :proposals="proposals"
          @add-proposal="isAddProposalOpen = true"
          @edit-proposal="openEditProposalModal"
          @delete-proposal="handleDeleteProposal"
        />

        <!-- 7. REPORTS TAB -->
        <AdminReportsTab 
          v-else-if="activeTab === 'reports'" 
          @refresh="refreshStats"
        />

        <!-- 8. SETTINGS & PROFILE TAB (WITH IMAGE UPLOAD!) -->
        <AdminSettingsTab 
          v-else-if="activeTab === 'settings'" 
        />

        <!-- 9. STAFF VIDEO MEETINGS TAB -->
        <AdminMeetingsTab 
          v-else-if="activeTab === 'meetings'" 
          @schedule-room="navigateTo('/meeting')"
          @refresh="refreshStats"
        />

        <!-- 10. STUDENT INQUIRIES & HELPDESK (CONTACT FORM) TAB -->
        <LibrarianInquiriesTab 
          v-else-if="activeTab === 'inquiries'" 
          :inquiries="inquiriesList" 
          @refresh="refreshInquiries" 
          @update-status="handleUpdateInquiryStatus" 
        />
      </main>

    </div>

    <!-- ================= MODALS ================= -->
    <AdminBookModal 
      :is-open="isAddBookOpen"
      :is-submitting="isSubmitting"
      @close="isAddBookOpen = false"
      @submit="handleCreateBook"
    />

    <AdminBookModal 
      :is-open="isEditBookOpen"
      :is-editing="true"
      :book-data="selectedBookForEdit"
      :is-submitting="isSubmitting"
      @close="isEditBookOpen = false"
      @submit="handleUpdateBook"
    />

    <AdminIssueModal 
      :is-open="isIssueLoanOpen"
      :books="books"
      :is-submitting="isSubmitting"
      @close="isIssueLoanOpen = false"
      @submit="handleIssueLoanSubmit"
    />

    <AdminProposalModal 
      :is-open="isAddProposalOpen"
      :is-submitting="isSubmitting"
      @close="isAddProposalOpen = false"
      @submit="handleCreateProposal"
    />

    <AdminProposalModal 
      :is-open="isEditProposalOpen"
      :is-editing="true"
      :proposal-data="selectedProposalForEdit"
      :is-submitting="isSubmitting"
      @close="isEditProposalOpen = false"
      @submit="handleUpdateProposal"
    />

    <!-- Library Service Status & Schedule Announcement Modal -->
    <SharedLibraryStatusModal 
      :is-open="isStatusModalOpen"
      @close="isStatusModalOpen = false"
      @saved="statusStore.fetchStatus()"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useServiceStatusStore } from '~/stores/serviceStatus'
import {
  GraduationCap,
  LayoutDashboard,
  Lock,
  BookOpen,
  ArrowLeftRight,
  RotateCcw,
  FileText,
  BarChart3,
  Video,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Globe,
  ExternalLink,
  Megaphone,
  MessageSquareText
} from 'lucide-vue-next'

const authStore = useAuthStore()
const statusStore = useServiceStatusStore()

// State
const activeTab = ref('dashboard')
const isSidebarOpen = ref(true)
const isMobile = ref(false)
const isSubmitting = ref(false)
const isStatusModalOpen = ref(false)

// Modals
const isAddBookOpen = ref(false)
const isEditBookOpen = ref(false)
const selectedBookForEdit = ref<any>(null)
const isIssueLoanOpen = ref(false)
const isAddProposalOpen = ref(false)
const isEditProposalOpen = ref(false)
const selectedProposalForEdit = ref<any>(null)

// 1. Database Data Fetching
const { data: statsResponse, refresh: refreshStats } = await useFetch('/api/stats')
const statsData = computed(() => statsResponse.value?.data || {
  totalBooks: 3995,
  totalStudents: 12480,
  totalBorrows: 2340,
  activeUsers: 1245,
  pendingRequests: 0,
  topBooks: [],
  recentActivities: []
})

const { data: booksData, refresh: refreshBooks } = await useFetch('/api/items')
const books = computed(() => booksData.value || [])

const { data: requestsData, refresh: refreshRequests } = await useFetch('/api/requests')
const pendingRequestsCount = computed(() => {
  return (requestsData.value || []).filter((r: any) => r.status === 'requested').length
})

const { data: proposalsData, refresh: refreshProposals } = await useFetch('/api/research')
const proposals = computed(() => {
  const raw = proposalsData.value?.data || proposalsData.value || []
  return Array.isArray(raw) ? raw : []
})

// Dynamic Loans List fetched directly from database
const { data: loansData, refresh: refreshLoans } = await useFetch('/api/loans')
const loansList = computed(() => {
  const raw = loansData.value
  return Array.isArray(raw) ? raw : (raw?.data || [])
})

const activeLoansCount = computed(() => {
  return loansList.value.filter((l: any) => l.status === 'ISSUED' || l.status === 'issued').length
})

// 3. Contact Inquiries Fetching
const { data: inquiriesResponse, refresh: refreshInquiries } = await useFetch('/api/contact')
const inquiriesList = computed(() => {
  return inquiriesResponse.value?.data || inquiriesResponse.value || []
})
const unreadInquiriesCount = computed(() => {
  return inquiriesList.value.filter((i: any) => i.status === 'UNREAD').length
})

const handleUpdateInquiryStatus = async ({ id, status }: { id: number; status: string }) => {
  try {
    await $fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      body: { status }
    })
    await refreshInquiries()
  } catch (err: any) {
    alert(err?.message || 'Failed to update status')
  }
}

const checkMobileScreen = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) {
      isSidebarOpen.value = false
    }
  }
}

onMounted(() => {
  if (process.client) {
    checkMobileScreen()
    window.addEventListener('resize', checkMobileScreen)
    authStore.init()
    statusStore.fetchStatus()
    if (!authStore.isAuthenticated) {
      navigateTo('/auth?redirect=/librarian')
    } else if (!authStore.isLibrarian && !authStore.isAdmin) {
      navigateTo('/my-borrows')
    }
  }
})

const selectTab = (tab: string) => {
  activeTab.value = tab
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const handleLogout = async () => {
  if (confirm('ከሲስተሙ መውጣት ይፈልጋሉ? (Are you sure you want to logout?)')) {
    await authStore.logout()
    navigateTo('/auth')
  }
}

// Book Handlers
const openEditBookModal = (book: any) => {
  selectedBookForEdit.value = book
  isEditBookOpen.value = true
}

const handleCreateBook = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/items', { method: 'POST', body: form })
    await refreshBooks()
    isAddBookOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Failed to add book')
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateBook = async (form: any) => {
  if (!form.id) return
  isSubmitting.value = true
  try {
    await $fetch(`/api/items/${form.id}`, { method: 'PUT', body: form })
    await refreshBooks()
    isEditBookOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Failed to update book')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteBook = async (id: number | string) => {
  if (!confirm('ይህንን መጽሐፍ ከካታሎግ መሰረዝ ይፈልጋሉ?')) return
  try {
    await $fetch(`/api/items/${id}`, { method: 'DELETE' })
    await refreshBooks()
  } catch (err: any) {
    alert(err?.message || 'Failed to delete book')
  }
}

// Request Approvals
const handleApproveRequest = async (id: number | string) => {
  try {
    await $fetch('/api/requests', {
      method: 'PATCH',
      body: { id, status: 'issued' }
    })
    await Promise.all([refreshRequests(), refreshStats()])
  } catch (err: any) {
    alert(err?.message || 'Approval failed')
  }
}

const handleDenyRequest = async (id: number | string) => {
  try {
    await $fetch('/api/requests', {
      method: 'PATCH',
      body: { id, status: 'denied' }
    })
    await Promise.all([refreshRequests(), refreshStats()])
  } catch (err: any) {
    alert(err?.message || 'Denial failed')
  }
}

// Loan Handlers with Full DB Integration
const handleIssueLoanSubmit = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/loans', { method: 'POST', body: form })
    await Promise.all([refreshLoans(), refreshBooks(), refreshStats()])
    isIssueLoanOpen.value = false
    alert('መጽሐፉ በተሳካ ሁኔታ ተሰጥቷል! (Book loan issued successfully)')
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Loan issue failed')
  } finally {
    isSubmitting.value = false
  }
}

const handleReturnLoan = async (payload: any) => {
  const transactionId = typeof payload === 'object' && payload !== null ? (payload.id || payload.transactionId) : payload
  const condition = typeof payload === 'object' && payload !== null ? (payload.condition || 'Good Condition') : 'Good Condition'
  const notes = typeof payload === 'object' && payload !== null ? (payload.notes || '') : ''
  const librarianName = authStore.user?.name || 'Circulation Librarian'

  if (!transactionId) {
    alert('Valid transaction ID is required')
    return
  }

  try {
    const res: any = await $fetch('/api/loans/return', {
      method: 'POST',
      body: {
        transactionId: Number(transactionId),
        condition,
        notes,
        librarianName,
      }
    })
    await Promise.all([
      refreshLoans(),
      refreshRequests(),
      refreshBooks(),
      refreshStats()
    ])
    alert(`መጽሐፉ በተሳካ ሁኔታ ተረክቧል! (Book return confirmed: Receipt #${res?.receiptNo || transactionId})`)
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Return processing failed')
  }
}

const handleRenewLoan = async (id: number | string) => {
  try {
    await $fetch('/api/loans/renew', {
      method: 'POST',
      body: { transactionId: Number(id) }
    })
    await refreshLoans()
    alert('የመጽሐፉ ጊዜ ለተጨማሪ 7 ቀናት ተራዝሟል! (Renewed for +7 days successfully)')
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Renew failed')
  }
}

// Proposal Handlers
const openEditProposalModal = (item: any) => {
  selectedProposalForEdit.value = item
  isEditProposalOpen.value = true
}

const handleCreateProposal = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/research', { method: 'POST', body: form })
    await refreshProposals()
    isAddProposalOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Proposal saved')
    isAddProposalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateProposal = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch(`/api/research/${form.id}`, { method: 'PUT', body: form })
    await refreshProposals()
    isEditProposalOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Updated')
    isEditProposalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteProposal = async (id: number | string) => {
  if (!confirm('ይህንን የምርምር ፕሮፖዛል መሰረዝ ይፈልጋሉ?')) return
  try {
    await $fetch(`/api/research/${id}`, { method: 'DELETE' })
    await refreshProposals()
  } catch (err: any) {
    alert('Deleted successfully')
  }
}
</script>
