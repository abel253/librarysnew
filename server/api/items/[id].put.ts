// server/api/items/[id].put.ts
export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid item ID is required' })
    }

    const body = await readBody(event)
    const existing = await prisma.item.findUnique({ where: { itemId: id } })
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Book not found' })
    }

    const shelfType = body.type !== undefined
      ? (body.type === 'Closed Shelf' || String(body.shelfType || '').toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN')
      : (body.shelfType ? (String(body.shelfType).toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN') : existing.shelfType)

    const quantity = (body.copies !== undefined || body.quantity !== undefined)
      ? Math.max(1, Number(body.copies ?? body.quantity))
      : existing.quantity

    const availableQuantity = (body.availableCopies !== undefined || body.availableQuantity !== undefined)
      ? Number(body.availableCopies ?? body.availableQuantity)
      : (quantity && existing.quantity ? Math.max(0, (existing.availableQuantity ?? 0) + (quantity - existing.quantity)) : existing.availableQuantity)

    const updatedItem = await prisma.item.update({
      where: { itemId: id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        author: body.author !== undefined ? String(body.author).trim() : existing.author,
        isbn: body.isbn !== undefined ? (body.isbn ? String(body.isbn).trim() : null) : existing.isbn,
        callNumber: (body.callNumber !== undefined || body.call_number !== undefined)
          ? String(body.callNumber || body.call_number || '').trim() || null
          : existing.callNumber,
        publisher: body.publisher !== undefined ? String(body.publisher).trim() || null : existing.publisher,
        publicationYear: (body.publicationYear !== undefined || body.publication_year !== undefined)
          ? (body.publicationYear || body.publication_year ? Number(body.publicationYear || body.publication_year) : null)
          : existing.publicationYear,
        edition: body.edition !== undefined ? String(body.edition).trim() || null : existing.edition,
        shelfNumber: (body.shelfNumber !== undefined || body.shelf_number !== undefined)
          ? String(body.shelfNumber || body.shelf_number || '').trim() || null
          : existing.shelfNumber,
        subShelfNumber: (body.subShelfNumber !== undefined || body.sub_shelf_number !== undefined)
          ? String(body.subShelfNumber || body.sub_shelf_number || '').trim() || 'N/A'
          : existing.subShelfNumber,
        subjectCategory: (body.category !== undefined || body.subjectCategory !== undefined || body.subject_category !== undefined)
          ? String(body.category || body.subjectCategory || body.subject_category || 'Computer Science').trim()
          : existing.subjectCategory,
        location: body.location !== undefined ? String(body.location).trim() || null : existing.location,
        quantity,
        availableQuantity,
        shelfType,
        status: body.status ? body.status : existing.status,
      },
    })

    return {
      success: true,
      item: updatedItem,
      message: 'Book updated successfully',
    }
  } catch (error: any) {
    console.error('Update item error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to update item',
    })
  }
})
