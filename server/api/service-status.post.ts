// server/api/service-status.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const status = String(body.status || (body.isOpen ? 'OPEN' : 'CLOSED')).toUpperCase() as 'OPEN' | 'CLOSED' | 'MAINTENANCE'
    const isOpen = status === 'OPEN'
    const noticeMessage = String(body.noticeMessage || (isOpen ? 'ላይብረሪው ክፍት ነው' : 'ላይብረሪው በዚህ ሰዓት አገልግሎት አይሰጥም')).trim()
    const reopenTime = String(body.reopenTime || 'ነገ ጥዋት 2:30 ሰዓት (Tomorrow at 8:30 AM)').trim()
    const workingHours = String(body.workingHours || 'ከሰኞ - አርብ፡ 2:00 ጥዋት - 4:00 ማታ | ቅዳሜና እሁድ፡ 2:30 ጥዋት - 12:00 ቀን').trim()
    const isAnnouncementActive = body.isAnnouncementActive !== undefined ? Boolean(body.isAnnouncementActive) : !isOpen
    const updatedBy = String(body.updatedBy || 'Library Staff').trim()

    const upsertConfig = async (key: string, value: string, desc?: string) => {
      await prisma.systemConfig.upsert({
        where: { configKey: key },
        create: {
          configKey: key,
          configValue: value.slice(0, 100),
          description: desc || null
        },
        update: {
          configValue: value.slice(0, 100),
          description: desc || null
        }
      })
    }

    await Promise.all([
      upsertConfig('library_service_status', status),
      upsertConfig('library_service_message', noticeMessage.slice(0, 95), noticeMessage),
      upsertConfig('library_reopen_time', reopenTime.slice(0, 95), reopenTime),
      upsertConfig('library_working_hours', workingHours.slice(0, 95), workingHours),
      upsertConfig('library_announcement_active', isAnnouncementActive ? 'true' : 'false'),
      upsertConfig('library_status_updated_by', updatedBy.slice(0, 95), updatedBy)
    ])

    return {
      success: true,
      message: 'የቤተ-መጽሐፍት የስራ ሰዓት እና ማሳወቂያ በተሳካ ሁኔታ ተላልፏል! (Operating status and announcement broadcasted successfully!)',
      data: {
        isOpen,
        status,
        noticeMessage,
        reopenTime,
        workingHours,
        isAnnouncementActive,
        updatedBy,
        updatedAt: new Date().toISOString()
      }
    }
  } catch (err: any) {
    console.error('Error saving service status:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update service status'
    })
  }
})
