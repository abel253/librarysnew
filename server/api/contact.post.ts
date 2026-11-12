// server/api/contact.post.ts
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form data is empty',
      });
    }

    const { name, email, phone, studentId, category, message } = body;

    // 1. መረጃዎች መሞላታቸውን ማረጋገጥ
    if (!name || !email || !message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please provide Name, Email, and Message.',
      });
    }

    // 2. Email ትክክል መሆኑን ማረጋገጥ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please provide a valid email address.',
      });
    }

    const categoryLabel = category === 'digital' ? 'E-Library & Digital' :
                          category === 'other' ? 'General Question' :
                          'Book Inquiry';

    // 3. ወደ ዳታቤዝ በ AuditLog ማስቀመጥ (ለላይብረሪያኑ በቀጥታ እንዲደርስ)
    let matchedUserId: string | null = null;
    if (studentId) {
      const trimmed = String(studentId).trim();
      try {
        const userExists = await prisma.user.findUnique({
          where: { userId: trimmed },
          select: { userId: true }
        });
        if (userExists) {
          matchedUserId = userExists.userId;
        }
      } catch (e) {
        matchedUserId = null;
      }
    }

    const inquiry = await prisma.auditLog.create({
      data: {
        action: 'CONTACT_INQUIRY',
        tableName: 'contact_inquiries',
        userId: matchedUserId,
        newData: {
          name: String(name).trim(),
          email: String(email).trim(),
          phone: phone ? String(phone).trim() : '',
          studentId: studentId ? String(studentId).trim() : '',
          category: categoryLabel,
          message: String(message).trim(),
          status: 'UNREAD',
          submittedAt: new Date().toISOString()
        }
      }
    });

    // 4. Console audit
    console.log('-------------------------------------------');
    console.log(`📬 NEW INQUIRY #${inquiry.logId} DELIVERED TO LIBRARIAN:`);
    console.log({
      ID: inquiry.logId,
      Category: categoryLabel,
      Name: name,
      Email: email,
      StudentID: studentId || 'N/A',
      Time: new Date().toLocaleString()
    });
    console.log('-------------------------------------------');

    // 5. የተሳካ ምላሽ መመለስ
    return {
      success: true,
      message: 'ጥያቄዎ በቀጥታ ለላይብረሪያኑ ደርሷል! (Your inquiry has been delivered directly to the Librarian Circulation Desk!)',
      data: {
        id: inquiry.logId,
        name,
        category: categoryLabel,
        status: 'UNREAD'
      }
    };

  } catch (err: any) {
    console.error('Contact Handler Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
    });
  }
});
