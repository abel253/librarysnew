// server/api/items/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const title = String(body.title || '').trim()
    const author = String(body.author || '').trim()

    if (!title || !author) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and Author are required',
      })
    }

    const shelfType = (body.type === 'Closed Shelf' || String(body.shelfType || '').toUpperCase() === 'CLOSED') 
      ? 'CLOSED' 
      : 'OPEN'

    const quantity = Math.max(1, Number(body.copies ?? body.quantity ?? 1))
    const availableQuantity = Number(body.availableCopies ?? body.availableQuantity ?? quantity)

    const barcode = body.barcode?.trim() || `MAU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`

    const newItem = await prisma.item.create({
      data: {
        title,
        author,
        isbn: body.isbn ? String(body.isbn).trim() : null,
        callNumber: body.callNumber || body.call_number ? String(body.callNumber || body.call_number).trim() : null,
        publisher: body.publisher ? String(body.publisher).trim() : null,
        publicationYear: body.publicationYear || body.publication_year ? Number(body.publicationYear || body.publication_year) : null,
        edition: body.edition ? String(body.edition).trim() : null,
        shelfNumber: body.shelfNumber || body.shelf_number ? String(body.shelfNumber || body.shelf_number).trim() : null,
        subShelfNumber: body.subShelfNumber || body.sub_shelf_number ? String(body.subShelfNumber || body.sub_shelf_number).trim() : 'N/A',
        subjectCategory: body.category || body.subjectCategory || body.subject_category || 'Computer Science',
        location: body.location ? String(body.location).trim() : 'Main Campus Library',
        barcode,
        quantity,
        availableQuantity,
        shelfType,
        status: 'AVAILABLE',
      },
    })

    return {
      success: true,
      item: newItem,
      message: 'Book successfully created',
    }
  } catch (error: any) {
    console.error('Create item error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create item',
    })
  }
})
