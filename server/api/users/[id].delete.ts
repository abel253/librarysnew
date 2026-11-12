// server/api/users/[id].delete.ts
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    const user = await prisma.user.findUnique({
      where: { userId: id }
    })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Cascade delete relations: borrow transactions, reservations, etc.
    await prisma.$transaction(async (tx) => {
      // 1. Delete overdue items for user's transactions
      const userTransactions = await tx.borrowTransaction.findMany({
        where: { userId: id },
        select: { transactionId: true }
      })
      const txIds = userTransactions.map(t => t.transactionId)
      if (txIds.length > 0) {
        await tx.overdueItem.deleteMany({
          where: { transactionId: { in: txIds } }
        })
      }

      // 2. Delete borrow transactions
      await tx.borrowTransaction.deleteMany({
        where: { userId: id }
      })

      // 3. Delete reservations
      await tx.reservation.deleteMany({
        where: { userId: id }
      })

      // 4. Delete user
      await tx.user.delete({
        where: { userId: id }
      })
    })

    return {
      success: true,
      message: `ተጠቃሚው (${user.name}) በተሳካ ሁኔታ ተሰርዟል! (User deleted successfully)`
    }
  } catch (err: any) {
    console.error('Delete user error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to delete user'
    })
  }
})
