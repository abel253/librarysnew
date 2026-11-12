<!-- pages/research/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useResearchStore, type ResearchItem } from '~/stores/research'
import { useAuthStore } from '~/stores/auth'

const researchStore = useResearchStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedCollege = ref('All')
const selectedType = ref('All')
const showUploadModal = ref(false)

// Detail modal state
const selectedItem = ref<ResearchItem | null>(null)
const showDetailModal = ref(false)

// Upload Form State
const title = ref('')
const authorName = ref('')
const college = ref('College of Informatics')
const department = ref('Software Engineering')
const documentType = ref<'Proposal' | 'Thesis' | 'Research'>('Proposal')
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploadStatus = ref<{ type: 'idle' | 'checking' | 'success' | 'error'; msg: string }>({
  type: 'idle',
  msg: ''
})

const collegesList = [
  'All',
  'College of Informatics',
  'College of Engineering & Technology',
  'College of Health Sciences',
  'College of Business & Economics',
  'College of Agriculture & Natural Resource',
  'College of Social Sciences & Humanities'
]

onMounted(async () => {
  await researchStore.fetchResearch()
})

const triggerSearch = async () => {
  await researchStore.fetchResearch(searchQuery.value, selectedCollege.value)
}

const filteredList = computed(() => {
  let list = researchStore.researchList || []
  if (selectedType.value !== 'All') {
    list = list.filter((item) => (item.documentType || 'Research') === selectedType.value)
  }
  return list
})

// Metrics
const stats = computed(() => {
  const all = researchStore.researchList || []
  const proposals = all.filter(r => (r.documentType || '').toLowerCase() === 'proposal').length
  const theses = all.filter(r => (r.documentType || '').toLowerCase() === 'thesis').length
  const published = all.filter(r => (r.documentType || '').toLowerCase() === 'research').length
  return {
    total: all.length,
    proposals,
    theses,
    published
  }
})

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    validateAndSetFile(input.files[0])
  }
}

const onDropFile = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    validateAndSetFile(e.dataTransfer.files[0])
  }
}

const validateAndSetFile = (file: File) => {
  const validExts = ['.pdf', '.docx', '.doc', '.txt']
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!validExts.includes(ext)) {
    uploadStatus.value = {
      type: 'error',
      msg: 'ትክክለኛ ሰነድ ይምረጡ (PDF ወይም Word ብቻ)'
    }
    return
  }
  selectedFile.value = file
  uploadStatus.value = { type: 'idle', msg: '' }
  if (!title.value) {
    title.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  }
}

const openUploadModal = () => {
  if (process.client) {
    authStore.init()
  }
  if (!authStore.isAuthenticated) {
    alert('የምርምር ሰነድ ወይም ፕሮፖዛል ለመጫን እባክዎ መጀመሪያ ወደ መለያዎ ይግቡ! (Please login to deposit/upload research proposals)')
    navigateTo('/auth?redirect=/research')
    return
  }
  if (authStore.user) {
    authorName.value = authStore.user.name || authorName.value
    department.value = authStore.user.department || department.value
  }
  showUploadModal.value = true
}

const handleUploadSubmit = async () => {
  if (!selectedFile.value || !title.value.trim()) {
    uploadStatus.value = { type: 'error', msg: 'እባክዎ ርዕስ እና የጥናት ሰነድ ያስገቡ!' }
    return
  }

  const fd = new FormData()
  fd.append('title', title.value.trim())
  fd.append('author_name', authorName.value.trim())
  fd.append('college', college.value)
  fd.append('department', department.value)
  fd.append('document_type', documentType.value)
  fd.append('file', selectedFile.value)

  uploadStatus.value = {
    type: 'checking',
    msg: 'የይዘት ትክክለኛነት እና ተደጋጋሚነት (Deduplication) እየተመረመረ ነው...'
  }

  try {
    const res = await researchStore.uploadResearch(fd)
    uploadStatus.value = {
      type: 'success',
      msg: res.message || 'ጥናቱ በስኬት ተረጋግጦ ተመዝግቧል!'
    }
    setTimeout(() => {
      showUploadModal.value = false
      resetForm()
    }, 1400)
  } catch (err: any) {
    uploadStatus.value = {
      type: 'error',
      msg: err.message || 'ጥናቱን ማረጋገጥ አልተቻለም!'
    }
  }
}

const openDetails = (item: ResearchItem) => {
  selectedItem.value = item
  showDetailModal.value = true
}

const resetForm = () => {
  title.value = ''
  authorName.value = ''
  selectedFile.value = null
  uploadStatus.value = { type: 'idle', msg: '' }
}

const copyShareLink = (path: string) => {
  if (process.client) {
    navigator.clipboard.writeText(window.location.origin + path)
    alert('የሰነዱ ሊንክ ተቀድቷል (Link copied)!')
  }
}

// 🟢 Edit & Delete Operations
const showEditModal = ref(false)
const isUpdating = ref(false)
const editingItem = ref({
  id: 0,
  title: '',
  authorName: '',
  college: 'College of Informatics',
  department: 'Software Engineering',
  documentType: 'Proposal'
})

const openEditProposal = (item: ResearchItem) => {
  editingItem.value = {
    id: item.id,
    title: item.title,
    authorName: item.authorName || '',
    college: item.college || 'College of Informatics',
    department: item.department || 'Software Engineering',
    documentType: (item.documentType as any) || 'Proposal'
  }
  showEditModal.value = true
}

const handleUpdateSubmit = async () => {
  if (!editingItem.value.title.trim() || !editingItem.value.authorName.trim()) {
    alert('እባክዎ ርዕስ እና ደራሲ ያስገቡ! (Please enter Title and Author)')
    return
  }

  try {
    isUpdating.value = true
    await researchStore.updateResearch(editingItem.value.id, editingItem.value)
    showEditModal.value = false
    alert('የምርምር ሰነዱ በተሳካ ሁኔታ ተስተካክሏል! (Proposal updated successfully!)')
  } catch (err: any) {
    alert('ማስተካከል አልተቻለም: ' + (err.message || 'Update failed'))
  } finally {
    isUpdating.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('ይህን የምርምር ሰነድ በቋሚነት ለመሰረዝ እርግጠኛ ነዎት? (Are you sure you want to permanently delete this research proposal?)')) return

  try {
    await researchStore.deleteResearch(id)
    alert('ሰነዱ በተሳካ ሁኔታ ተሰርዟል! (Deleted successfully!)')
  } catch (err: any) {
    alert('መሰረዝ አልተቻለም: ' + (err.message || 'Delete failed'))
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans pb-24 selection:bg-amber-400 selection:text-slate-950">

    <header class="bg-gradient-to-r from-slate-900 via-[#003452] to-[#016592] text-white py-14 shadow-lg relative overflow-hidden">
      <div class="container mx-auto px-4 max-w-6xl relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3">
              <span>🛡️ AI & Algorithmic Academic Integrity</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight">
              Institutional Research Repository
            </h1>
            <p class="text-sky-100 text-sm md:text-base mt-2 max-w-2xl font-light">
              የተረጋገጡ የዩኒቨርሲቲው ጥናቶች፣ ፕሮፖዛሎች እና የፈጠራ ስራዎች ማህደር። እያንዳንዱ ጥናት ተደጋጋሚነትና ጥራቱ ተፈትሾ የተመዘገበ ነው።
            </p>
          </div>

          <button
            @click="openUploadModal"
            class="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2.5 shrink-0"
          >
            <span class="text-lg">📤</span>
            <span>Submit Proposal / Research</span>
          </button>
        </div>

        <!-- SEARCH BAR -->
        <div class="mt-8 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-2 max-w-3xl">
          <input
            v-model="searchQuery"
            @keyup.enter="triggerSearch"
            type="text"
            placeholder="Search by topic, keyword, or author..."
            class="flex-1 bg-white px-4 py-2.5 rounded-xl text-slate-800 text-sm outline-none font-medium placeholder-slate-400"
          />
          <button
            @click="triggerSearch"
            class="px-6 py-2.5 bg-[#01ACF2] hover:bg-[#0092ce] text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            Search
          </button>
        </div>
      </div>
    </header>

    <!-- ══════════════════════════════════════════════════════
         LUXURY GOLD METRIC TILES
         ══════════════════════════════════════════════════════ -->
    <div class="container mx-auto px-4 max-w-6xl -mt-9 relative z-20">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <!-- Total -->
        <div class="bg-white rounded-2xl p-4 shadow-xl border border-amber-200/80 hover:border-amber-400 transition transform hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Holdings</div>
              <div class="text-2xl font-serif font-black text-slate-900">{{ stats.total }}</div>
            </div>
          </div>
        </div>

        <!-- Proposals -->
        <div class="bg-white rounded-2xl p-4 shadow-xl border border-amber-200/80 hover:border-amber-400 transition transform hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100 text-yellow-700 border border-yellow-300 flex items-center justify-center text-xl shadow-xs">
              💡
            </div>
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Proposals</div>
              <div class="text-2xl font-serif font-black text-amber-700">{{ stats.proposals }}</div>
            </div>
          </div>
        </div>

        <!-- Theses -->
        <div class="bg-white rounded-2xl p-4 shadow-xl border border-amber-200/80 hover:border-amber-400 transition transform hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-xl shadow-xs">
              🎓
            </div>
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Senior Theses</div>
              <div class="text-2xl font-serif font-black text-emerald-800">{{ stats.theses }}</div>
            </div>
          </div>
        </div>

        <!-- Security Checked -->
        <div class="bg-white rounded-2xl p-4 shadow-xl border border-amber-200/80 hover:border-amber-400 transition transform hover:-translate-y-0.5">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xl shadow-xs font-bold">
              🛡️
            </div>
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Integrity Pass</div>
              <div class="text-2xl font-serif font-black text-slate-900">100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         COLLEGES FILTER & TYPE TOGGLES
         ══════════════════════════════════════════════════════ -->
    <main class="container mx-auto px-4 max-w-6xl mt-10">
      <div class="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm mb-8 space-y-3">
        <!-- Types pills -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Filter by Nature:</span>
            <div class="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                @click="selectedType = 'All'"
                :class="['px-3 py-1 rounded-lg font-bold transition cursor-pointer', selectedType === 'All' ? 'bg-[#031B2E] text-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900']"
              >All Works</button>
              <button
                @click="selectedType = 'Proposal'"
                :class="['px-3 py-1 rounded-lg font-bold transition cursor-pointer', selectedType === 'Proposal' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900']"
              >Proposals</button>
              <button
                @click="selectedType = 'Thesis'"
                :class="['px-3 py-1 rounded-lg font-bold transition cursor-pointer', selectedType === 'Thesis' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
              >Senior Theses</button>
              <button
                @click="selectedType = 'Internship'"
                :class="['px-3 py-1 rounded-lg font-bold transition cursor-pointer', selectedType === 'Internship' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
              >internship report</button>
              <button
                @click="selectedType = 'Research'"
                :class="['px-3 py-1 rounded-lg font-bold transition cursor-pointer', selectedType === 'Research' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900']"
              >Research Papers</button>
            </div>
          </div>

          <div class="text-xs text-slate-500 font-medium">
            Showing <strong class="text-amber-700 font-bold font-serif">{{ filteredList.length }}</strong> verified manuscripts
          </div>
        </div>

        <!-- Colleges Scrollable Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">College:</span>
          <button
            v-for="col in collegesList"
            :key="col"
            @click="selectedCollege = col; triggerSearch()"
            :class="[
              'px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer shrink-0',
              selectedCollege === col
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-sm ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ col }}
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           PREMIUM GOLD RESEARCH CARDS GRID
           ══════════════════════════════════════════════════════ -->
      <!-- Skeleton Loading -->
      <div v-if="researchStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-56"></div>
      </div>

      <!-- Real Cards Grid -->
      <div v-else-if="filteredList.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="research-luxury-card group"
        >
          <!-- Top Decorative Metallic Accent Bar -->
          <div class="h-1.5 w-full bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600"></div>

          <div class="p-6 flex flex-col justify-between flex-1">
            <!-- Header Badges -->
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <!-- Dynamic Document Type Ribbon -->
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs',
                      (item.documentType || '').toLowerCase() === 'proposal'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : (item.documentType || '').toLowerCase() === 'thesis'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    ]"
                  >
                    🏷️ {{ item.documentType || 'Research' }}
                  </span>

                  <!-- Gold Seal Verified Badge -->
                  <span class="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300/80 px-2 py-0.5 rounded-md">
                    <span>★</span> MAU Verified
                  </span>
                </div>

                <span class="text-xs text-slate-400 font-mono font-medium">
                  {{ new Date(item.createdAt).toLocaleDateString() }}
                </span>
              </div>

              <!-- Title -->
              <h3
                @click="openDetails(item)"
                class="text-lg font-serif font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug cursor-pointer line-clamp-2"
                :title="item.title"
              >
                {{ item.title }}
              </h3>

              <!-- Author & Institutional Affiliation -->
              <div class="mt-3 space-y-1">
                <div class="flex items-center gap-2 text-xs text-slate-700">
                  <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                    ✍️
                  </span>
                  <span>Author: <strong class="text-slate-900 font-semibold">{{ item.authorName || 'Student Researcher' }}</strong></span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 pl-7">
                  <span>🏛️</span>
                  <span class="truncate">{{ item.college }} • <span class="font-medium text-slate-700">{{ item.department }}</span></span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar -->
            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div class="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Plagiarism-Free (0% Redundancy)</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="openEditProposal(item)"
                  title="Edit Proposal / አርም"
                  class="p-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(item.id)"
                  title="Delete Proposal / ሰርዝ"
                  class="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                >
                  🗑️
                </button>
                <button
                  @click="copyShareLink(item.filePath)"
                  title="Copy Citation Link"
                  class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-300 transition cursor-pointer"
                >
                  🔗
                </button>
                <a
                  :href="item.filePath"
                  target="_blank"
                  class="px-4 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#031B2E] to-[#0A3656] text-amber-300 hover:from-amber-500 hover:to-yellow-500 hover:text-slate-950 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-amber-400/30"
                >
                  <span>📄</span>
                  <span>Read Document</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-white rounded-3xl border border-dashed border-amber-300 p-8 max-w-lg mx-auto shadow-sm">
        <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center text-3xl mb-4">
          📜
        </div>
        <h3 class="text-base font-serif font-black text-slate-900">ምንም ጥናት አልተገኘም</h3>
        <p class="text-xs text-slate-500 mt-1 leading-relaxed">
          በመረጡት መስፈርት የተመዘገበ ጥናት የለም። ቃላቶችን አስተካክለው ይፈልጉ ወይም አዲስ ፕሮፖዛል ያስገቡ።
        </p>
        <button
          @click="openUploadModal"
          class="mt-5 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer"
        >
          Submit First Document
        </button>
      </div>
    </main>

    <!-- ══════════════════════════════════════════════════════
         SUBMISSION MODAL (WITH GOLD ACCENTS)
         ══════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div
        v-if="showUploadModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showUploadModal = false"
      >
        <div class="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-400/50 overflow-hidden my-8 animate-scale-up">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-[#031B2E] to-[#0A3656] text-white p-5 flex items-center justify-between border-b border-amber-500/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl">
                🛡️
              </div>
              <div>
                <h2 class="font-serif font-bold text-base text-white">Deposit Academic Manuscript</h2>
                <p class="text-[11px] text-amber-300/80">ፋይሉ በራስ-ሰር ለተደጋጋሚነትና ይዘት ጥራት ይመረመራል።</p>
              </div>
            </div>
            <button @click="showUploadModal = false" class="text-slate-400 hover:text-white font-bold text-xl cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="handleUploadSubmit" class="p-6 space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Research / Proposal Title *</label>
              <input
                v-model="title"
                type="text"
                required
                placeholder="e.g. Design and Implementation of AI-Driven Library Security"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-medium transition"
              />
            </div>

            <!-- Author & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Author Full Name</label>
                <input
                  v-model="authorName"
                  type="text"
                  placeholder="e.g. Dr. Abebe / Student Kebede"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-none font-medium transition"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Document Classification</label>
                <select
                  v-model="documentType"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-none font-bold bg-white cursor-pointer"
                >
                  <option value="Proposal">Academic Proposal </option>
                  <option value="Thesis">Senior Thesis </option>
                  <option value="Internship">Internship Report </option>
                  <option value="Research">Published Research Paper</option>
                </select>
              </div>
            </div>

            <!-- College & Department -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Affiliated College</label>
                <select v-model="college" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none font-medium bg-white">
                  <option v-for="c in collegesList.filter(x => x !== 'All')" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Academic Department</label>
                <input
                  v-model="department"
                  type="text"
                  placeholder="e.g. Software Engineering"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>
            </div>

            <!-- Drag & Drop File Zone -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Manuscript File (PDF, Word) *</label>
              <div
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDropFile"
                :class="[
                  'border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer',
                  isDragging ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                ]"
                @click="($refs.fileInput as HTMLInputElement).click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  class="hidden"
                  @change="onFileSelect"
                />
                <span class="text-3xl block mb-1">📂</span>
                <span v-if="selectedFile" class="text-xs font-bold text-amber-700 block">
                  {{ selectedFile.name }} ({{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB)
                </span>
                <span v-else class="text-xs text-slate-600 font-medium block">
                  Drag and drop your manuscript here, or <strong class="text-amber-700 underline">Browse</strong>
                </span>
                <span class="text-[10px] text-slate-400 block mt-1">Accepts .pdf, .docx (Duplicate detection & structure analysis runs automatically)</span>
              </div>
            </div>

            <!-- Status Alert -->
            <div v-if="uploadStatus.msg" class="text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium"
              :class="{
                'bg-amber-50 text-amber-900 border border-amber-300 animate-pulse': uploadStatus.type === 'checking',
                'bg-emerald-50 text-emerald-800 border border-emerald-200': uploadStatus.type === 'success',
                'bg-red-50 text-red-800 border border-red-200': uploadStatus.type === 'error',
              }"
            >
              <span v-if="uploadStatus.type === 'checking'">⏳</span>
              <span v-else-if="uploadStatus.type === 'success'">✓</span>
              <span v-else>⚠️</span>
              <span>{{ uploadStatus.msg }}</span>
            </div>

            <!-- Buttons -->
            <div class="pt-2 flex gap-3">
              <button
                type="button"
                @click="showUploadModal = false"
                class="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="researchStore.uploadProgress"
                class="flex-1 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer border border-amber-300"
              >
                {{ researchStore.uploadProgress ? 'Analyzing...' : 'Verify & Deposit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Edit Proposal Modal -->
    <Transition name="fade">
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scale-up my-8">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-serif font-black text-slate-900 text-base">Edit Research Proposal / አርም</h3>
              <p class="text-xs text-slate-400">Update title, author, college, or document type</p>
            </div>
            <button
              @click="showEditModal = false"
              class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleUpdateSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Title *</label>
              <input
                v-model="editingItem.title"
                required
                type="text"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Author Name *</label>
              <input
                v-model="editingItem.authorName"
                required
                type="text"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1">College</label>
                <input
                  v-model="editingItem.college"
                  type="text"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Department</label>
                <input
                  v-model="editingItem.department"
                  type="text"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Document Type</label>
              <select
                v-model="editingItem.documentType"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
              >
                <option value="Proposal">Proposal</option>
                <option value="Thesis">Thesis</option>
                <option value="Research Paper">Research Paper</option>
              </select>
            </div>

            <div class="pt-2 flex gap-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.research-luxury-card {
  background: #ffffff;
  border-radius: 1.25rem;
  border: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: 0 4px 20px -2px rgba(3, 27, 46, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.25s ease-in-out;
}

.research-luxury-card:hover {
  transform: translateY(-4px);
  border-color: rgba(245, 158, 11, 0.8);
  box-shadow: 0 16px 32px -4px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(3, 27, 46, 0.08);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scaleUp {
  0% { transform: scale(0.96); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-up { animation: scaleUp 0.18s ease-out forwards; }
</style>