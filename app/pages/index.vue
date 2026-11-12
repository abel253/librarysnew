<!-- app/pages/index.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Assets Imports
import img11 from '~/assets/images/library11.jpg'
import img12 from '~/assets/images/library12.jpg'
import img1 from '~/assets/images/lib1.jpg'
import img2 from '~/assets/images/library2.avif'
import img4 from '~/assets/images/library4.avif'
import img5 from '~/assets/images/library5.avif'
import img6 from '~/assets/images/library6.avif'
import img7 from '~/assets/images/library7.avif'
import img8 from '~/assets/images/library8.avif'
import img9 from '~/assets/images/library9.avif'
import img10 from '~/assets/images/library10.avif'
import mausImg from '~/assets/images/lib1.jpg'
import missionImg from '~/assets/images/librarymis.png'
import visionImg from '~/assets/images/libraryvisi.png'

useHead({
  title: 'Home | Mekdela Amba University',
  meta: [
    {
      name: 'description',
      content: 'Official Portal of Mekdela Amba University - Excellence in Education, Research and Innovation',
    },
  ],
})

interface Stats {
  students: number
  books: number
  research: number
}

const stats = ref<Stats>({
  students: 12580,
  books: 50000,
  research: 120,
})

const loading = ref(false)

// Hero Quick Search
const searchQuery = ref('')
const searchFilter = ref('title')

const handleHeroSearch = () => {
  if (!searchQuery.value.trim()) return
  navigateTo({
    path: '/search',
    query: { q: searchQuery.value, filter: searchFilter.value },
  })
}

// Background Carousel Images
const slides = [
  { image: img11, subtitle: 'Nurturing competent graduates, generating impactful research, and serving society for a brighter tomorrow.' },
  { image: img12, subtitle: 'High-speed digital research terminals and global database connectivity.' },
  { image: img1, subtitle: 'Naturally lit, spacious reading halls designed for focused research.' },
  { image: img2, subtitle: 'Extensive reference books, local research papers, and graduation theses.' },
  { image: img4, subtitle: 'Technology-equipped academic center empowering knowledge 24/7.' },
]

const currentSlide = ref(0)
let slideTimer: any = null

const startTimer = () => {
  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 4500)
}

// Featured / Trending Books
const featuredBooks = [
  { title: 'Fundamentals of Software Engineering', author: 'Ian Sommerville', category: 'Computer Science', shelf: 'CS-302', status: 'Available', color: 'bg-blue-600' },
  { title: 'Principles of Internal Medicine', author: 'Harrison', category: 'Health Sciences', shelf: 'MED-110', status: 'Available', color: 'bg-emerald-600' },
  { title: 'Structural Analysis & Design', author: 'R.C. Hibbeler', category: 'Civil Engineering', shelf: 'ENG-204', status: 'Available', color: 'bg-amber-600' },
  { title: 'Research Methodology & Analytics', author: 'C.R. Kothari', category: 'General Research', shelf: 'RES-015', status: 'Reference Only', color: 'bg-indigo-600' },
]

// Announcements / Notices
const notices = [
  { tag: 'Notice', date: 'Current Term', title: 'Extended Evening Hours for Final Exam Study', desc: 'The Central Library main hall is open until 10:00 PM on weekdays.' },
  { tag: 'E-Resources', date: 'New Access', title: 'Free Campus Access to IEEE & JSTOR Databases', desc: 'Connect to campus Wi-Fi for free full-text download of scientific journals.' },
  { tag: 'Workshop', date: 'Upcoming', title: 'Digital Reference & Citation Training for Students', desc: 'Hands-on session on Mendeley and APA citations in the ICT room.' },
]

// Faculties with real images & search keywords
const faculties = [
  { 
    title: 'Engineering', 
    desc: 'Innovative solutions for a better society', 
    icon: '⚙️', 
    color: 'bg-blue-50 text-blue-600',
    image: img5,
    query: 'Engineering'
  },
  { 
    title: 'Natural & Computational Sciences', 
    desc: 'Discovering knowledge for real-world impact', 
    icon: '🔬', 
    color: 'bg-purple-50 text-purple-600',
    image: img7,
    query: 'Science'
  },
  { 
    title: 'Social Sciences & Humanities', 
    desc: 'Understanding society, building inclusive futures', 
    icon: '🌍', 
    color: 'bg-red-50 text-red-600',
    image: img8,
    query: 'Social'
  },
  { 
    title: 'Business & Economics', 
    desc: 'Creating leaders for sustainable growth', 
    icon: '📈', 
    color: 'bg-teal-50 text-teal-600',
    image: img9,
    query: 'Economics'
  },
  { 
    title: 'Agriculture & Environmental Sciences', 
    desc: 'For food security and a greener Ethiopia', 
    icon: '🌱', 
    color: 'bg-green-50 text-green-600',
    image: img10,
    query: 'Agriculture'
  },
  { 
    title: 'Health Sciences', 
    desc: 'Better health for a stronger society', 
    icon: '🏥', 
    color: 'bg-sky-50 text-sky-600',
    image: img6,
    query: 'Medicine'
  },
]

// News
const news = [
  { date: 'OCT 15', title: 'MAU Hosts Annual Research and Innovation Forum', desc: 'Scholars, students and industry partners gathered to discuss solutions for national development.' },
  { date: 'OCT 08', title: 'New Digital Library System Launched', desc: 'Mekdela Amba University officially launched the modern web-based Library Circulation System (MAU-LCS).' },
  { date: 'SEP 28', title: 'MAU Celebrates Graduates', desc: 'Over 1,200 students receive their degrees in a beautiful ceremony at the main campus.' },
]

// Quick Services
const quickServices = [
  { title: 'Student Portal Login', icon: '👤', bg: 'bg-teal-50 text-teal-600', link: '/portal' },
  { title: 'E-Learning (MOODLE)', icon: '💻', bg: 'bg-orange-50 text-orange-600', link: '#' },
  { title: 'Digital Library Search', icon: '📖', bg: 'bg-blue-50 text-blue-600', link: '/search' },
  { title: 'Admissions Apply Online', icon: '📝', bg: 'bg-sky-50 text-sky-600', link: '/admissions' },
  { title: 'Research Portal (Upload / View)', icon: '📄', bg: 'bg-cyan-50 text-cyan-600', link: '/research' },
  { title: 'Announcements & Notices', icon: '📢', bg: 'bg-red-50 text-red-600', link: '/news' },
  { title: 'Academic Calendar (View Dates)', icon: '📅', bg: 'bg-pink-50 text-pink-600', link: '/academics' },
  { title: 'Contact Us (Get In Touch)', icon: '📞', bg: 'bg-indigo-50 text-indigo-600', link: '/contact' },
]

onMounted(async () => {
  startTimer()
  loading.value = true
  try {
    const res: any = await $fetch('/api/stats')
    if (res.success) {
      stats.value = {
        students: res.data?.students || 12580,
        books: res.data?.books || 50000,
        research: res.data?.research || 120,
      }
    }
  } catch (error) {
    // Fallback to defaults
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})
</script>

<template>
  <div class="mau-main-container">
    
    <!-- 1. HERO SECTION -->
    <section class="hero-section relative overflow-hidden ">
      <div class="absolute inset-0 z-0">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-r "></div>
      </div>

      <div class="container mx-auto px-4 lg:px-8 relative z-10 py-16 lg:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-blue-600 min-h-[500px]">
          
          <div class="text-left text-purple-600 items-center">
            <p class="text-xs font-bold tracking-[0.25em] uppercase mb-2 text-amber-400">Welcome to</p>
            <h1 class="text-4xl lg:text-6xl font-serif font-bold leading-tight mb-3 text-white">
              Mekdela Amba University
            </h1>
            <h2 class="text-xl lg:text-2xl font-semibold mb-4 text-[#fbbf24]">
              Excellence in Education, Research and Innovation
            </h2>
            <p class="text-sm lg:text-base text-blue-100 mb-8 max-w-lg leading-relaxed">
              {{ slides[currentSlide].subtitle }}
            </p>
            
            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/admissions" class="hero-btn-primary">
                🎓 Apply Now →
              </NuxtLink>
              <NuxtLink to="/search" class="hero-btn-secondary">
                Explore Catalog →
              </NuxtLink>
            </div>
          </div>

          <div class="hidden lg:flex justify-end items-center relative">
            <div class="text-right pr-8 border-r-2 border-amber-400">
              <p class="text-3xl font-serif italic text-white leading-tight" style="font-family: 'Georgia', serif;">
                Brighter Minds<br>Stronger Ethiopia
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 2. STATS STRIP (Crisp & Clean) -->
    <section class="bg-white border-b border-gray-200 relative z-20">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 py-6 divide-x divide-gray-100">
          
          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">👥</span>
              <h3 class="text-xl font-bold text-[#0a2540]">{{ stats.students.toLocaleString() }}</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Students</p>
          </div>

          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">🎓</span>
              <h3 class="text-xl font-bold text-[#0a2540]">6</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Faculties</p>
          </div>

          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">📄</span>
              <h3 class="text-xl font-bold text-[#0a2540]">{{ stats.research }}+</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Research Projects</p>
          </div>

          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">📚</span>
              <h3 class="text-xl font-bold text-[#0a2540]">{{ stats.books.toLocaleString() }}+</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Digital Resources</p>
          </div>

          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">👨‍🏫</span>
              <h3 class="text-xl font-bold text-[#0a2540]">800+</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Academic & Staff</p>
          </div>

          <div class="flex flex-col items-center text-center px-2 py-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl text-[#01ACF2]">🏛️</span>
              <h3 class="text-xl font-bold text-[#0a2540]">Modern</h3>
            </div>
            <p class="text-xs text-gray-500 font-medium">Campus Facilities</p>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. OUR FACULTIES (Images added & Search connected) -->
    <section class="container mx-auto px-4 lg:px-8 py-12 bg-white">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800 border-b-2 border-amber-500 pb-1 inline-block">Our Faculties</h2>
        </div>
        <NuxtLink to="/search" class="text-xs font-bold text-blue-600 hover:text-blue-800 hidden sm:block">
          Search All Catalog →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div 
          v-for="faculty in faculties" 
          :key="faculty.title" 
          class="faculty-card group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-500 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <!-- Real crisp image for each faculty -->
            <div class="h-28 bg-gray-100 relative overflow-hidden">
              <img 
                :src="faculty.image" 
                :alt="faculty.title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>

            <div class="p-3">
              <div :class="['w-7 h-7 rounded-md flex items-center justify-center text-xs mb-2 -mt-6 relative z-10 border border-white shadow-sm', faculty.color]">
                {{ faculty.icon }}
              </div>
              <h3 class="text-xs font-bold text-gray-800 mb-1 leading-tight">{{ faculty.title }}</h3>
              <p class="text-[10px] text-gray-500 leading-tight mb-2 line-clamp-2">{{ faculty.desc }}</p>
            </div>
          </div>

          <!-- Direct search by faculty subject -->
          <div class="px-3 pb-3">
            <NuxtLink 
              :to="{ path: '/search', query: { q: faculty.query, filter: 'subject' } }" 
              class="text-[10px] font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all hover:text-blue-800"
            >
              Learn More <span>→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. DIGITAL LIBRARY (Mockup replaced with crisp maus.jpg & clean borders) -->
    <section class="bg-slate-50 border-y border-slate-200 py-12">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div class="lg:col-span-5">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl text-[#01ACF2]">📊</span>
              <h2 class="text-xl font-bold text-gray-800">Digital Library & MAU-LCS</h2>
            </div>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">
              24/7 web-based self-service access to library resources, enabling students and staff to search, borrow, access digital materials, and manage research efficiently.
            </p>
            
            <!-- Quick Search Bar -->
            <form @submit.prevent="handleHeroSearch" class="flex gap-2 mb-6 max-w-md">
              <select v-model="searchFilter" class="bg-white border border-gray-300 text-gray-700 text-xs rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-2">
                <option value="title">By Title</option>
                <option value="author">By Author</option>
                <option value="subject">By Subject</option>
              </select>
              <div class="relative flex-1">
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Search library catalog..." 
                  class="bg-white border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                />
              </div>
              <button type="submit" class="bg-[#0a2540] text-white px-3 py-2 rounded-md hover:bg-blue-900 transition-colors text-xs font-semibold">
                🔍 Search
              </button>
            </form>

            <div class="flex gap-3">
              <NuxtLink to="/search" class="btn-primary text-xs">Search Catalog →</NuxtLink>
              <NuxtLink to="/about" class="btn-secondary text-xs">About Library →</NuxtLink>
            </div>
          </div>

          <!-- Clean Image Mockup without blurry shadows -->
          <div class="lg:col-span-4 relative">
            <div class="bg-white p-2 rounded-lg border border-gray-200">
              <div class="relative h-48 rounded-md overflow-hidden border border-gray-100">
                <img :src="mausImg" alt="MAU Library System" class="w-full h-full object-cover" />
                <div class="absolute top-2 left-2 bg-[#0a2540]/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Circulation System Active
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-3">
            <div class="bg-white p-4 rounded-lg border border-gray-200">
               <h4 class="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">Quick Actions</h4>
               <ul class="space-y-3 text-xs text-gray-600">
                 <li>
                   <NuxtLink to="/search" class="flex items-center gap-2 hover:text-blue-600 transition-colors">
                     <span class="text-sm">🔍</span> Search Books Online
                   </NuxtLink>
                 </li>
                 <li>
                   <NuxtLink :to="{ path: '/search', query: { filter: 'subject', q: 'Technology' } }" class="flex items-center gap-2 hover:text-blue-600 transition-colors">
                     <span class="text-sm">🔄</span> Self-Service Borrowing
                   </NuxtLink>
                 </li>
                 <li>
                   <NuxtLink to="/research" class="flex items-center gap-2 hover:text-blue-600 transition-colors">
                     <span class="text-sm">📤</span> Upload & View Research
                   </NuxtLink>
                 </li>
                 <li>
                   <NuxtLink to="/about" class="flex items-center gap-2 hover:text-blue-600 transition-colors">
                     <span class="text-sm">⏱️</span> Library Service Hours
                   </NuxtLink>
                 </li>
               </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 5. NEWS & QUICK SERVICES -->
    <section class="container mx-auto px-4 lg:px-8 py-12 bg-white">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800 border-b-2 border-amber-500 pb-1">Latest News & Events</h2>
            <NuxtLink to="/news" class="text-xs font-bold text-blue-600 hover:underline">View All News →</NuxtLink>
          </div>
          <div class="space-y-3">
            <div v-for="(item, index) in news" :key="index" class="flex gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div class="bg-[#0a2540] text-white text-center p-2 rounded h-fit min-w-[50px]">
                <div class="text-[9px] font-bold uppercase">{{ item.date.split(' ')[0] }}</div>
                <div class="text-lg font-bold leading-none mt-0.5">{{ item.date.split(' ')[1] }}</div>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-xs text-gray-800 mb-1">{{ item.title }}</h4>
                <p class="text-[11px] text-gray-500 line-clamp-2">{{ item.desc }}</p>
                <NuxtLink to="/news" class="text-[10px] text-blue-600 font-semibold mt-1 inline-block hover:underline">Read More →</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800 border-b-2 border-amber-500 pb-1">Quick Services</h2>
            <NuxtLink to="/services" class="text-xs font-bold text-blue-600 hover:underline">View All Services →</NuxtLink>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <NuxtLink 
              v-for="service in quickServices" 
              :key="service.title" 
              :to="service.link"
              class="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <div :class="['w-7 h-7 rounded-md flex items-center justify-center text-xs', service.bg]">
                {{ service.icon }}
              </div>
              <span class="text-[11px] font-bold text-gray-700 leading-tight">{{ service.title }}</span>
            </NuxtLink>
          </div>
        </div>

      </div>
    </section>

    <!-- 6. FEATURED BOOKS -->
    <section class="bg-slate-50 border-y border-slate-200 py-12">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-xs uppercase tracking-widest font-bold text-amber-600">Fresh Stacks</span>
            <h2 class="text-xl font-bold text-slate-800 mt-1">Featured Academic Books</h2>
          </div>
          <NuxtLink to="/search" class="text-xs font-bold text-[#01ACF2] hover:underline hidden sm:inline-block">View All Catalog →</NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="book in featuredBooks" :key="book.title" class="book-card group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-blue-400 transition-colors">
            <div :class="['h-1 w-full', book.color]"></div>
            <div class="p-4">
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">{{ book.category }}</span>
              <h4 class="font-bold text-slate-800 text-xs mt-1 leading-snug group-hover:text-blue-600 transition-colors">{{ book.title }}</h4>
              <p class="text-[10px] text-slate-500 mt-1 italic">By {{ book.author }}</p>
              <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">📍 {{ book.shelf }}</span>
                <span class="text-[10px] font-bold text-emerald-600">{{ book.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. MISSION & VISION -->
    <section class="container mx-auto px-4 lg:px-8 py-12 bg-white">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div class="mission-vision-card bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div class="flex items-center gap-4 mb-3">
            <img :src="missionImg" alt="Library Mission" class="w-12 h-12 object-contain rounded-md p-1 bg-blue-100 border border-blue-200" />
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-[#01ACF2]">Our Purpose</span>
              <h3 class="text-base font-bold text-slate-800">Library Mission</h3>
            </div>
          </div>
          <p class="text-slate-600 text-xs leading-relaxed">
            To provide high-quality information resources, dynamic research support, and accessible physical and digital spaces that empower students, faculty, and researchers to achieve academic excellence and community impact.
          </p>
        </div>

        <div class="mission-vision-card bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div class="flex items-center gap-4 mb-3">
            <img :src="visionImg" alt="Library Vision" class="w-12 h-12 object-contain rounded-md p-1 bg-amber-100 border border-amber-200" />
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-amber-600">Our Future</span>
              <h3 class="text-base font-bold text-slate-800">Library Vision</h3>
            </div>
          </div>
          <p class="text-slate-600 text-xs leading-relaxed">
            To be a leading center of intellectual discovery and innovation in Ethiopia, recognized for its comprehensive digital repository, modern automation, and inspiring learning environment.
          </p>
        </div>
      </div>
    </section>

    <!-- 8. NOTICES & DIGITAL REPOSITORY -->
    <section class="container mx-auto px-4 lg:px-8 pb-16 pt-4 bg-white">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-6 bg-white p-5 rounded-lg border border-slate-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2"><span>📢</span> Campus Library Notices</h3>
            <span class="text-[10px] text-slate-400 font-semibold">Updates</span>
          </div>
          <div class="space-y-3">
            <div v-for="(n, idx) in notices" :key="idx" class="p-3 rounded bg-slate-50 border border-slate-100 hover:border-sky-300 transition-colors">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-[#0072b2] uppercase">{{ n.tag }}</span>
                <span class="text-[10px] text-slate-400">{{ n.date }}</span>
              </div>
              <h5 class="text-[11px] font-bold text-slate-800">{{ n.title }}</h5>
              <p class="text-[10px] text-slate-500 mt-1 leading-relaxed">{{ n.desc }}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 bg-gradient-to-br from-[#006ea6] to-[#01acf2] rounded-lg p-6 flex flex-col justify-between min-h-[300px] text-white">
          <div>
            <span class="inline-block px-2 py-1 bg-white/20 rounded text-[10px] font-semibold uppercase tracking-wider mb-2">Institutional Repository</span>
            <h3 class="text-xl font-bold mb-2">Digital Student & Faculty Research</h3>
            <p class="text-blue-100 text-xs leading-relaxed mb-4">
              Currently, over <strong class="text-amber-300">{{ stats.research }} research papers</strong>, senior projects, and academic journals are cataloged. Read abstracts and full references to enrich your research.
            </p>
          </div>
          <div class="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              <div class="text-3xl font-extrabold text-amber-300">{{ stats.research }}+</div>
              <span class="text-[10px] text-blue-100 uppercase tracking-wider font-medium">Digital Papers</span>
            </div>
            <NuxtLink to="/research" class="bg-white text-[#0072b2] font-bold text-xs px-4 py-2 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors">Explore Repository →</NuxtLink>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<style scoped>
.mau-main-container {
  background-color: #ffffff;
  color: #1e293b;
  overflow-x: hidden;
}

/* =========================================
   Hero Buttons (Clean & Crisp)
   ========================================= */
.hero-btn-primary {
  background-color: #fbbf24;
  color: #0a2540;
  font-weight: 700;
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border: 1px solid #f59e0b;
}
.hero-btn-primary:hover {
  background-color: #f59e0b;
}

.hero-btn-secondary {
  background-color: transparent;
  color: #ffffff;
  font-weight: 600;
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
.hero-btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

/* =========================================
   Standard Action Buttons (Clean & Crisp)
   ========================================= */
.btn-primary {
  background-color: #0a2540;
  color: #ffffff;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  border: 1px solid #0a2540;
}
.btn-primary:hover {
  background-color: #1e3a8a;
  border-color: #1e3a8a;
}

.btn-secondary {
  background-color: #ffffff;
  color: #0a2540;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #cbd5e1;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}
.btn-secondary:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.25rem;
  }
  .hero-section h2 {
    font-size: 1.25rem;
  }
}
</style>