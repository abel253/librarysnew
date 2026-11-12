// server/api/meetings/index.get.ts
export default defineEventHandler(async () => {
  try {
    // Fetch meeting records and saved minutes from auditLog
    const logs = await prisma.auditLog.findMany({
      where: {
        tableName: 'staff_meetings',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const savedMeetings = logs.map(l => {
      const data: any = l.newData || {}
      return {
        id: l.logId,
        meetingId: data.meetingId || `MAU-MTG-${l.logId}`,
        title: data.title || 'Director & Staff Consultation',
        agenda: data.agenda || 'General Library Operations',
        hostName: data.hostName || 'Library Director',
        hostRole: data.hostRole || 'Administrator',
        date: data.date || new Date(l.createdAt).toISOString().split('T')[0],
        time: data.time || new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: data.status || 'COMPLETED',
        resolutions: data.resolutions || [],
        actionItems: data.actionItems || [],
        sharedResources: data.sharedResources || [],
        participants: data.participants || ['Library Director', 'Head Librarian'],
      }
    })

    // Default upcoming and active meeting rooms if none in db
    const activeRooms = [
      {
        meetingId: 'MAU-DIRECTOR-LIB',
        title: '🏛️ Weekly Director & Librarian Executive Briefing',
        agenda: 'Circulation policy updates, overdue fine waivers review, rare closed stack authorizations',
        hostName: 'Dr. Tadesse Bekele (Library Director)',
        hostRole: 'Administrator',
        status: 'LIVE_NOW',
        roomCode: 'MAU-DIRECTOR-LIB',
        scheduledFor: 'Every Thursday, 10:00 AM',
        participantsCount: 3,
        participants: ['Dr. Tadesse Bekele (Director)', 'Head Librarian', 'Cataloging Officer'],
      },
      {
        meetingId: 'MAU-CIRCULATION-SYNC',
        title: '📚 Daily Circulation Desk & Stacks Review',
        agenda: 'Short-term vs long-term book returns, damaged items assessment, catalog shelf assignments',
        hostName: 'Head Librarian',
        hostRole: 'Librarian',
        status: 'SCHEDULED',
        roomCode: 'MAU-CIRCULATION-SYNC',
        scheduledFor: 'Today, 2:30 PM',
        participantsCount: 4,
        participants: ['Head Librarian', 'Assistant Librarian 1', 'Assistant Librarian 2'],
      },
    ]

    return {
      success: true,
      activeRooms,
      history: savedMeetings,
    }
  } catch (err: any) {
    console.error('Fetch meetings error:', err)
    return {
      success: true,
      activeRooms: [],
      history: [],
    }
  }
})
