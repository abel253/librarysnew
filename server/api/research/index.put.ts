// server/api/research/index.put.ts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const body = await readBody(event)
    const id = Number(query.id || body.id)

    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid research ID is required for updates' })
    }

    const updatedRecord = await prisma.research.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        authorName: (body.authorName !== undefined || body.author !== undefined)
          ? String(body.authorName || body.author).trim()
          : undefined,
        college: body.college !== undefined ? String(body.college).trim() : undefined,
        department: body.department !== undefined ? String(body.department).trim() : undefined,
        documentType: (body.documentType !== undefined || body.document_type !== undefined)
          ? String(body.documentType || body.document_type).trim()
          : undefined,
      },
    })

    return {
      success: true,
      message: 'ጥናቱ በተሳካ ሁኔታ ተስተካክሏል!',
      data: updatedRecord,
    }
  } catch (error: any) {
    console.error('Update research error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to update research proposal',
    })
  }
})
