// server/api/meetings/room.post.ts
import { requireAuth } from '../../utils/auth'
import { getOrCreateRoom, type RoomChatMessage, type RoomSignal } from '../../utils/roomState'

export default defineEventHandler(async (event) => {
  // 1. Mandatory JWT Authentication Token
  const authUser = await requireAuth(event)
  const body = await readBody(event)

  const roomId = String(body.roomId || 'MAU-DIRECTOR-LIB').toUpperCase().trim()
  const action = String(body.action || 'heartbeat').toLowerCase().trim()

  const room = getOrCreateRoom(roomId)
  const now = Date.now()

  if (action === 'join' || action === 'heartbeat') {
    room.participants.set(authUser.userId, {
      userId: authUser.userId,
      name: authUser.name || 'User',
      role: authUser.userType || 'Staff',
      avatar: body.avatar || '',
      isMicOn: body.isMicOn !== false,
      isCameraOn: body.isCameraOn !== false,
      lastSeen: now,
    })

    if (action === 'join') {
      // Signal others that a new peer joined
      room.signals.push({
        id: `sig-${Date.now()}-${Math.random()}`,
        fromUserId: authUser.userId,
        type: 'peer-join',
        payload: {
          userId: authUser.userId,
          name: authUser.name,
          role: authUser.userType,
        },
        timestamp: now,
      })
    }

    return {
      success: true,
      action,
      participantCount: room.participants.size,
    }
  }

  if (action === 'leave') {
    room.participants.delete(authUser.userId)
    return {
      success: true,
      action: 'left',
    }
  }

  if (action === 'chat') {
    const text = String(body.text || '').trim()
    if (!text) {
      throw createError({ statusCode: 400, statusMessage: 'Message text required' })
    }

    const msg: RoomChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: authUser.userId,
      sender: authUser.name,
      role: authUser.userType || 'Staff',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    }

    room.messages.push(msg)

    // Keep message history under 100 items
    if (room.messages.length > 100) {
      room.messages.splice(0, room.messages.length - 100)
    }

    return {
      success: true,
      message: msg,
    }
  }

  if (action === 'signal') {
    // WebRTC signaling: offer, answer, or candidate
    const signal: RoomSignal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fromUserId: authUser.userId,
      toUserId: body.toUserId ? String(body.toUserId) : undefined,
      type: body.type, // 'offer' | 'answer' | 'candidate'
      payload: body.payload,
      timestamp: now,
    }

    room.signals.push(signal)

    // Prune old signals (> 60 seconds)
    if (room.signals.length > 200) {
      room.signals = room.signals.filter(s => now - s.timestamp < 60000)
    }

    return {
      success: true,
      signalId: signal.id,
    }
  }

  if (action === 'minutes') {
    if (Array.isArray(body.resolutions)) {
      room.resolutions = body.resolutions
    }
    if (Array.isArray(body.actionItems)) {
      room.actionItems = body.actionItems
    }
    return {
      success: true,
      resolutions: room.resolutions,
      actionItems: room.actionItems,
    }
  }

  return { success: true }
})
