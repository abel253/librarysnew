// server/api/requests/index.post.ts
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { itemId, guestName, guestPhone, loanType, durationDays, borrowScope, studentId } = body

  if (!itemId) {
    throw createError({ statusCode: 422, statusMessage: 'Item ID required' })
  }

  const item = await prisma.item.findUnique({
    where: { itemId: Number(itemId) },
  })

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  if ((item.availableQuantity ?? 0) <= 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'ይቅርታ! ይህ መጽሐፍ በሙሉ ተወስዷል (No copies available right now)',
    })
  }

  const isClosed = item.shelfType === 'CLOSED'
  const finalScope: 'INSIDE' | 'OUTSIDE' = borrowScope === 'INSIDE' ? 'INSIDE' : 'OUTSIDE'

  // Determine loan type and duration:
  // If reading Inside Library: 1 day (due today/tomorrow), 0 penalty on-time
  // If Outside Library:
  //   - Open Shelf: allows LONG (14-30 days) or SHORT (1-4 days)
  //   - Closed Shelf: allows SHORT (1-4 days) or LONG (14 days with approval)
  let finalLoanType: 'SHORT' | 'LONG' = String(loanType || (isClosed ? 'SHORT' : 'LONG')).toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG'
  let days = Number(durationDays)

  if (finalScope === 'INSIDE') {
    finalLoanType = 'SHORT'
    days = 1
  } else if (!days || isNaN(days)) {
    days = finalLoanType === 'SHORT' ? 3 : 14
  }

  // Try extracting authenticated user from JWT token
  let authUser: any = null
  try {
    authUser = await getUserFromEvent(event)
  } catch {}

  // Find user if studentId is provided or from auth
  let finalUserId: string | null = null
  const targetId = studentId || authUser?.userId

  if (targetId) {
    const matchedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: String(targetId).trim() },
          { email: String(targetId).trim() },
        ],
      },
    })
    if (matchedUser) {
      finalUserId = matchedUser.userId
    } else if (authUser?.userId) {
      finalUserId = authUser.userId
    }
  } else if (authUser?.userId) {
    finalUserId = authUser.userId
  }

  const patronName = guestName || authUser?.name || 'Patron'
  const patronPhone = guestPhone || authUser?.phone || null
  const patronId = studentId || authUser?.userId || null

  const issueDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + days)

  // Create request transaction
  const [tx] = await prisma.$transaction([
    prisma.borrowTransaction.create({
      data: {
        userId: finalUserId,
        itemId: Number(itemId),
        issueDate,
        dueDate,
        status: 'REQUESTED',
        fineAmount: 0,
      },
    }),
    prisma.item.update({
      where: { itemId: Number(itemId) },
      data: { availableQuantity: { decrement: 1 } },
    }),
  ])

  // Log in audit trail
  await prisma.auditLog.create({
    data: {
      userId: finalUserId,
      action: 'BOOK_REQUEST',
      tableName: 'borrow_transactions',
      recordId: tx.transactionId,
      newData: {
        guestName: patronName,
        studentId: patronId,
        guestPhone: patronPhone,
        itemId: Number(itemId),
        itemTitle: item.title,
        shelfType: item.shelfType,
        borrowScope: finalScope,
        loanType: finalLoanType,
        durationDays: days,
      },
    },
  })

  const penaltyRule = finalScope === 'INSIDE' 
    ? '🏛️ በቤተ-መጽሐፍት ውስጥ የሚነበብ (በዕለቱ ተመላሽ — No Fine on time)' 
    : (finalLoanType === 'SHORT' ? '⚡ አጭር ውሰት (ቅጣት: 2.00 ETB / ቀን)' : '📚 ረጅም ውሰት (ቅጣት: 1.00 ETB / ቀን)')

  return {
    success: true,
    message: `ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል! [${finalLoanType} LOAN — ${days} ቀናት | ${penaltyRule}] ላይብረሪያኑ ፈቅዶ ያዘጋጅልዎታል።`,
    data: {
      request_id: tx.transactionId,
      item_id: tx.itemId,
      item_title: item.title,
      shelf_type: item.shelfType,
      borrow_scope: finalScope,
      loan_type: finalLoanType,
      duration_days: days,
      due_date: dueDate.toISOString().split('T')[0],
      status: tx.status,
    },
  }
})
