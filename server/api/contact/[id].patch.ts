// server/api/contact/[id].patch.ts
export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, 'id');
    const id = Number(idParam);
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid inquiry ID is required' });
    }

    const body = await readBody(event);
    const status = String(body.status || 'RESOLVED').toUpperCase();

    const existing = await prisma.auditLog.findUnique({
      where: { logId: id }
    });

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Inquiry not found' });
    }

    const currentData = (typeof existing.newData === 'object' && existing.newData !== null) ? (existing.newData as any) : {};
    const updatedData = {
      ...currentData,
      status,
      resolvedAt: new Date().toISOString()
    };

    const updated = await prisma.auditLog.update({
      where: { logId: id },
      data: {
        newData: updatedData
      }
    });

    return {
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: updated
    };
  } catch (err: any) {
    console.error('Update inquiry error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update inquiry'
    });
  }
});
