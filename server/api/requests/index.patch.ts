// server/api/requests/index.patch.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = Number(body.id)
    const status = String(body.status).toUpperCase() // ISSUED | DENIED

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
    }

    const updated = await prisma.borrowTransaction.update({
      where: { transactionId: id },
      data: {
        status: status as any,
        issueDate: status === 'ISSUED' ? new Date() : undefined,
      },
    })

    return { success: true, updated }
  } catch (error: any) {
    console.error('Update request error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to update request',
    })
  }
})
