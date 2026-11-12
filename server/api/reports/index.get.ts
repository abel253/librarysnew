// server/api/reports/index.get.ts
export default defineEventHandler(async () => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalBooks,
      totalCopiesAgg,
      totalBorrowsAllTime,
      activeLoansCount,
      returnedLoansCount,
      overdueLoans,
      totalStudents,
      totalFaculty,
      totalResearch,
      categoryDistributionRaw,
      shelfTypeDistributionRaw,
      recentLoansRaw,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.aggregate({
        _sum: { quantity: true, availableQuantity: true }
      }),
      prisma.borrowTransaction.count(),
      prisma.borrowTransaction.count({ where: { status: 'ISSUED' } }),
      prisma.borrowTransaction.count({ where: { status: 'RETURNED' } }),
      prisma.borrowTransaction.findMany({
        where: {
          status: 'ISSUED',
          dueDate: { lt: now }
        },
        include: {
          user: { select: { userId: true, name: true, department: true } },
          item: { select: { itemId: true, title: true } }
        }
      }),
      prisma.user.count({ where: { userType: 'Student' } }),
      prisma.user.count({ where: { userType: 'Faculty' } }),
      prisma.research.count(),
      prisma.item.groupBy({
        by: ['subjectCategory'],
        _count: { itemId: true }
      }),
      prisma.item.groupBy({
        by: ['shelfType'],
        _count: { itemId: true }
      }),
      prisma.borrowTransaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, userId: true } },
          item: { select: { title: true } }
        }
      })
    ])

    // Total Fines calculated
    let totalFineAmount = 0
    const overdueDetails = overdueLoans.map((tx) => {
      const due = new Date(tx.dueDate)
      const daysOverdue = Math.max(1, Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
      const diffDays = Math.round((due.getTime() - new Date(tx.issueDate).getTime()) / (1000 * 60 * 60 * 24))
      const isShort = diffDays <= 4
      const rate = isShort ? 2.0 : 1.0
      const fine = daysOverdue * rate
      totalFineAmount += fine
      return {
        transactionId: tx.transactionId,
        studentName: tx.user?.name || 'Unknown',
        studentId: tx.user?.userId || 'N/A',
        bookTitle: tx.item?.title || 'Unknown',
        dueDate: tx.dueDate.toISOString().split('T')[0],
        daysOverdue,
        fine
      }
    })

    // Category breakdown
    const categoryBreakdown = categoryDistributionRaw.map((c) => ({
      name: c.subjectCategory || 'General Collection',
      count: c._count.itemId,
      percentage: totalBooks > 0 ? Math.round((c._count.itemId / totalBooks) * 100) : 0
    }))

    // Shelf breakdown
    const shelfBreakdown = shelfTypeDistributionRaw.map((s) => ({
      type: s.shelfType === 'CLOSED' ? 'Closed Shelf (የተዘጋ)' : 'Open Shelf (ክፍት)',
      count: s._count.itemId,
      percentage: totalBooks > 0 ? Math.round((s._count.itemId / totalBooks) * 100) : 0
    }))

    // Circulation Rate (Turnover rate)
    const totalCopies = totalCopiesAgg._sum.quantity || totalBooks || 1
    const availableCopies = totalCopiesAgg._sum.availableQuantity || 0
    const borrowedCopies = Math.max(0, totalCopies - availableCopies)
    const utilizationRate = Math.min(100, Math.round((borrowedCopies / totalCopies) * 100))

    return {
      success: true,
      data: {
        generatedAt: now.toISOString(),
        summary: {
          totalBooks,
          totalCopies,
          availableCopies,
          borrowedCopies,
          utilizationRate,
          totalBorrowsAllTime,
          activeLoansCount,
          returnedLoansCount,
          overdueCount: overdueLoans.length,
          totalFineAmount,
          totalStudents,
          totalFaculty,
          totalResearch,
          returnComplianceRate: (activeLoansCount + returnedLoansCount) > 0 
            ? Math.round((returnedLoansCount / (activeLoansCount + returnedLoansCount)) * 100) 
            : 100
        },
        overdueDetails,
        categoryBreakdown,
        shelfBreakdown,
        recentLoans: recentLoansRaw.map((l) => ({
          id: l.transactionId,
          borrower: l.user?.name || 'Walk-in',
          book: l.item?.title || 'Unknown',
          date: l.issueDate.toISOString().split('T')[0],
          status: l.status
        }))
      }
    }
  } catch (err: any) {
    console.error('Fetch reports error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to generate report'
    })
  }
})
