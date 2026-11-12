// server/api/loans/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId ? String(query.userId).trim() : undefined
    const status = query.status ? String(query.status).toUpperCase().trim() : undefined

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (status) {
      where.status = status
    }

    const transactions = await prisma.borrowTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
            department: true,
            userType: true,
            status: true,
          },
        },
        item: {
          select: {
            itemId: true,
            title: true,
            author: true,
            isbn: true,
            callNumber: true,
            shelfNumber: true,
            subShelfNumber: true,
            shelfType: true,
            location: true,
            availableQuantity: true,
            quantity: true,
          },
        },
      },
    })

    const now = new Date()

    return transactions.map((tx) => {
      const issue = new Date(tx.issueDate)
      const due = new Date(tx.dueDate)
      const isReturned = tx.status === 'RETURNED'
      const returnDate = tx.returnDate ? new Date(tx.returnDate) : null

      // የውሰት ጊዜ ልዩነት በቀናት (Loan duration in days)
      const durationDays = Math.max(1, Math.round((due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24)))
      
      // Short-Term vs Long-Term borrow
      // አጭር ጊዜ ውሰት <= 4 ቀናት (Short loan is 1-4 days)
      const isShortLoan = durationDays <= 4
      const loanType: 'SHORT' | 'LONG' = isShortLoan ? 'SHORT' : 'LONG'

      // የቀነ-ቀጠሮ ማለፍ መለያ (Overdue calculation)
      const isOverdue = !isReturned && now.getTime() > due.getTime() && tx.status === 'ISSUED'
      const daysOverdue = isOverdue ? Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      // የቅጣት ሂሳብ (Short-term fines are 2 ETB/day, Long-term 1 ETB/day)
      const calculatedFine = isOverdue 
        ? Number(daysOverdue * (isShortLoan ? 2.0 : 1.0)) 
        : Number(tx.fineAmount || 0)

      const receiptNo = isReturned
        ? `RET-${(returnDate || due).getFullYear()}-${String(tx.transactionId).padStart(5, '0')}`
        : null

      return {
        id: tx.transactionId,
        transactionId: tx.transactionId,
        userId: tx.userId || 'GUEST',
        borrowerName: tx.user?.name || 'Walk-in / Guest Student',
        borrowerId: tx.user?.userId || 'N/A',
        department: tx.user?.department || 'General',
        userType: tx.user?.userType || 'Student',
        itemId: tx.itemId,
        bookTitle: tx.item?.title || 'Unknown Title',
        author: tx.item?.author || 'Unknown Author',
        isbn: tx.item?.isbn || '',
        shelfNumber: tx.item?.shelfNumber || 'N/A',
        subShelfNumber: tx.item?.subShelfNumber || 'N/A',
        shelfType: tx.item?.shelfType === 'CLOSED' ? 'Closed Shelf' : 'Open Shelf',
        issueDate: issue.toISOString().split('T')[0],
        dueDate: due.toISOString().split('T')[0],
        returnDate: returnDate ? returnDate.toISOString().split('T')[0] : null,
        status: tx.status, // REQUESTED | ISSUED | RETURNED | DENIED
        loanType, // SHORT | LONG
        durationDays,
        isOverdue,
        daysOverdue,
        fineAmount: calculatedFine,
        receiptNo,
        createdAt: tx.createdAt,
      }
    })
  } catch (error: any) {
    console.error('Fetch loans error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch loans and returns',
    })
  }
})
