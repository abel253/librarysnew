// server/api/meetings/minutes.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const meetingId = String(body.meetingId || 'MAU-DIRECTOR-LIB').trim()
    const title = String(body.title || 'Meeting Resolutions & Minutes').trim()
    const agenda = String(body.agenda || '').trim()
    const recordedBy = String(body.recordedBy || 'Director / Librarian').trim()
    const resolutions = Array.isArray(body.resolutions) ? body.resolutions : []
    const actionItems = Array.isArray(body.actionItems) ? body.actionItems : []
    const sharedResources = Array.isArray(body.sharedResources) ? body.sharedResources : []

    const minuteRecord = {
      meetingId,
      title,
      agenda,
      recordedBy,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'OFFICIALLY_RECORDED',
      resolutions,
      actionItems,
      sharedResources,
    }

    const log = await prisma.auditLog.create({
      data: {
        tableName: 'staff_meetings',
        recordId: Math.floor(Math.random() * 100000),
        action: 'MINUTES_RECORDED',
        newData: minuteRecord,
      },
    })

    return {
      success: true,
      message: 'የስብሰባው ውሳኔዎችና ቃለ-ጉባኤ በስርዓቱ ተመዝግቧል (Meeting minutes & resolutions officially saved)',
      data: {
        id: log.logId,
        ...minuteRecord,
      },
    }
  } catch (err: any) {
    console.error('Save meeting minutes error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to save meeting minutes',
    })
  }
})
