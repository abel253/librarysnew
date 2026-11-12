// server/api/research/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const title = String(body.title || '').trim()
    const authorName = String(body.authorName || body.author || '').trim()
    const college = String(body.college || 'College of Informatics').trim()
    const department = String(body.department || 'Software Engineering').trim()
    const documentType = String(body.documentType || body.document_type || 'Proposal').trim()
    const filePath = body.filePath ? String(body.filePath).trim() : '/uploads/research/default.pdf'

    if (!title || !authorName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and Author are required for research proposal',
      })
    }

    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim()

    const newProposal = await prisma.research.create({
      data: {
        title,
        authorName,
        college,
        department,
        documentType,
        filePath,
        normalizedTitle,
      },
    })

    return {
      success: true,
      message: 'የምርምር ሰነዱ በተሳካ ሁኔታ ተመዝግቧል!',
      data: newProposal,
    }
  } catch (error: any) {
    console.error('Create research error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create research proposal',
    })
  }
})
