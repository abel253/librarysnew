// server/api/users/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const q = query.q ? String(query.q).trim() : ''
    const role = query.role ? String(query.role).trim() : ''

    const where: any = {}
    if (role && role !== 'All') {
      where.userType = { equals: role }
    }
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { userId: { contains: q } },
        { email: { contains: q } },
        { department: { contains: q } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        userId: true,
        name: true,
        email: true,
        userType: true,
        department: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        borrowTransactions: {
          where: { status: 'ISSUED' },
          select: { transactionId: true, fineAmount: true }
        },
        _count: {
          select: {
            borrowTransactions: true,
            reservations: true,
          },
        },
      },
      take: 100,
    })

    return users.map((u) => {
      const activeLoansCount = u.borrowTransactions ? u.borrowTransactions.length : 0
      const totalFine = (u.borrowTransactions || []).reduce((acc, curr) => acc + Number(curr.fineAmount || 0), 0)
      return {
        id: u.userId,
        userId: u.userId,
        name: u.name,
        email: u.email,
        userType: u.userType || 'Student',
        department: u.department || 'General',
        status: u.status || 'ABLE_TO_BORROW',
        emailVerified: u.emailVerified,
        activeLoansCount,
        totalFine,
        totalBorrows: u._count.borrowTransactions,
        totalReservations: u._count.reservations,
        createdAt: u.createdAt,
      }
    })
  } catch (error: any) {
    console.error('Fetch users error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch users',
    })
  }
})
