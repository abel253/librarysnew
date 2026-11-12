// server/api/loans/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const itemId = Number(body.itemId)
    const userId = body.userId ? String(body.userId).trim() : null
    const loanType = String(body.loanType || 'LONG').toUpperCase() // SHORT | LONG
    
    // Duration in days: Short borrow default 3 days, Long borrow default 14 days
    let durationDays = Number(body.durationDays)
    if (!durationDays || isNaN(durationDays)) {
      durationDays = loanType === 'SHORT' ? 3 : 14
    }

    if (!itemId || isNaN(itemId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid Book Item is required' })
    }

    // መጽሐፉን መፈለግና ቅጂ መኖሩን ማረጋገጥ
    const item = await prisma.item.findUnique({
      where: { itemId },
    })

    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Book not found' })
    }

    if ((item.availableQuantity ?? 0) <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'ይቅርታ! ይህ መጽሐፍ በሙሉ ተወስዷል (No copies available right now)' })
    }

    // ተጠቃሚውን ማረጋገጥ (userId ካለ)
    let finalUserId: string | null = null
    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: userId },
            { name: { contains: userId } },
          ],
        },
      })
      if (user) {
        finalUserId = user.userId
      } else {
        // Find any user or leave null
        const firstUser = await prisma.user.findFirst()
        finalUserId = firstUser ? firstUser.userId : null
      }
    } else {
      const firstUser = await prisma.user.findFirst()
      finalUserId = firstUser ? firstUser.userId : null
    }

    const issueDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + durationDays)

    // የውሰት ውል መፍጠር እና የመጽሐፉን ብዛት መቀነስ በ Transaction
    const [tx, updatedItem] = await prisma.$transaction([
      prisma.borrowTransaction.create({
        data: {
          userId: finalUserId,
          itemId,
          issueDate,
          dueDate,
          status: 'ISSUED',
          fineAmount: 0,
        },
      }),
      prisma.item.update({
        where: { itemId },
        data: {
          availableQuantity: { decrement: 1 },
          status: item.availableQuantity && item.availableQuantity <= 1 ? 'BORROWED' : item.status,
        },
      }),
    ])

    return {
      success: true,
      message: `መጽሐፉ ለ ${durationDays} ቀናት በ ${loanType === 'SHORT' ? 'አጭር ጊዜ ውሰት (Short Loan)' : 'ረጅም ጊዜ ውሰት (Long Loan)'} በተሳካ ሁኔታ ተሰጥቷል!`,
      transaction: tx,
    }
  } catch (error: any) {
    console.error('Issue loan error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to issue loan',
    })
  }
})
