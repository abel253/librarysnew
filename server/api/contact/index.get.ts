// server/api/contact/index.get.ts
export default defineEventHandler(async () => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: 'CONTACT_INQUIRY' },
          { tableName: 'contact_inquiries' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    const inquiries = logs.map((l: any) => {
      const data = (typeof l.newData === 'object' && l.newData !== null) ? l.newData : {};
      return {
        id: l.logId,
        name: data.name || 'Patron / Student',
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        studentId: data.studentId || l.userId || 'N/A',
        category: data.category || 'General Question',
        message: data.message || '',
        status: data.status || 'UNREAD', // UNREAD | RESOLVED
        createdAt: l.createdAt
      };
    });

    return {
      success: true,
      data: inquiries
    };
  } catch (err: any) {
    console.error('Fetch contact inquiries error:', err);
    return {
      success: true,
      data: []
    };
  }
});
