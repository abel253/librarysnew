// server/api/loans/renew.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const transactionId = Number(body.transactionId || body.id)
    const additionalDays = Math.max(1, Number(body.additionalDays || 7))

    if (!transactionId || isNaN(transactionId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid transaction ID is required' })
    }

    const tx = await prisma.borrowTransaction.findUnique({
      where: { transactionId },
    })

    if (!tx) {
      throw createError({ statusCode: 404, statusMessage: 'Borrow transaction not found' })
    }

    if (tx.status === 'RETURNED') {
      throw createError({ statusCode: 400, statusMessage: 'የተመለሰን መጽሐፍ ጊዜ ማራዘም አይቻልም' })
    }

    const currentDue = new Date(tx.dueDate)
    const newDueDate = new Date(currentDue)
    newDueDate.setDate(newDueDate.getDate() + additionalDays)

    const updated = await prisma.borrowTransaction.update({
      where: { transactionId },
      data: {
        dueDate: newDueDate,
      },
    })

    return {
      success: true,
      message: `የመመለሻ ቀን ለተጨማሪ ${additionalDays} ቀናት ተራዝሟል (New Due: ${newDueDate.toISOString().split('T')[0]})`,
      transaction: updated,
    }
  } catch (error: any) {
    console.error('Renew loan error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to renew loan',
    })
  }
})
