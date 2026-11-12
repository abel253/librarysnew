// server/api/requests/index.get.ts
export default defineEventHandler(async () => {
  try {
    const transactions = await prisma.borrowTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { userId: true, name: true, department: true } },
        item: { select: { itemId: true, title: true, isbn: true, shelfType: true, shelfNumber: true } },
      },
    })

    // Fetch related audit logs for guest info / loan details
    const txIds = transactions.map((t) => t.transactionId)
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        tableName: 'borrow_transactions',
        recordId: { in: txIds },
      },
    })

    const auditMap = new Map<number, any>()
    for (const log of auditLogs) {
      if (log.recordId && log.newData) {
        auditMap.set(log.recordId, log.newData)
      }
    }

    return transactions.map((tx) => {
      const extra = auditMap.get(tx.transactionId) || {}
      const isClosed = tx.item?.shelfType === 'CLOSED'
      const shelfTypeLabel = isClosed ? 'Closed Shelf' : 'Open Shelf'

      const issue = new Date(tx.issueDate)
      const due = new Date(tx.dueDate)
      const durationDays = extra.durationDays || Math.max(1, Math.round((due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24)))
      const loanType = extra.loanType || (durationDays <= 4 ? 'SHORT' : 'LONG')
      const borrowScope = extra.borrowScope || (durationDays <= 1 ? 'INSIDE' : 'OUTSIDE')

      return {
        id: tx.transactionId,
        studentName: tx.user?.name || extra.guestName || 'Patron / Guest',
        studentId: tx.user?.userId || extra.studentId || 'N/A',
        studentPhone: extra.guestPhone || '',
        itemId: tx.itemId,
        bookTitle: tx.item?.title || extra.itemTitle || 'Unknown Title',
        isbn: tx.item?.isbn || 'N/A',
        shelfType: shelfTypeLabel,
        isClosed,
        shelfNumber: tx.item?.shelfNumber || 'N/A',
        borrowScope, // 'INSIDE' | 'OUTSIDE'
        loanType, // 'SHORT' | 'LONG'
        durationDays,
        requestedAt: new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dueDate: due.toISOString().split('T')[0],
        status: String(tx.status).toLowerCase(),
      }
    })
  } catch (error: any) {
    console.error('Fetch requests error:', error)
    return []
  }
})
