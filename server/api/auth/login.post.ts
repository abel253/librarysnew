// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const identifier = String(body.identifier || body.email || '').trim()
    const password = String(body.password || '').trim()

    if (!identifier || !password) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Student ID/Email and password are required',
      })
    }

    // Find user by either email OR userId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { userId: identifier },
        ],
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'ተጠቃሚው አልተገኘም (User not found) — please check your ID/Email or register first',
      })
    }

    if (!user.passwordHash) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is not set for this account. Please reset your password.',
      })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'የተሳሳተ የይለፍ ቃል (Incorrect password). Please check and try again.',
      })
    }

    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      userType: user.userType,
      department: user.department || 'General',
    }

    const token = generateToken(tokenPayload)

    // Set HTTP-only cookie for secure JWT session
    setCookie(event, 'auth_token', token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    })

    return {
      success: true,
      message: 'በተሳካ ሁኔታ ገብተዋል! (Login successful)',
      data: {
        token,
        user: {
          userId: user.userId,
          id: user.userId,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.userType,
          department: user.department || 'General',
          status: user.status,
        },
      },
    }
  } catch (error: any) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Login failed',
    })
  }
})
