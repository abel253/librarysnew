// server/api/research/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const q = String(query.q || '').trim()
    const college = String(query.college || '').trim()

    const where: any = {}

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { college: { contains: q } },
        { department: { contains: q } },
        { authorName: { contains: q } }
      ]
    }

    if (college && college !== 'All') {
      where.college = college
    }

    const researchList = await prisma.research.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return {
      success: true,
      data: researchList
    }
  } catch (err: any) {
    console.error('Research fetch error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve research collection'
    })
  }
})