// server/api/profile/index.put.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userId ? String(body.userId).trim() : null
    const name = body.name ? String(body.name).trim() : undefined
    const email = body.email ? String(body.email).trim() : undefined
    const department = body.department ? String(body.department).trim() : undefined
    const newPassword = body.newPassword ? String(body.newPassword).trim() : undefined

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // Check if user exists
    let existing = await prisma.user.findUnique({
      where: { userId }
    })

    if (!existing) {
      // Create user if not present
      existing = await prisma.user.create({
        data: {
          userId,
          name: name || 'User Profile',
          email: email || `${userId.toLowerCase()}@mau.edu.et`,
          passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
          userType: body.userType || 'Administrator',
          department: department || 'General'
        }
      })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (department) updateData.department = department
    if (newPassword && newPassword.length >= 6) {
      updateData.passwordHash = newPassword
    }

    const updated = await prisma.user.update({
      where: { userId },
      data: updateData
    })

    return {
      success: true,
      message: 'ፕሮፋይል በተሳካ ሁኔታ ተሻሽሏል! (Profile updated successfully)',
      data: {
        userId: updated.userId,
        name: updated.name,
        email: updated.email,
        department: updated.department,
        userType: updated.userType
      }
    }
  } catch (err: any) {
    console.error('Update profile error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update profile'
    })
  }
})
