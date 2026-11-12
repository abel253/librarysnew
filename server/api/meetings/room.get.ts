// server/api/meetings/room.get.ts
import { requireAuth } from '../../utils/auth'
import { getOrCreateRoom } from '../../utils/roomState'

export default defineEventHandler(async (event) => {
  // 1. Mandatory JWT Authentication Token
  const authUser = await requireAuth(event)
  const query = getQuery(event)

  const roomId = String(query.roomId || 'MAU-DIRECTOR-LIB').toUpperCase().trim()
  const since = Number(query.since) || 0

  const room = getOrCreateRoom(roomId)
  const now = Date.now()

  // 2. Prune inactive participants (haven't sent heartbeat in > 18 seconds)
  for (const [uid, participant] of room.participants.entries()) {
    if (now - participant.lastSeen > 18000) {
      room.participants.delete(uid)
    }
  }

  // Update caller's lastSeen if present
  if (room.participants.has(authUser.userId)) {
    const me = room.participants.get(authUser.userId)!
    me.lastSeen = now
  }

  // 3. Collect active participants list
  const activeParticipants = Array.from(room.participants.values()).map(p => ({
    userId: p.userId,
    name: p.name,
    role: p.role,
    avatar: p.avatar,
    isMicOn: p.isMicOn,
    isCameraOn: p.isCameraOn,
    isSelf: p.userId === authUser.userId,
  }))

  // 4. Collect recent chat messages (last 60 messages so client never misses messages)
  const recentMessages = room.messages.slice(-60)

  // 5. Collect incoming WebRTC signals intended for this user
  const incomingSignals = room.signals.filter(s => {
    // Never return caller's own signal
    if (s.fromUserId === authUser.userId) return false
    // If targeted to a specific peer, must match this user
    if (s.toUserId && s.toUserId !== authUser.userId) return false
    // Allow a 2-second timestamp safety buffer to prevent missed signals due to polling intervals
    if (since > 0 && s.timestamp <= (since - 2000)) return false
    return true
  })

  return {
    success: true,
    timestamp: now,
    roomId,
    currentUser: {
      userId: authUser.userId,
      name: authUser.name,
      role: authUser.userType,
    },
    participants: activeParticipants,
    messages: recentMessages,
    signals: incomingSignals,
    resolutions: room.resolutions,
    actionItems: room.actionItems,
  }
})
