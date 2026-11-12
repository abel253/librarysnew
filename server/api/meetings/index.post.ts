// server/api/meetings/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const title = String(body.title || 'Director & Librarian Consultation').trim()
    const agenda = String(body.agenda || 'Operations and Resource Review').trim()
    const hostName = String(body.hostName || 'Library Staff').trim()
    const hostRole = String(body.hostRole || 'Librarian').trim()
    const meetingId = String(body.meetingId || `MAU-${Date.now().toString().slice(-6)}`).toUpperCase().trim()

    const meetingData = {
      meetingId,
      title,
      agenda,
      hostName,
      hostRole,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'ACTIVE',
      roomCode: meetingId,
      participants: [hostName],
    }

    // Record into AuditLog
    const log = await prisma.auditLog.create({
      data: {
        tableName: 'staff_meetings',
        recordId: Math.floor(Math.random() * 100000),
        action: 'MEETING_CREATED',
        newData: meetingData,
      },
    })

    return {
      success: true,
      message: 'ስብሰባው በተሳካ ሁኔታ ተፈጥሯል (Meeting room ready)',
      meeting: {
        id: log.logId,
        ...meetingData,
      },
    }
  } catch (err: any) {
    console.error('Create meeting error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to create meeting room',
    })
  }
})
