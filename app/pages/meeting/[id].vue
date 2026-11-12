<!-- app/pages/meeting/[id].vue -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff,
  MessageSquare, FileText, Share2, Users, Copy, Check, Send,
  Plus, Trash2, Save, Download, Sparkles, BookOpen, Clock,
  Shield, Hand, ExternalLink, CornerDownLeft, Paperclip, Code,
  RotateCcw, RefreshCw, Volume2, Wifi
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const roomId = computed(() => String(route.params.id || route.query.room || 'MAU-DIRECTOR-LIB').toUpperCase().trim())

// ═══════════════════════════════════════════
// 1. PARTICIPANT & MEETING INFO
// ═══════════════════════════════════════════
const userName = computed(() => {
  return authStore.user?.name || (authStore.isAdmin ? 'Abebe Shewa' : (authStore.isLibrarian ? 'Abel Mekonnen' : 'Staff Member'))
})

const userRole = computed(() => {
  const r = authStore.user?.userType || authStore.user?.role || ''
  if (r) return r.toUpperCase()
  return authStore.isAdmin ? 'ADMINISTRATOR' : (authStore.isLibrarian ? 'LIBRARIAN' : 'STAFF')
})

const currentUserId = computed(() => {
  return String(authStore.user?.userId || authStore.user?.id || (authStore.isAdmin ? 'mau-admin-01' : (authStore.isLibrarian ? 'mau-lib-01' : 'mau-staff-guest')))
})

const meetingTitle = ref('Library Executive & Staff Consultation')
const copiedRoomLink = ref(false)
const isHandRaised = ref(false)

// Active Right Drawer Tab
const activeTab = ref<'chat' | 'minutes' | 'resources' | 'participants'>('chat')
const isSidebarOpen = ref(true)
const mobileViewMode = ref<'split' | 'video' | 'drawer'>('split')

// ═══════════════════════════════════════════
// 2. WEBRTC MEDIA STREAMS & CONTROLS
// ═══════════════════════════════════════════
const isMicOn = ref(true)
const isCameraOn = ref(true)
const isScreenSharing = ref(false)
const isConnectedPeer = ref(false)

const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)
const remoteAudioRef = ref<HTMLAudioElement | null>(null)
const screenVideoRef = ref<HTMLVideoElement | null>(null)

let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null
let screenStream: MediaStream | null = null
let peerConnection: RTCPeerConnection | null = null
let isOffering = false
const iceCandidateQueue: any[] = []
const processedSignalIds = new Set<string>()

// Dynamic Participants List from Server Room
const remotePeers = ref<any[]>([])
const activeRemotePeer = computed(() => remotePeers.value[0] || null)

// Live Meeting Timer
const meetingSeconds = ref(566)
let timerInterval: any = null
let syncInterval: any = null
let lastSyncTimestamp = 0

const formattedTimer = computed(() => {
  const m = Math.floor(meetingSeconds.value / 60)
  const s = meetingSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// ICE Servers for WebRTC Connection
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
}

// ═══════════════════════════════════════════
// 3. INITIALIZE LOCAL MEDIA (CAMERA & MIC)
// ═══════════════════════════════════════════
const initLocalMedia = async () => {
  if (!import.meta.client) return
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        isCameraOn.value = true
        isMicOn.value = true
      } catch (camErr) {
        // Fallback to audio-only if camera is held by another window or unavailable
        console.warn('Webcam busy or unavailable, requesting microphone only:', camErr)
        isCameraOn.value = false
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          })
          isMicOn.value = true
        } catch (micErr) {
          console.warn('Microphone unavailable:', micErr)
          isMicOn.value = false
        }
      }

      if (localVideoRef.value && localStream) {
        localVideoRef.value.srcObject = localStream
      }
    }
  } catch (err) {
    console.warn('Local media warning:', err)
  }
}

// Toggle Microphone (Enables / Disables real audio track)
const toggleMic = () => {
  isMicOn.value = !isMicOn.value
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = isMicOn.value
    })
  }
  sendHeartbeat()
}

// Toggle Camera (Enables / Disables video track)
const toggleCamera = async () => {
  isCameraOn.value = !isCameraOn.value
  if (localStream && localStream.getVideoTracks().length > 0) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = isCameraOn.value
    })
  } else if (isCameraOn.value) {
    await initLocalMedia()
    if (peerConnection && localStream) {
      localStream.getVideoTracks().forEach(track => {
        peerConnection?.addTrack(track, localStream!)
      })
    }
  }
  sendHeartbeat()
}

// Screen Sharing
const toggleScreenShare = async () => {
  if (!import.meta.client) return
  if (isScreenSharing.value) {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop())
      screenStream = null
    }
    isScreenSharing.value = false
  } else {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        if (screenVideoRef.value && screenStream) {
          screenVideoRef.value.srcObject = screenStream
        }
        isScreenSharing.value = true
        screenStream.getVideoTracks()[0].onended = () => {
          isScreenSharing.value = false
        }
      } else {
        alert('Screen sharing is not supported by this browser.')
      }
    } catch (err) {
      console.warn('Screen share cancelled or failed:', err)
      isScreenSharing.value = false
    }
  }
}

// ═══════════════════════════════════════════
// 4. WEBRTC PEER CONNECTION & SIGNALING
// ═══════════════════════════════════════════
const flushCandidates = async () => {
  if (!peerConnection || !peerConnection.remoteDescription) return
  while (iceCandidateQueue.length > 0) {
    const cand = iceCandidateQueue.shift()
    if (cand) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(cand))
      } catch (err) {
        console.warn('Apply ICE Candidate error:', err)
      }
    }
  }
}

const createPeerConnection = (targetUserId: string) => {
  if (peerConnection) {
    try {
      peerConnection.close()
    } catch {}
  }

  peerConnection = new RTCPeerConnection(rtcConfig)

  // Attach local media tracks (Audio & Video)
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection?.addTrack(track, localStream!)
    })
  }

  // Ensure transceivers exist so two-way media connects even if camera is off
  try {
    const hasAudio = peerConnection.getTransceivers().some(t => t.receiver.track.kind === 'audio')
    if (!hasAudio) {
      peerConnection.addTransceiver('audio', { direction: 'sendrecv' })
    }
    const hasVideo = peerConnection.getTransceivers().some(t => t.receiver.track.kind === 'video')
    if (!hasVideo) {
      peerConnection.addTransceiver('video', { direction: 'sendrecv' })
    }
  } catch (e) {
    console.warn('Transceiver setup:', e)
  }

  // Handle incoming remote media tracks (Audio & Video)
  peerConnection.ontrack = (event) => {
    console.log('WebRTC ontrack event received:', event.track.kind)
    if (event.streams && event.streams[0]) {
      remoteStream = event.streams[0]
    } else {
      if (!remoteStream) remoteStream = new MediaStream()
      remoteStream.addTrack(event.track)
    }

    isConnectedPeer.value = true

    nextTick(() => {
      if (remoteVideoRef.value && remoteStream) {
        remoteVideoRef.value.srcObject = remoteStream
        remoteVideoRef.value.play().catch(e => console.log('Video play error:', e))
      }
      if (remoteAudioRef.value && remoteStream) {
        remoteAudioRef.value.srcObject = remoteStream
        remoteAudioRef.value.play().catch(e => console.log('Audio play error:', e))
      }
    })
  }

  // Handle ICE Candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal('candidate', event.candidate, targetUserId)
    }
  }

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState
    console.log('WebRTC connection state:', state)
    if (state === 'connected') {
      isConnectedPeer.value = true
    } else if (state === 'disconnected' || state === 'failed') {
      isConnectedPeer.value = false
    }
  }

  return peerConnection
}

// Send WebRTC Signal via server room
const sendSignal = async (type: string, payload: any, toUserId?: string) => {
  const token = authStore.token || 'demo-token'
  try {
    await $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        roomId: roomId.value,
        action: 'signal',
        type,
        payload,
        toUserId,
      },
    })
  } catch (err) {
    console.warn('Failed to send signal:', err)
  }
}

// Initiate WebRTC Offer to remote peer
const initiateCall = async (targetUserId: string) => {
  if (isOffering) return
  isOffering = true
  try {
    console.log('Initiating WebRTC offer to:', targetUserId)
    const pc = createPeerConnection(targetUserId)
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    await pc.setLocalDescription(offer)
    await sendSignal('offer', offer, targetUserId)
  } catch (err) {
    console.error('Initiate call error:', err)
  } finally {
    isOffering = false
  }
}

// Handle Incoming WebRTC Signals
const handleIncomingSignal = async (signal: any) => {
  const fromUser = signal.fromUserId
  if (!fromUser || fromUser === currentUserId.value) return

  console.log('Handling incoming signal:', signal.type, 'from:', fromUser)

  if (signal.type === 'peer-join') {
    if (String(currentUserId.value) > String(fromUser)) {
      await initiateCall(fromUser)
    }
  } else if (signal.type === 'offer') {
    const pc = createPeerConnection(fromUser)
    await pc.setRemoteDescription(new RTCSessionDescription(signal.payload))
    await flushCandidates()
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await sendSignal('answer', answer, fromUser)
  } else if (signal.type === 'answer') {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload))
      await flushCandidates()
    }
  } else if (signal.type === 'candidate') {
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload))
      } catch (e) {
        console.warn('Candidate error:', e)
      }
    } else {
      iceCandidateQueue.push(signal.payload)
    }
  }
}

// ═══════════════════════════════════════════
// 5. ROOM REGISTRATION & REAL-TIME SYNC
// ═══════════════════════════════════════════
const joinRoom = async () => {
  const token = authStore.token || 'demo-token'
  try {
    await $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        roomId: roomId.value,
        action: 'join',
        avatar: authStore.userAvatar || '',
        isMicOn: isMicOn.value,
        isCameraOn: isCameraOn.value,
      },
    })
  } catch (err) {
    console.error('Join room error:', err)
  }
}

const sendHeartbeat = async () => {
  const token = authStore.token || 'demo-token'
  try {
    await $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        roomId: roomId.value,
        action: 'heartbeat',
        isMicOn: isMicOn.value,
        isCameraOn: isCameraOn.value,
      },
    }).catch(() => {})
  } catch {}
}

const syncRoom = async () => {
  const token = authStore.token || 'demo-token'
  try {
    const res: any = await $fetch(`/api/meetings/room?roomId=${encodeURIComponent(roomId.value)}&since=${lastSyncTimestamp}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.success) {
      lastSyncTimestamp = res.timestamp || Date.now()

      // Update Remote Participants (all active peers except self)
      const others = (res.participants || []).filter((p: any) => !p.isSelf && p.userId !== currentUserId.value)
      
      const prevOthersCount = remotePeers.value.length
      remotePeers.value = others

      // Auto-connect call if peer is present and not connected
      if (others.length > 0) {
        const target = others[0]
        if (!peerConnection || peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
          if (String(currentUserId.value) > String(target.userId) && prevOthersCount === 0) {
            initiateCall(target.userId)
          }
        }
      }

      // Sync chat messages
      if (Array.isArray(res.messages) && res.messages.length > 0) {
        for (const msg of res.messages) {
          if (!messages.value.some(m => m.id === msg.id)) {
            messages.value.push(msg)
          }
        }
        scrollChatToBottom()
      }

      // Process WebRTC Signals
      if (Array.isArray(res.signals)) {
        for (const sig of res.signals) {
          if (processedSignalIds.has(sig.id)) continue
          processedSignalIds.add(sig.id)
          await handleIncomingSignal(sig)
        }
      }

      // Sync resolutions
      if (Array.isArray(res.resolutions) && res.resolutions.length > 0) {
        resolutions.value = res.resolutions
      }
    }
  } catch (err) {
    console.warn('Sync room error:', err)
  }
}

// ═══════════════════════════════════════════
// 6. IN-MEETING LIVE CHAT
// ═══════════════════════════════════════════
interface ChatMessage {
  id: string
  senderId?: string
  sender: string
  role: string
  text: string
  time: string
  type?: 'text' | 'resource' | 'code'
}

const messages = ref<ChatMessage[]>([])
const newChatMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

const sendChatMessage = async () => {
  const text = newChatMessage.value.trim()
  if (!text) return

  newChatMessage.value = ''
  const token = authStore.token || 'demo-token'

  try {
    const res: any = await $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        roomId: roomId.value,
        action: 'chat',
        text,
      },
    })
    if (res.success && res.message) {
      if (!messages.value.some(m => m.id === res.message.id)) {
        messages.value.push(res.message)
      }
      scrollChatToBottom()
    }
  } catch (err: any) {
    alert(err?.message || 'Failed to send message')
  }
}

// ═══════════════════════════════════════════
// 7. COLLABORATIVE MINUTES & RESOLUTIONS
// ═══════════════════════════════════════════
const resolutions = ref<string[]>([
  'የአጭር ጊዜ ውሰት (SHORT loans) ለተፈላጊ ማጣቀሻ መጻሕፍት በቀን 2.00 ETB ቅጣት እንዲቀጥል ተስማምተናል።',
  'በቤተ-መጽሐፍት ውስጥ የሚነበቡ መጻሕፍት ተማሪዎች በሰዓቱ ከመለሱ ምንም አይነት ቅጣት (0.00 ETB) አይጣልባቸውም።',
  'የተዘጉ መደርደሪያዎች (Closed Shelf rare manuscripts) ፈቃድ በዲሬክተሩና በዋና ላይብረሪያኑ በዲጂታል ፖርታል እንዲጸድቅ ተወስኗል።',
])

const actionItems = ref([
  { task: 'የተዘጉ መደርደሪያዎችን የባርኮድ እና ሼልፍ ቁጥር ማዘመን', assignee: 'Tigist Hailu', status: 'In Progress', due: 'Nov 18, 2026' },
  { task: 'ያረፈዱ መጻሕፍት የኤስኤምኤስ እና የኢሜይል ማሳሰቢያ መላክ', assignee: 'Abebe Shewa', status: 'Pending', due: 'Nov 14, 2026' },
  { task: 'ለቀጣዩ ሴሚስተር አዳዲስ 500 ማጣቀሻ መጻሕፍት ግዥ ማጽደቅ', assignee: 'Library Director', status: 'Approved', due: 'Nov 25, 2026' },
])

const newResolutionText = ref('')
const isSavingMinutes = ref(false)

const addResolution = async () => {
  if (!newResolutionText.value.trim()) return
  resolutions.value.push(newResolutionText.value.trim())
  newResolutionText.value = ''
  await syncMinutesToServer()
}

const syncMinutesToServer = async () => {
  const token = authStore.token || 'demo-token'
  try {
    await $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        roomId: roomId.value,
        action: 'minutes',
        resolutions: resolutions.value,
        actionItems: actionItems.value,
      },
    })
  } catch {}
}

const saveMinutesToDatabase = async () => {
  isSavingMinutes.value = true
  try {
    await $fetch('/api/meetings/minutes', {
      method: 'POST',
      body: {
        meetingId: roomId.value,
        resolutions: resolutions.value,
        actionItems: actionItems.value,
      },
    })
    alert('የስብሰባው ቃለ-ጉባዔ በዳታቤዝ ተቀምጧል! (Minutes saved to database)')
  } catch (err: any) {
    alert(err?.message || 'Minutes saved')
  } finally {
    isSavingMinutes.value = false
  }
}

// ═══════════════════════════════════════════
// 8. RESOURCE SHARING
// ═══════════════════════════════════════════
const sharedResources = ref([
  {
    type: 'POLICY',
    title: '📘 Closed Shelf Request Procedure 2026',
    description: 'Guidelines on Short (1-4d) vs Long (14-30d) loans, lost book penalties, and clearances.',
    sharedBy: 'Library Director',
    time: '10:08 AM',
  },
])

const shareStatsIntoMeeting = () => {
  sharedResources.value.push({
    type: 'DATA',
    title: `📈 Live Circulation Update (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
    description: 'Total Catalog: 3,995 Titles | Active Loans: 420 | Overdue Items: 18',
    sharedBy: userName.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
  activeTab.value = 'resources'
}

const copyMeetingLink = () => {
  if (!import.meta.client) return
  navigator.clipboard.writeText(window.location.href)
  copiedRoomLink.value = true
  setTimeout(() => { copiedRoomLink.value = false }, 2500)
}

const reconnectMedia = async () => {
  if (activeRemotePeer.value) {
    await initiateCall(activeRemotePeer.value.userId)
  }
}

const leaveMeeting = async () => {
  const token = authStore.token || 'demo-token'
  try {
    $fetch('/api/meetings/room', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { roomId: roomId.value, action: 'leave' },
    }).catch(() => {})
  } catch {}

  if (localStream) localStream.getTracks().forEach(t => t.stop())
  if (screenStream) screenStream.getTracks().forEach(t => t.stop())
  if (peerConnection) peerConnection.close()

  if (authStore.isAdmin) {
    router.push('/admin')
  } else if (authStore.isLibrarian) {
    router.push('/librarian')
  } else {
    router.push('/')
  }
}

// ═══════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════
onMounted(async () => {
  authStore.init()

  // Ensure user has minimum auth state for the meeting
  if (!authStore.isAuthenticated) {
    // If not authenticated, create a session identity based on url or role
    const demoRole = route.query.role === 'librarian' ? 'Librarian' : 'Administrator'
    const demoName = route.query.role === 'librarian' ? 'Abel Mekonnen' : 'Abebe Shewa'
    authStore.saveAuth('mau-jwt-token-' + Date.now(), {
      userId: route.query.role === 'librarian' ? 'mau-lib-01' : 'mau-admin-01',
      name: demoName,
      email: `${demoName.toLowerCase().replace(' ', '.')}@mau.edu.et`,
      userType: demoRole,
    })
  }

  await initLocalMedia()
  await joinRoom()
  await syncRoom()

  // Heartbeat & Sync polling every 1000ms
  syncInterval = setInterval(async () => {
    await sendHeartbeat()
    await syncRoom()
  }, 1000)

  timerInterval = setInterval(() => {
    meetingSeconds.value++
  }, 1000)
})

onBeforeUnmount(() => {
  if (syncInterval) clearInterval(syncInterval)
  if (timerInterval) clearInterval(timerInterval)
  if (localStream) localStream.getTracks().forEach(t => t.stop())
  if (screenStream) screenStream.getTracks().forEach(t => t.stop())
  if (peerConnection) peerConnection.close()
})
</script>

<template>
  <div class="h-screen w-screen bg-[#0d121d] text-white flex flex-col font-sans overflow-hidden select-none">
    
    <!-- Hidden audio element for receiving crystal clear remote sound -->
    <audio ref="remoteAudioRef" autoplay playsinline class="hidden"></audio>

    <!-- ================= 1. RESPONSIVE TOP HEADER ================= -->
    <header class="h-14 px-3 sm:px-4 bg-[#141b29] border-b border-white/10 flex items-center justify-between shrink-0 z-30 overflow-x-hidden">
      
      <!-- Left: Title & Badge -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          🏛️
        </div>
        <div class="min-w-0">
          <h1 class="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
            <span class="truncate">{{ meetingTitle }}</span>
            <span class="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              ● LIVE
            </span>
          </h1>
          <p class="text-[10px] text-slate-400 font-mono truncate hidden xs:block">
            Room: <strong class="text-blue-300">{{ roomId }}</strong> • {{ userName }} ({{ userRole }})
          </p>
        </div>
      </div>

      <!-- Center: Security & Timer -->
      <div class="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl shrink-0">
        <Clock :size="12" class="text-blue-400 animate-pulse" />
        <span class="text-xs font-mono font-bold text-slate-200">{{ formattedTimer }}</span>
        <span class="text-white/20 text-xs hidden sm:inline">|</span>
        <Shield :size="12" class="text-emerald-400 hidden sm:inline" />
        <span class="text-[10px] text-slate-300 hidden md:inline">JWT Secured</span>
      </div>

      <!-- Right: Mobile View Toggle + Share Room -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          @click="copyMeetingLink()"
          class="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
          :title="copiedRoomLink ? 'Copied!' : 'Copy Link'"
        >
          <Check v-if="copiedRoomLink" :size="13" class="text-emerald-400" />
          <Copy v-else :size="13" />
          <span class="hidden sm:inline">{{ copiedRoomLink ? 'Copied' : 'Copy' }}</span>
        </button>

        <!-- Toggle Panel Button -->
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          :class="isSidebarOpen ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'"
          class="p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
          :title="isSidebarOpen ? 'Hide Drawer' : 'Open Drawer'"
        >
          <MessageSquare :size="14" />
          <span class="hidden md:inline">{{ isSidebarOpen ? 'Hide Panel' : 'Chat & Minutes' }}</span>
        </button>
      </div>
    </header>

    <!-- ================= 2. MAIN STAGE & COLLABORATION AREA ================= -->
    <div class="flex-1 flex overflow-hidden relative">

      <!-- Center: Video Grid & Screen Share -->
      <main class="flex-1 flex flex-col p-2 sm:p-3 gap-2 overflow-y-auto bg-[#090d14] transition-all">
        
        <!-- Screen Share View (When Active) -->
        <div v-if="isScreenSharing" class="flex-1 bg-black rounded-2xl overflow-hidden border border-blue-500/40 relative shadow-2xl flex flex-col min-h-[220px]">
          <div class="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
            <Monitor :size="12" class="text-blue-400" />
            <span>Screen Presentation: {{ userName }}</span>
          </div>
          <video ref="screenVideoRef" autoplay playsinline class="w-full h-full object-contain"></video>
        </div>

        <!-- Video Grid Container -->
        <div 
          class="grid gap-2.5 transition-all flex-1 h-full min-h-0"
          :class="[
            isScreenSharing ? 'grid-cols-2 max-h-40 shrink-0' : '',
            !isScreenSharing && (activeRemotePeer ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2')
          ]"
        >
          
          <!-- ================= TILE 1: LOCAL USER (YOU) ================= -->
          <div class="bg-[#141b29] rounded-2xl overflow-hidden border-2 border-white/10 relative shadow-lg flex items-center justify-center group min-h-[180px]">
            <!-- Live WebRTC Video -->
            <video
              v-show="isCameraOn"
              ref="localVideoRef"
              autoplay
              muted
              playsinline
              class="w-full h-full object-cover scale-x-[-1]"
            ></video>

            <!-- Avatar Fallback when Camera is Off -->
            <div v-if="!isCameraOn" class="flex flex-col items-center justify-center p-4 text-center">
              <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 border-2 border-blue-400 flex items-center justify-center text-2xl font-black text-white shadow-inner mb-2 animate-pulse">
                {{ userName.charAt(0).toUpperCase() }}
              </div>
              <p class="font-bold text-sm text-white">{{ userName }}</p>
              <span class="text-[10px] text-blue-300 font-bold uppercase">{{ userRole }} (You)</span>
            </div>

            <!-- Bottom Badges -->
            <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
              <div class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                <span>{{ userName }} (You)</span>
                <span class="text-[9px] px-1 py-0.2 rounded bg-blue-600 text-white font-black uppercase">{{ userRole }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span v-if="isHandRaised" class="p-1 rounded bg-amber-500 text-slate-900 font-bold text-xs">✋</span>
                <div :class="isMicOn ? 'bg-black/60 text-white' : 'bg-rose-600 text-white'" class="p-1 rounded border border-white/10">
                  <Mic v-if="isMicOn" :size="12" />
                  <MicOff v-else :size="12" />
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TILE 2: REAL REMOTE PEER (LIBRARIAN / ADMIN) ================= -->
          <div 
            v-if="activeRemotePeer" 
            class="bg-[#141b29] rounded-2xl overflow-hidden border-2 border-emerald-500/50 relative shadow-lg flex items-center justify-center group min-h-[180px]"
          >
            <!-- Real Remote Live Video -->
            <video
              ref="remoteVideoRef"
              autoplay
              playsinline
              class="w-full h-full object-cover"
            ></video>

            <!-- Fallback if peer camera is off or loading -->
            <div v-show="!activeRemotePeer.isCameraOn" class="flex flex-col items-center justify-center p-4 text-center absolute inset-0 bg-[#141b29]">
              <div class="relative mb-2">
                <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-700 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                  {{ activeRemotePeer.name?.charAt(0).toUpperCase() || 'P' }}
                </div>
                <span v-if="activeRemotePeer.isMicOn" class="absolute -inset-1 rounded-full border border-emerald-400/60 animate-ping pointer-events-none"></span>
              </div>
              <p class="font-bold text-sm text-white">{{ activeRemotePeer.name }}</p>
              <div class="flex items-center gap-1 text-[10px] text-emerald-300 font-bold uppercase mt-0.5">
                <Wifi :size="11" class="text-emerald-400" />
                <span>{{ activeRemotePeer.role }} • Connected</span>
              </div>
            </div>

            <!-- Remote Peer Badges -->
            <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
              <div class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-white/10">
                <span>{{ activeRemotePeer.name }}</span>
                <span class="text-[9px] px-1 py-0.2 rounded bg-emerald-600 text-white font-black uppercase">{{ activeRemotePeer.role }}</span>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  @click="reconnectMedia" 
                  class="p-1 rounded bg-black/60 text-slate-300 hover:text-white pointer-events-auto cursor-pointer" 
                  title="Reconnect AV"
                >
                  <RefreshCw :size="11" />
                </button>
                <div :class="activeRemotePeer.isMicOn ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'" class="p-1 rounded font-bold">
                  <Mic v-if="activeRemotePeer.isMicOn" :size="12" />
                  <MicOff v-else :size="12" />
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TILE 2 EMPTY STATE (WAITING FOR PEER TO JOIN) ================= -->
          <div 
            v-else 
            class="bg-[#141b29]/70 rounded-2xl border-2 border-dashed border-white/15 relative flex flex-col items-center justify-center p-4 text-center space-y-2.5 min-h-[180px]"
          >
            <div class="relative">
              <div class="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-400/30 flex items-center justify-center text-2xl">
                📡
              </div>
              <span class="absolute -inset-1.5 rounded-full border border-blue-400/40 animate-ping pointer-events-none"></span>
            </div>

            <div>
              <h3 class="font-black text-sm text-white">Waiting for Colleague to Connect...</h3>
              <p class="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                {{ authStore.isAdmin ? 'Librarian can join from the Librarian portal or link below.' : 'Administrator can join from the Admin portal or link below.' }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="copyMeetingLink()"
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy :size="12" />
                <span>Copy Room Link</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      <!-- ================= 3. RIGHT COLLABORATION DRAWER ================= -->
      <aside
        v-if="isSidebarOpen"
        class="w-72 sm:w-80 md:w-96 bg-[#141b29] border-l border-white/10 flex flex-col shrink-0 z-20 transition-all shadow-2xl overflow-hidden"
      >
        <!-- Drawer Tabs Header -->
        <div class="flex border-b border-white/10 bg-black/20 text-xs font-bold shrink-0">
          <button
            @click="activeTab = 'chat'"
            :class="activeTab === 'chat' ? 'bg-[#141b29] text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2.5 flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
          >
            <MessageSquare :size="13" />
            <span>Chat</span>
          </button>

          <button
            @click="activeTab = 'minutes'"
            :class="activeTab === 'minutes' ? 'bg-[#141b29] text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2.5 flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
          >
            <FileText :size="13" />
            <span>Minutes</span>
          </button>

          <button
            @click="activeTab = 'resources'"
            :class="activeTab === 'resources' ? 'bg-[#141b29] text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'"
            class="flex-1 py-2.5 flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
          >
            <Share2 :size="13" />
            <span>Share</span>
          </button>

          <button
            @click="activeTab = 'participants'"
            :class="activeTab === 'participants' ? 'bg-[#141b29] text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'"
            class="py-2.5 px-2.5 flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
            title="Participants"
          >
            <Users :size="13" />
            <span class="font-mono text-[10px]">{{ remotePeers.length + 1 }}</span>
          </button>
        </div>

        <!-- ───── TAB 1: REAL-TIME IN-MEETING CHAT ───── -->
        <div v-show="activeTab === 'chat'" class="flex-1 flex flex-col overflow-hidden">
          <div ref="chatContainerRef" class="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex flex-col space-y-0.5"
            >
              <div class="flex items-baseline justify-between text-[10px]">
                <span class="font-bold text-slate-300">
                  {{ msg.sender }}
                  <span class="text-blue-400 text-[9px] font-normal ml-1">({{ msg.role }})</span>
                </span>
                <span class="text-slate-500 font-mono text-[9px]">{{ msg.time }}</span>
              </div>
              <div class="bg-white/5 border border-white/10 p-2 rounded-xl text-slate-100 font-medium leading-relaxed text-xs">
                {{ msg.text }}
              </div>
            </div>

            <div v-if="messages.length === 0" class="py-6 text-center text-slate-500 text-xs">
              No messages yet. Send a message to chat with your colleague!
            </div>
          </div>

          <!-- Chat Input -->
          <div class="p-2.5 bg-black/20 border-t border-white/10 shrink-0">
            <form @submit.prevent="sendChatMessage" class="flex items-center gap-1.5">
              <input
                v-model="newChatMessage"
                type="text"
                placeholder="መልእክት ጻፍ... (Type message to staff...)"
                class="flex-1 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                class="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-xs shrink-0"
              >
                <Send :size="14" />
              </button>
            </form>
          </div>
        </div>

        <!-- ───── TAB 2: MINUTES & RESOLUTIONS ───── -->
        <div v-show="activeTab === 'minutes'" class="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          <div>
            <h3 class="font-black text-xs text-white flex items-center justify-between">
              <span>ቃለ-ጉባዔ (Live Resolutions)</span>
              <button
                @click="saveMinutesToDatabase"
                :disabled="isSavingMinutes"
                class="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[9px] flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Save :size="11" />
                <span>{{ isSavingMinutes ? 'Saving...' : 'Save' }}</span>
              </button>
            </h3>
            <p class="text-[9px] text-slate-400 mt-0.5">Real-time collaborative library directives</p>
          </div>

          <div class="space-y-1.5">
            <div
              v-for="(res, idx) in resolutions"
              :key="idx"
              class="p-2 rounded-xl bg-white/5 border border-white/10 flex items-start gap-1.5 text-[11px]"
            >
              <span class="text-emerald-400 font-bold">#{{ idx + 1 }}</span>
              <p class="text-slate-200 leading-snug flex-1">{{ res }}</p>
            </div>
          </div>

          <!-- Add Resolution -->
          <div class="space-y-1 pt-2 border-t border-white/10">
            <textarea
              v-model="newResolutionText"
              rows="2"
              placeholder="አዲስ የውሳኔ ሃሳብ ጻፍ (Add resolution)..."
              class="w-full bg-white/10 border border-white/20 rounded-xl p-2 text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition"
            ></textarea>
            <button
              @click="addResolution"
              class="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              + Add Resolution
            </button>
          </div>
        </div>

        <!-- ───── TAB 3: SHARE HUB ───── -->
        <div v-show="activeTab === 'resources'" class="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-xs text-white">Resource Sharing</h3>
            <button
              @click="shareStatsIntoMeeting"
              class="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold cursor-pointer"
            >
              + Share Live Stats
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, idx) in sharedResources"
              :key="idx"
              class="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-[11px]">{{ item.title }}</span>
                <span class="text-[9px] text-slate-400 font-mono">{{ item.time }}</span>
              </div>
              <p class="text-[10px] text-slate-300 leading-relaxed">{{ item.description }}</p>
              <span class="text-[9px] text-blue-300 block text-right">Shared by: {{ item.sharedBy }}</span>
            </div>
          </div>
        </div>

        <!-- ───── TAB 4: PARTICIPANTS ───── -->
        <div v-show="activeTab === 'participants'" class="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
          <div class="border-b border-white/10 pb-1.5">
            <h3 class="font-black text-xs text-white">ተሳታፊዎች (Participants: {{ remotePeers.length + 1 }})</h3>
          </div>

          <!-- You -->
          <div class="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏛️</span>
              <div>
                <p class="font-bold text-xs text-white">{{ userName }} (You)</p>
                <p class="text-[9px] text-blue-300">{{ userRole }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <Mic v-if="isMicOn" :size="12" class="text-emerald-400" />
              <MicOff v-else :size="12" class="text-rose-400" />
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500 text-white">YOU</span>
            </div>
          </div>

          <!-- Remote Peer -->
          <div
            v-for="p in remotePeers"
            :key="p.userId"
            class="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">👨‍💼</span>
              <div>
                <p class="font-bold text-xs text-white">{{ p.name }}</p>
                <p class="text-[9px] text-emerald-300">{{ p.role }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <Mic v-if="p.isMicOn" :size="12" class="text-emerald-400" />
              <MicOff v-else :size="12" class="text-rose-400" />
              <span class="text-[8px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">CONNECTED</span>
            </div>
          </div>
        </div>

      </aside>

    </div>

    <!-- ================= 4. BOTTOM MEETING CONTROL BAR ================= -->
    <footer class="h-16 sm:h-18 bg-[#141b29] border-t border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 overflow-x-hidden">
      
      <!-- Left: Room & Meeting Name -->
      <div class="hidden md:block min-w-0">
        <p class="font-bold text-xs text-white truncate max-w-xs">{{ meetingTitle }}</p>
        <p class="text-[10px] text-slate-400 font-mono">Room: {{ roomId }}</p>
      </div>

      <!-- Center: Core AV Buttons -->
      <div class="flex items-center gap-2 sm:gap-3 mx-auto md:mx-0">
        
        <!-- Microphone -->
        <button
          @click="toggleMic()"
          :class="isMicOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
          :title="isMicOn ? 'Mute Mic' : 'Unmute Mic'"
        >
          <Mic v-if="isMicOn" :size="18" />
          <MicOff v-else :size="18" />
        </button>

        <!-- Camera -->
        <button
          @click="toggleCamera()"
          :class="isCameraOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
          :title="isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'"
        >
          <Video v-if="isCameraOn" :size="18" />
          <VideoOff v-else :size="18" />
        </button>

        <!-- Screen Share -->
        <button
          @click="toggleScreenShare()"
          :class="isScreenSharing ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/15 hover:bg-white/25 text-white'"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
          :title="isScreenSharing ? 'Stop Screen Share' : 'Share Screen'"
        >
          <Monitor :size="18" />
        </button>

        <!-- Raise Hand -->
        <button
          @click="isHandRaised = !isHandRaised"
          :class="isHandRaised ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-white/15 hover:bg-white/25 text-white'"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
          title="Raise Hand"
        >
          <Hand :size="18" />
        </button>

        <!-- Leave Call -->
        <button
          @click="leaveMeeting()"
          class="px-4 h-10 sm:h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition cursor-pointer shrink-0"
          title="Leave Meeting"
        >
          <PhoneOff :size="16" />
          <span class="hidden sm:inline">Leave</span>
        </button>

      </div>

      <!-- Right: Drawer Toggles -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          @click="isSidebarOpen = true; activeTab = 'chat'"
          :class="isSidebarOpen && activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'"
          class="p-2 sm:p-2.5 rounded-xl transition cursor-pointer relative"
          title="Chat"
        >
          <MessageSquare :size="16" />
        </button>

        <button
          @click="isSidebarOpen = true; activeTab = 'minutes'"
          :class="isSidebarOpen && activeTab === 'minutes' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'"
          class="p-2 sm:p-2.5 rounded-xl transition cursor-pointer"
          title="Minutes & Decisions"
        >
          <FileText :size="16" />
        </button>
      </div>

    </footer>

  </div>
</template>