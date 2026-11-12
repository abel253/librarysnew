// server/api/profile/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const roleParam = (query.role as string)?.toLowerCase()

    let targetUser = null

    if (query.userId) {
      targetUser = await prisma.user.findUnique({
        where: { userId: String(query.userId) }
      })
    } else if (roleParam === 'librarian') {
      targetUser = await prisma.user.findFirst({
        where: { userType: 'Librarian' }
      })
    } else {
      // Default to Administrator
      targetUser = await prisma.user.findFirst({
        where: { userType: 'Administrator' }
      })
    }

    if (!targetUser) {
      // If none found, return fallback structure
      return {
        success: true,
        data: {
          userId: roleParam === 'librarian' ? 'LIB-001' : 'ADM-001',
          name: roleParam === 'librarian' ? 'Dr. Alemu Mengistu' : 'System Administrator',
          email: roleParam === 'librarian' ? 'alemu@mau.edu.et' : 'admin@mau.edu.et',
          userType: roleParam === 'librarian' ? 'Librarian' : 'Administrator',
          department: roleParam === 'librarian' ? 'Library Science & Archives' : 'ICT Directorate',
          status: 'ACTIVE',
          phone: '+251 911 234 567',
          avatarUrl: roleParam === 'librarian' 
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
        }
      }
    }

    return {
      success: true,
      data: {
        userId: targetUser.userId,
        name: targetUser.name,
        email: targetUser.email,
        userType: targetUser.userType,
        department: targetUser.department || 'Library & Information Science',
        status: targetUser.status,
        phone: '+251 911 234 567',
        avatarUrl: targetUser.userType === 'Librarian'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      }
    }
  } catch (err: any) {
    console.error('Fetch profile error:', err)
    return {
      success: false,
      message: err.message || 'Failed to fetch profile'
    }
  }
})
