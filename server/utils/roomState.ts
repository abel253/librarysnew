// server/api/meetings/roomState.ts
export interface RoomParticipant {
  userId: string
  name: string
  role: string
  avatar?: string
  isMicOn: boolean
  isCameraOn: boolean
  lastSeen: number
}

export interface RoomChatMessage {
  id: string
  senderId: string
  sender: string
  role: string
  text: string
  time: string
  timestamp: number
}

export interface RoomSignal {
  id: string
  fromUserId: string
  toUserId?: string
  type: 'offer' | 'answer' | 'candidate' | 'peer-join'
  payload: any
  timestamp: number
}

export interface MeetingRoomState {
  participants: Map<string, RoomParticipant>
  messages: RoomChatMessage[]
  signals: RoomSignal[]
  resolutions: string[]
  actionItems: any[]
}

// Global in-memory storage for active meeting rooms
declare global {
  var __meetingRooms: Map<string, MeetingRoomState> | undefined
}

if (!globalThis.__meetingRooms) {
  globalThis.__meetingRooms = new Map<string, MeetingRoomState>()
}

export const meetingRooms = globalThis.__meetingRooms

export function getOrCreateRoom(roomId: string): MeetingRoomState {
  const normId = roomId.toUpperCase().trim()
  let room = meetingRooms.get(normId)
  if (!room) {
    room = {
      participants: new Map(),
      messages: [
        {
          id: 'welcome-1',
          senderId: 'SYSTEM',
          sender: 'Mekdela Amba University',
          role: 'Official Line',
          text: 'እንኳን ወደ ቤተ-መጽሐፍት ዲሬክተር እና ሰራተኞች የቀጥታ የቪዲዮ ስብሰባ በደህና መጡ! (Welcome to Executive Meeting Room)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now() - 60000,
        }
      ],
      signals: [],
      resolutions: [
        'የአጭር ጊዜ ውሰት (SHORT loans) ለተፈላጊ ማጣቀሻ መጻሕፍት በቀን 2.00 ETB ቅጣት እንዲቀጥል ተስማምተናል።',
        'በቤተ-መጽሐፍት ውስጥ የሚነበቡ መጻሕፍት ተማሪዎች በሰዓቱ ከመለሱ ምንም አይነት ቅጣት (0.00 ETB) አይጣልባቸውም።'
      ],
      actionItems: [
        { task: 'የተዘጉ መደርደሪያዎችን የባርኮድ እና ሼልፍ ቁጥር ማዘመን', assignee: 'Cataloging Officer', status: 'In Progress', due: 'Nov 18, 2026' }
      ]
    }
    meetingRooms.set(normId, room)
  }
  return room
}
