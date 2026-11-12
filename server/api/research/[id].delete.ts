// server/api/research/[id].delete.ts
export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid research ID is required' })
    }

    await prisma.research.delete({
      where: { id },
    })

    return { success: true, message: 'Research proposal deleted successfully' }
  } catch (error: any) {
    console.error('Delete research error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to delete research proposal',
    })
  }
})
