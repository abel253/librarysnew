// server/api/stats.get.ts
export default defineEventHandler(async () => {
  try {
    // 1. የዳሽቦርዱ ዋና ቆጠራዎች (ከእውነተኛው MySQL Database)
    const [
      totalBooks,
      totalStudents,
      totalBorrows,
      activeUsers,
      openShelfCount,
      closedShelfCount,
      pendingRequests,
      totalProposals
    ] = await Promise.all([
      prisma.item.count(),
      prisma.user.count({ where: { userType: 'Student' } }),
      prisma.borrowTransaction.count({ where: { status: 'ISSUED' } }),
      prisma.user.count({ where: { status: 'ABLE_TO_BORROW' } }),
      prisma.item.count({ where: { shelfType: 'OPEN' } }),
      prisma.item.count({ where: { shelfType: 'CLOSED' } }),
      prisma.borrowTransaction.count({ where: { status: 'REQUESTED' } }),
      prisma.research.count()
    ])

    // 2. በብዛት የተዋሱ 5 መጻሕፍት (Top Borrowed Books)
    const topItems = await prisma.item.findMany({
      take: 5,
      orderBy: {
        borrowTransactions: {
          _count: 'desc'
        }
      },
      select: {
        itemId: true,
        title: true,
        author: true,
        subjectCategory: true,
        _count: {
          select: { borrowTransactions: true }
        }
      }
    })

    // 3. የቅርብ ጊዜ እንቅስቃሴዎች (Recent Activities)
    const recentTx = await prisma.borrowTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        item: { select: { title: true } }
      }
    })

    return {
      success: true,
      data: {
        totalBooks,
        totalStudents,
        totalBorrows,
        activeUsers,
        openShelfCount,
        closedShelfCount,
        pendingRequests,
        totalProposals,
        openShelfPercentage: totalBooks > 0 ? Math.round((openShelfCount / totalBooks) * 100) : 0,
        closedShelfPercentage: totalBooks > 0 ? Math.round((closedShelfCount / totalBooks) * 100) : 0,
        topBooks: topItems.map((item) => ({
          id: item.itemId,
          title: item.title,
          author: item.author || 'Unknown',
          tag: (item.subjectCategory || 'CS').substring(0, 2).toUpperCase(),
          borrows: item._count.borrowTransactions
        })),
        recentActivities: recentTx.map((tx) => ({
          id: tx.transactionId,
          text: `${tx.user?.name || 'Student'} ${tx.status === 'ISSUED' ? 'borrowed' : tx.status.toLowerCase()} "${tx.item?.title || 'Book'}"`,
          time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: tx.status
        }))
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})