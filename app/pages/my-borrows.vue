<!-- pages/my-borrows.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const borrows = ref<any[]>([])
const activeFilter = ref<'ALL' | 'ISSUED' | 'RETURNED'>('ALL')
const searchQuery = ref('')

// Return Receipt Modal state
const selectedReceipt = ref<any | null>(null)
const isReceiptModalOpen = ref(false)

// Return Request / Voucher Modal state
const returnNotice = ref<any | null>(null)
const isReturnNoticeOpen = ref(false)

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const fetchUserBorrows = async () => {
  loading.value = true
  try {
    const userId = authStore.currentUserId || authStore.user?.userId || authStore.user?.id
    const url = userId ? `/api/loans?userId=${encodeURIComponent(userId)}` : '/api/loans'
    const res: any = await $fetch(url)
    borrows.value = Array.isArray(res) ? res : (res?.data || [])
  } catch (err) {
    console.error('Failed to load user borrows:', err)
  } finally {
    loading.value = false
  }
}

const filteredBorrows = computed(() => {
  let list = borrows.value
  if (activeFilter.value !== 'ALL') {
    list = list.filter((b) => b.status === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((b) =>
      b.bookTitle?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q) ||
      b.shelfNumber?.toLowerCase().includes(q)
    )
  }
  return list
})

const activeCount = computed(() => borrows.value.filter((b) => b.status === 'ISSUED').length)
const overdueCount = computed(() => borrows.value.filter((b) => b.isOverdue && b.status === 'ISSUED').length)
const returnedCount = computed(() => borrows.value.filter((b) => b.status === 'RETURNED').length)

// 1. Student initiates return (Request Return / መመለሻ ጠይቅ)
const initiateReturn = (borrow: any) => {
  returnNotice.value = {
    transactionId: borrow.transactionId || borrow.id,
    bookTitle: borrow.bookTitle,
    author: borrow.author,
    isbn: borrow.isbn,
    shelfNumber: borrow.shelfNumber,
    dueDate: borrow.dueDate,
    isOverdue: borrow.isOverdue,
    fineAmount: borrow.fineAmount,
    loanType: borrow.loanType,
    refCode: `RET-REQ-${(borrow.transactionId || borrow.id).toString().padStart(5, '0')}`,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
  isReturnNoticeOpen.value = true
}

const handleDoneReturnSlip = () => {
  const code = returnNotice.value?.refCode || 'RET-REQ'
  isReturnNoticeOpen.value = false
  fetchUserBorrows()
  alert(`የመመለሻ መለያ #${code} ተመዝግቧል!\nእባክዎ ይህንን መለያ ለላይብረሪያኑ በማሳየት መጽሐፉን በካውንተር ያስረክቡ። ላይብረሪያኑ እንዳረጋገጠው የመመለሻ ማረጋገጫ ደረሰኝዎ እዚህ ገጽ ላይ ይደርስዎታል።`)
}

// 2. View official return clearance certificate
const openReceiptModal = (borrow: any) => {
  selectedReceipt.value = {
    receiptNo: borrow.receiptNo || `RET-${new Date(borrow.returnDate || borrow.dueDate).getFullYear()}-${String(borrow.transactionId || borrow.id).padStart(5, '0')}`,
    transactionId: borrow.transactionId || borrow.id,
    bookTitle: borrow.bookTitle,
    author: borrow.author,
    isbn: borrow.isbn || 'N/A',
    studentName: borrow.borrowerName || authStore.user?.name || 'Student Patron',
    studentId: borrow.borrowerId || authStore.currentUserId || 'N/A',
    department: borrow.department || authStore.user?.department || 'General',
    issueDate: borrow.issueDate,
    dueDate: borrow.dueDate,
    returnDate: borrow.returnDate || formatDate(new Date()),
    loanType: borrow.loanType || 'LONG',
    shelfType: borrow.shelfType || 'Open Shelf',
    fineAmount: borrow.fineAmount || 0,
    status: 'RETURNED & CLEARED',
    verifiedBy: 'Mekdela Amba University Library Circulation Desk',
  }
  isReceiptModalOpen.value = true
}

const printReceipt = () => {
  window.print()
}

onMounted(() => {
  authStore.init()
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=/my-borrows')
    return
  }
  fetchUserBorrows()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header & User Info -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">📚</span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              የእኔ ውሰቶች እና የመመለሻ ማረጋገጫዎች
            </h1>
          </div>
          <p class="text-xs text-slate-500">
            My Borrowed Books, Active Loans & Official Return Clearance Certificates
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              👤 {{ authStore.user?.name || 'Student' }} ({{ authStore.currentUserId || 'ID: N/A' }})
            </span>
            <span class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              🏛️ {{ authStore.user?.department || 'General' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto">
          <NuxtLink to="/search" class="px-4 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition">
            + አዳዲስ መጻሕፍት ፈልግ (Catalog)
          </NuxtLink>
          <button @click="fetchUserBorrows()" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition" title="Refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p class="text-2xl font-black text-slate-900">{{ borrows.length }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">አጠቃላይ ውሰቶች (Total)</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs">
          <p class="text-2xl font-black text-blue-600">{{ activeCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">በእጅ ያሉ መጻሕፍት (Active)</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <p class="text-2xl font-black text-rose-600">{{ overdueCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">ያረፈዱ (Overdue Fines ⚠️)</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <p class="text-2xl font-black text-emerald-600">{{ returnedCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">የተመለሱ ማረጋገጫዎች (Cleared ✓)</p>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              v-for="tab in [['ALL', 'ሁሉንም (All)'], ['ISSUED', 'በእጅ ያሉ (Active)'], ['RETURNED', 'የተመለሱ (Returned & Cleared)']]"
              :key="tab[0]"
              @click="activeFilter = tab[0] as any"
              :class="activeFilter === tab[0] ? 'bg-white text-[#06387d] shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              class="px-4 py-2 rounded-lg transition cursor-pointer flex-1 sm:flex-none text-center"
            >
              {{ tab[1] }}
            </button>
          </div>

          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, isbn, shelf..."
              class="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition"
            />
          </div>
        </div>

        <!-- Borrows List -->
        <div v-if="loading" class="py-16 text-center text-slate-400">
          <div class="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-bold">መረጃዎች እየተጫኑ ነው... (Loading your circulation history...)</p>
        </div>

        <div v-else-if="filteredBorrows.length === 0" class="py-16 text-center text-slate-400">
          <span class="text-4xl block mb-2">📖</span>
          <p class="text-sm font-bold text-slate-700">ምንም መጽሐፍ አልተገኘም (No borrow records found)</p>
          <p class="text-xs mt-1">መጽሐፍ ለመዋስ ወደ ማውጫው ገጽ በመሄድ ይጠይቁ።</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 uppercase font-black">
                <th class="py-3 px-3">Tx #</th>
                <th class="py-3 px-3">መጽሐፍ (Book Details)</th>
                <th class="py-3 px-3">የውሰት አይነት</th>
                <th class="py-3 px-3">የቀጠሮ ቀን (Due Date)</th>
                <th class="py-3 px-3">የቅጣት ሁኔታ (Fine)</th>
                <th class="py-3 px-3 text-center">ሁኔታ (Status)</th>
                <th class="py-3 px-3 text-right">የመመለሻ ማረጋገጫ (Action / Proof)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in filteredBorrows" :key="b.id" class="hover:bg-slate-50/70 transition">
                <!-- Transaction ID -->
                <td class="py-3.5 px-3 font-mono font-bold text-slate-500">
                  #{{ b.transactionId || b.id }}
                </td>

                <!-- Book Details -->
                <td class="py-3.5 px-3">
                  <p class="font-bold text-slate-900 text-xs">{{ b.bookTitle }}</p>
                  <p class="text-[10px] text-slate-400">{{ b.author }} • ISBN: {{ b.isbn || 'N/A' }}</p>
                  <span class="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Shelf: {{ b.shelfNumber || 'A-01' }}
                  </span>
                </td>

                <!-- Loan Type & Duration -->
                <td class="py-3.5 px-3">
                  <span
                    :class="b.loanType === 'SHORT' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'"
                    class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-block"
                  >
                    {{ b.loanType === 'SHORT' ? '⚡ SHORT' : '📚 LONG' }} ({{ b.durationDays }}d)
                  </span>
                </td>

                <!-- Due Date -->
                <td class="py-3.5 px-3 font-medium whitespace-nowrap">
                  <p :class="b.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'">
                    {{ formatDate(b.dueDate) }}
                  </p>
                  <span v-if="b.isOverdue" class="text-[10px] text-rose-500 font-bold">
                    ⚠️ ያረፈደ: {{ b.daysOverdue }} ቀን
                  </span>
                  <span v-else-if="b.status === 'ISSUED'" class="text-[10px] text-emerald-600 font-semibold">
                    ✓ በሰዓቱ ላይ
                  </span>
                </td>

                <!-- Fine Calculation -->
                <td class="py-3.5 px-3">
                  <span
                    v-if="b.fineAmount > 0"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 block w-fit"
                  >
                    {{ b.fineAmount }} ETB ቅጣት
                  </span>
                  <span v-else class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full block w-fit">
                    0.00 ETB (ቅጣት የለም)
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-3 text-center">
                  <span
                    :class="{
                      'bg-emerald-100 text-emerald-800 border-emerald-200': b.status === 'RETURNED',
                      'bg-blue-100 text-blue-800 border-blue-200': b.status === 'ISSUED',
                      'bg-amber-100 text-amber-800 border-amber-200': b.status === 'REQUESTED',
                    }"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border inline-block"
                  >
                    {{ b.status === 'RETURNED' ? '✓ ተመልሷል' : (b.status === 'ISSUED' ? '📖 በእጅ ያለ' : b.status) }}
                  </span>
                </td>

                <!-- Action / Proof -->
                <td class="py-3.5 px-3 text-right whitespace-nowrap">
                  <!-- Case 1: Book is currently with student (ISSUED) -> Option to request return voucher -->
                  <template v-if="b.status === 'ISSUED'">
                    <button
                      @click="initiateReturn(b)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1 ml-auto"
                    >
                      <span>🔄 መመለሻ ጠይቅ</span>
                      <span class="text-[9px] opacity-80">(Return Voucher)</span>
                    </button>
                  </template>

                  <!-- Case 2: Book is already returned (RETURNED) -> Official Clearance Receipt -->
                  <template v-else-if="b.status === 'RETURNED'">
                    <button
                      @click="openReceiptModal(b)"
                      class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5 ml-auto"
                    >
                      <span>📜 የመመለሻ ማረጋገጫ</span>
                      <span class="text-[9px] bg-emerald-800 px-1.5 py-0.5 rounded-full">Receipt</span>
                    </button>
                  </template>

                  <span v-else class="text-slate-400 text-xs italic">በሂደት ላይ...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ================= MODAL 1: RETURN SUBMISSION VOUCHER ================= -->
    <div v-if="isReturnNoticeOpen && returnNotice" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔄</span>
            <h3 class="font-black text-slate-900 text-sm">የመጽሐፍ መመለሻ መጠየቂያ (Return Slip)</h3>
          </div>
          <button @click="isReturnNoticeOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-1">
          <span class="text-[10px] uppercase font-bold text-blue-700 tracking-wider">የመመለሻ መለያ ኮድ (Return Tracking Code)</span>
          <p class="text-2xl font-mono font-black text-blue-900">{{ returnNotice.refCode }}</p>
          <p class="text-[11px] text-blue-800 font-medium pt-1">
            ይህንን ኮድ ለላይብረሪያኑ በማሳየት መጽሐፉን በካውንተር ያስረክቡ። ላይብረሪያኑ ሲያረጋግጥ የመመለሻ ማረጋገጫ ደረሰኝ ወዲያውኑ ይደርስዎታል።
          </p>
        </div>

        <div class="space-y-2 text-xs border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">የመጽሐፍ ርዕስ፡</span>
            <span class="font-bold text-slate-900 text-right">{{ returnNotice.bookTitle }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">የተማሪ መታወቂያ፡</span>
            <span class="font-bold text-slate-900 font-mono">{{ authStore.currentUserId }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">የቀነ-ቀጠሮ ቀን፡</span>
            <span class="font-bold text-slate-900">{{ formatDate(returnNotice.dueDate) }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200/60 pt-1.5">
            <span class="text-slate-500 font-medium">የቅጣት ሁኔታ፡</span>
            <span :class="returnNotice.fineAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'">
              {{ returnNotice.fineAmount > 0 ? returnNotice.fineAmount + ' ETB' : '0.00 ETB (በሰዓቱ)' }}
            </span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="handleDoneReturnSlip"
            class="w-full py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition text-center"
          >
            ተረድቻለሁ (Done)
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 2: OFFICIAL RETURN CLEARANCE CERTIFICATE ================= -->
    <div v-if="isReceiptModalOpen && selectedReceipt" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 print:shadow-none print:border-none">
        
        <!-- Printable Certificate Box -->
        <div id="print-receipt-area" class="border-2 border-emerald-600/30 rounded-2xl p-6 bg-radial from-emerald-50/20 to-white space-y-5">
          <!-- University Header -->
          <div class="text-center border-b border-slate-200 pb-4 space-y-1">
            <p class="text-xs font-black tracking-widest text-slate-400 uppercase">Mekdela Amba University</p>
            <h2 class="text-lg font-black text-slate-900">የቤተ-መጽሐፍት መመለሻ ማረጋገጫ ደረሰኝ</h2>
            <p class="text-xs font-bold text-emerald-800">OFFICIAL LIBRARY RETURN & CLEARANCE CERTIFICATE</p>
            <p class="text-[10px] font-mono text-slate-500 pt-1">Receipt No: <strong>{{ selectedReceipt.receiptNo }}</strong></p>
          </div>

          <!-- Certificate Body Details -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">የተማሪው ስም (Student Name)</span>
              <p class="font-bold text-slate-900">{{ selectedReceipt.studentName }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">የተማሪ መታወቂያ (Student ID)</span>
              <p class="font-bold text-slate-900 font-mono">{{ selectedReceipt.studentId }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">የትምህርት ክፍል (Department)</span>
              <p class="font-bold text-slate-800">{{ selectedReceipt.department }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">የውሰት አይነት (Loan Type)</span>
              <p class="font-bold text-slate-800">{{ selectedReceipt.loanType }} • {{ selectedReceipt.shelfType }}</p>
            </div>
          </div>

          <div class="border-t border-b border-slate-100 py-3 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">የመጽሐፉ ርዕስ (Book Title):</span>
              <span class="font-black text-slate-900 text-right max-w-[240px] truncate">{{ selectedReceipt.bookTitle }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">የተወሰደበት ቀን (Borrow Date):</span>
              <span class="font-bold text-slate-800 font-mono">{{ formatDate(selectedReceipt.issueDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">የተመለሰበት ቀን (Official Return Date):</span>
              <span class="font-bold text-emerald-700 font-mono">{{ formatDate(selectedReceipt.returnDate) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-100 pt-1.5">
              <span class="text-slate-600 font-bold">የቅጣት ክፍያ (Fine Settlement):</span>
              <span :class="selectedReceipt.fineAmount > 0 ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'">
                {{ selectedReceipt.fineAmount > 0 ? selectedReceipt.fineAmount + ' ETB (Paid / የተከፈለ)' : '0.00 ETB (በሰዓቱ የተመለሰ ✓)' }}
              </span>
            </div>
          </div>

          <!-- Official Stamp Seal -->
          <div class="flex items-center justify-between pt-2">
            <div class="border-2 border-emerald-600 rounded-xl px-3 py-1.5 text-center bg-emerald-50/50">
              <span class="text-[9px] font-black text-emerald-800 uppercase block tracking-wider">✓ VERIFIED & CLEARED</span>
              <span class="text-[8px] font-mono text-emerald-600">MAU LIBRARY CIRCULATION</span>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-slate-500 uppercase">ያረጋገጠው ላይብረሪያን</p>
              <p class="text-xs font-black text-slate-900">{{ selectedReceipt.verifiedBy }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            @click="isReceiptModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            ዝጋ (Close)
          </button>

          <button
            type="button"
            @click="printReceipt()"
            class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
          >
            <span>🖨️ ደረሰኙን አትም (Print Return Certificate)</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
