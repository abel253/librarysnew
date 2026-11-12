// server/api/items/index.get.ts
export default defineEventHandler(async () => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { borrowTransactions: true }
        }
      }
    })

    return items.map((item) => ({
      id: item.itemId,
      itemId: item.itemId,
      item_id: item.itemId,
      title: item.title,
      author: item.author || 'Unknown Author',
      isbn: item.isbn || '',
      callNumber: item.callNumber || '',
      call_number: item.callNumber || '',
      publisher: item.publisher || '',
      publicationYear: item.publicationYear || null,
      publication_year: item.publicationYear || null,
      edition: item.edition || '',
      shelfNumber: item.shelfNumber || '',
      shelf_number: item.shelfNumber || '',
      subShelfNumber: item.subShelfNumber || '',
      sub_shelf_number: item.subShelfNumber || '',
      category: item.subjectCategory || 'General',
      subjectCategory: item.subjectCategory || 'General',
      subject_category: item.subjectCategory || 'General',
      location: item.location || '',
      barcode: item.barcode || '',
      copies: item.quantity ?? 1,
      quantity: item.quantity ?? 1,
      availableCopies: item.availableQuantity ?? 1,
      availableQuantity: item.availableQuantity ?? 1,
      available_copies: item.availableQuantity ?? 1,
      available_quantity: item.availableQuantity ?? 1,
      shelfType: item.shelfType || 'OPEN',
      shelf_type: item.shelfType || 'OPEN',
      type: item.shelfType === 'CLOSED' ? 'Closed Shelf' : 'Open Shelf',
      status: item.status || 'AVAILABLE',
      borrowCount: item._count?.borrowTransactions ?? 0,
      createdAt: item.createdAt,
    }))
  } catch (error: any) {
    console.error('Fetch items error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch items',
    })
  }
})
