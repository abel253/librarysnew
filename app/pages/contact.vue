<script setup>
import { ref, reactive } from 'vue';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Library,
  Building2
} from 'lucide-vue-next';

// Subject / Categories for the query
const categories = [
  { id: 'book', label: 'Book Inquiry', icon: BookOpen },
  { id: 'digital', label: 'E-Library & Digital', icon: Sparkles },
  { id: 'other', label: 'General Question', icon: HelpCircle }
];

const selectedCategory = ref('book');

// Form Data state
const form = reactive({
  category: 'book',
  name: '',
  email: '',
  phone: '',
  studentId: '',
  message: ''
});

const isSubmitting = ref(false);
const statusMessage = ref({ type: '', text: '' });

// Form submission handler
const handleSubmit = async () => {
  form.category = selectedCategory.value;
  isSubmitting.value = true;
  statusMessage.value = { type: '', text: '' };

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: form
    });

    if (response?.success) {
      statusMessage.value = {
        type: 'success',
        text: 'ጥያቄዎ በቀጥታ ለላይብረሪያኑ (Librarian Circulation Desk) ደርሷል! በተቻለ ፍጥነት ምላሽ ይሰጥዎታል። (Thank you! Your inquiry has been routed directly to the Librarian.)'
      };
      // Reset form
      form.name = '';
      form.email = '';
      form.phone = '';
      form.studentId = '';
      form.message = '';
    }
  } catch (error) {
    statusMessage.value = {
      type: 'error',
      text: error?.data?.statusMessage || 'Unable to send message. Please try again.'
    };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="relative min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-900 pb-24">
    
    <!-- TOP HERO BANNER: Deep Academic Navy with Subtle Pattern -->
    <div class="relative bg-gradient-to-br from-[#0c1e3d] via-[#102752] to-[#091730] text-white pt-32 pb-44 px-6 sm:px-12 lg:px-20 overflow-hidden">
      
      <!-- Subtle Decorative Elements -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

      <div class="max-w-7xl mx-auto relative z-10 text-center space-y-5">
        
        <!-- University Chip -->
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Library :size="15" class="text-amber-400" />
          <span>Mekdela Amba University • Library System</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-none">
          How Can We <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">Help You?</span>
        </h1>

        <p class="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
          Reach out to our librarians for book loans, research databases, student clearance, or study facility inquiries.
        </p>

        <!-- Library Live Status Pill -->
        <div class="pt-2 flex items-center justify-center gap-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Library Desks Open Now (Mon – Sun)</span>
          </div>
        </div>

      </div>
    </div>

    <!-- MAIN INTERACTIVE SECTION (Floating Cards Over Hero) -->
    <div class="max-w-7xl mx-auto px-6 sm:px-10 -mt-24 relative z-20">
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN: Contact Cards & Campus Details (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Primary Contact Box -->
          <div class="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
            <h3 class="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span class="p-2 bg-blue-50 text-[#0c1e3d] rounded-xl">
                <Building2 :size="20" />
              </span>
              Contact Information
            </h3>

            <div class="space-y-4">
              <!-- Email Card -->
              <a href="mailto:library@mkau.edu.et" class="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-[#0c1e3d] transition-all duration-300 border border-slate-100 hover:border-[#0c1e3d]">
                <div class="p-3 bg-white group-hover:bg-amber-400 text-[#0c1e3d] rounded-xl shadow-sm transition-all duration-300">
                  <Mail :size="20" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">Official Email</p>
                  <p class="text-sm sm:text-base font-bold text-slate-800 group-hover:text-white transition-colors">library@mkau.edu.et</p>
                  <span class="text-xs text-slate-400 group-hover:text-slate-300">Fast response within 24 hrs</span>
                </div>
              </a>

              <!-- Phone Card -->
              <a href="tel:+251911121314" class="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-[#0c1e3d] transition-all duration-300 border border-slate-100 hover:border-[#0c1e3d]">
                <div class="p-3 bg-white group-hover:bg-amber-400 text-[#0c1e3d] rounded-xl shadow-sm transition-all duration-300">
                  <Phone :size="20" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">Direct Phone / Helpdesk</p>
                  <p class="text-sm sm:text-base font-bold text-slate-800 group-hover:text-white transition-colors">+251 911 12 13 14</p>
                  <span class="text-xs text-slate-400 group-hover:text-slate-300">Mon - Fri • 2:00 AM - 11:30 PM</span>
                </div>
              </a>

              <!-- Campus Locations -->
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="p-3 bg-white text-amber-500 rounded-xl shadow-sm">
                  <MapPin :size="20" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Locations</p>
                  <p class="text-sm font-bold text-slate-800 mt-0.5">Tulu Awlia Main Campus</p>
                  <p class="text-xs text-slate-500">Mekane Selam Campus, South Wollo, Ethiopia</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Notice Card -->
          <div class="p-6 rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20">
            <div class="flex items-center gap-3 font-black text-sm uppercase tracking-wider mb-1">
              <Clock :size="18" />
              <span>Exam Week Extended Hours</span>
            </div>
            <p class="text-xs font-medium text-slate-900 leading-relaxed">
              Main study halls are open until 4:00 AM during mid-term and final examination periods for registered students.
            </p>
          </div>

        </div>

        <!-- RIGHT COLUMN: Elegant Submission Form (7 Cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/70 border border-slate-100 relative">
          
          <div class="mb-8">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span class="p-2.5 bg-amber-400/10 text-amber-500 rounded-xl">
                <MessageSquare :size="22" />
              </span>
              Send an Inquiry
            </h2>
            <p class="text-slate-500 text-sm mt-1">Select a category and fill in your details below.</p>
          </div>

          <!-- CATEGORY SELECTOR CHIPS -->
          <div class="mb-7">
            <label class="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2.5">
              Topic of Inquiry
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                @click="selectedCategory = cat.id"
                :class="selectedCategory === cat.id 
                  ? 'bg-[#0c1e3d] text-white border-[#0c1e3d] shadow-md shadow-blue-950/20' 
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'"
                class="flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer"
              >
                <component :is="cat.icon" :size="18" class="mb-1.5" :class="selectedCategory === cat.id ? 'text-amber-400' : 'text-slate-400'" />
                <span class="text-xs font-bold leading-tight">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Alert Notifications -->
          <div v-if="statusMessage.text" 
               :class="statusMessage.type === 'success' 
                 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                 : 'bg-rose-50 border-rose-200 text-rose-800'"
               class="p-4 rounded-2xl mb-6 border flex items-center gap-3 text-sm font-medium animate-fadeIn">
            <CheckCircle2 v-if="statusMessage.type === 'success'" :size="20" class="text-emerald-600 flex-shrink-0" />
            <AlertCircle v-else :size="20" class="text-rose-600 flex-shrink-0" />
            <span>{{ statusMessage.text }}</span>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <input 
                  v-model="form.name"
                  type="text" 
                  required
                  placeholder="e.g. Abebe Bikila" 
                  class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c1e3d] focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all text-slate-900 text-sm font-medium placeholder-slate-400" 
                />
              </div>

              <div>
                <label class="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                  Email Address <span class="text-rose-500">*</span>
                </label>
                <input 
                  v-model="form.email"
                  type="email" 
                  required
                  placeholder="student@mkau.edu.et" 
                  class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c1e3d] focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all text-slate-900 text-sm font-medium placeholder-slate-400" 
                />
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                  Student / Staff ID <span class="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input 
                  v-model="form.studentId"
                  type="text" 
                  placeholder="e.g. MAU/1425/15" 
                  class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c1e3d] focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all text-slate-900 text-sm font-medium placeholder-slate-400" 
                />
              </div>

              <div>
                <label class="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                  Phone Number <span class="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input 
                  v-model="form.phone"
                  type="tel" 
                  placeholder="+251 9..." 
                  class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c1e3d] focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all text-slate-900 text-sm font-medium placeholder-slate-400" 
                />
              </div>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                Your Message / Inquiry <span class="text-rose-500">*</span>
              </label>
              <textarea 
                v-model="form.message"
                required
                rows="4" 
                placeholder="Specify the book title, ISBN, or detailed request..." 
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c1e3d] focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all text-slate-900 text-sm font-medium placeholder-slate-400 resize-none"
              ></textarea>
            </div>

            <!-- Submit Button with MAU Academic Navy & Gold accent -->
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full py-4 bg-[#0c1e3d] hover:bg-[#122b57] text-white rounded-xl font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-950/25 active:scale-[0.99] group"
            >
              <Loader2 v-if="isSubmitting" :size="20" class="animate-spin text-amber-400" />
              <template v-else>
                <span>Submit Query to Library</span>
                <Send :size="18" class="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </template>
            </button>
          </form>

        </div>

      </div>
    </div>

  </div>
</template>