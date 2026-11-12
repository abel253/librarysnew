// server/api/items/search.get.ts

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const q = String(query.q || '').trim()
    const type = String(query.type || 'title').toLowerCase()
    const limit = Math.min(Number(query.limit) || 10000, 10000)

    const where: any = {}
    
    // የፍለጋ ቃል ካለ ብቻ where ውስጥ እንዲገባ
    if (q) {
      if (type === 'author') {
        where.author = { contains: q }
      } else if (type === 'isbn') {
        where.isbn = { contains: q }
      } else if (type === 'call_number') {
        where.callNumber = { contains: q }
      } else {
        where.title = { contains: q }
      }
    }

    // prisma በቀጥታ ከ server/utils/db.ts በ Nuxt auto-import ይገኛል
    const items = await prisma.item.findMany({
      where,
      take: limit,
      orderBy: { title: 'asc' },
    })

    // መረጃውን ወደ Client Format መመለስ
    return items.map((item: any) => ({
      item_id: item.itemId ?? item.item_id ?? item.id,
      title: item.title,
      author: item.author || 'Unknown Author',
      isbn: item.isbn,
      call_number: item.callNumber ?? item.call_number,
      publisher: item.publisher,
      publication_year: item.publicationYear ?? item.publication_year,
      edition: item.edition,
      shelf_number: item.shelfNumber ?? item.shelf_number,
      sub_shelf_number: item.subShelfNumber ?? item.sub_shelf_number,
      subject_category: item.subjectCategory ?? item.subject_category,
      location: item.location,
      barcode: item.barcode,
      quantity: item.quantity ?? 1,
      total_copies: item.quantity ?? item.total_copies ?? 1,
      available_copies: item.availableQuantity ?? item.available_quantity ?? 0,
      available_quantity: item.availableQuantity ?? item.available_quantity ?? 0,
      item_type: item.itemType ?? item.item_type,
      status: item.status,
      shelf_type: item.shelfType ?? item.shelf_type ?? 'OPEN',
      is_available:
        (item.availableQuantity ?? item.available_quantity ?? 0) > 0 &&
        item.status === 'AVAILABLE',
    }))
  } catch (err: any) {
    console.error('API Error in /api/items/search:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Database query failed',
    })
  }
})