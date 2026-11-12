// server/api/research/[id].put.ts
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Research ID is required for updates' })
    }

    const updatedRecord = await prisma.research.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        authorName: body.authorName,
        college: body.college,
        department: body.department,
        documentType: body.documentType,
      }
    })

    return {
      success: true,
      message: 'ጥናቱ በተሳካ ሁኔታ ተስተካክሏል!',
      data: updatedRecord
    }
  } catch (err: any) {
    console.error('Research update error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update research record'
    })
  }
})