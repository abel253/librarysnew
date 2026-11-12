// server/api/items/[id].delete.ts
export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid item ID is required' })
    }

    const existing = await prisma.item.findUnique({ where: { itemId: id } })
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Book not found' })
    }

    await prisma.$transaction(async (tx) => {
      // Find all transactions associated with this item
      const transactions = await tx.borrowTransaction.findMany({
        where: { itemId: id },
        select: { transactionId: true },
      })
      const txIds = transactions.map((t) => t.transactionId)

      // 1. Delete overdue items associated with these transactions
      if (txIds.length > 0) {
        await tx.overdueItem.deleteMany({
          where: { transactionId: { in: txIds } },
        })
        // 2. Delete the borrow transactions
        await tx.borrowTransaction.deleteMany({
          where: { itemId: id },
        })
      }

      // 3. Delete reservations for this item
      await tx.reservation.deleteMany({
        where: { itemId: id },
      })

      // 4. Finally delete the item itself
      await tx.item.delete({
        where: { itemId: id },
      })
    })

    return {
      success: true,
      message: 'Book and associated records successfully deleted',
    }
  } catch (error: any) {
    console.error('Delete item error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to delete item',
    })
  }
})
