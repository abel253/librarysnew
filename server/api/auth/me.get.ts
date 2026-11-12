// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    return {
      success: true,
      data: {
        user: {
          userId: user.userId,
          id: user.userId,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.userType,
          department: user.department || 'General',
          status: user.status,
          createdAt: user.createdAt,
        },
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.statusMessage || 'Unauthenticated session',
    })
  }
})
