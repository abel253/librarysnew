// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '').trim()
    const passwordConfirm = body.password_confirmation ? String(body.password_confirmation).trim() : password
    const department = String(body.department || 'General').trim()
    const requestedType = String(body.userType || body.role || 'Student').trim().toLowerCase()
    // Public registration is restricted strictly to Student or Faculty.
    // Librarian and Administrator accounts can only be created by the Admin in the Admin Panel.
    const userType = requestedType === 'faculty' ? 'Faculty' : 'Student'
    
    // Custom or generated userId (Student ID / Staff ID)
    let userId = String(body.userId || body.studentId || '').trim()
    if (!userId) {
      userId = `STU-${Date.now().toString().slice(-6)}`
    }

    if (!name || !email || !password) {
      throw createError({
        statusCode: 422,
        statusMessage: 'ስም፣ ኢሜይል እና የይለፍ ቃል ያስፈልጋል (Name, email and password are required)',
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 422,
        statusMessage: 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters)',
      })
    }

    if (password !== passwordConfirm) {
      throw createError({
        statusCode: 422,
        statusMessage: 'የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match)',
      })
    }

    // Check if email or userId is already taken
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { userId },
        ],
      },
    })

    if (existing) {
      const isEmail = existing.email.toLowerCase() === email
      throw createError({
        statusCode: 409,
        statusMessage: isEmail
          ? 'ይህ ኢሜይል ቀደም ሲል ተመዝግቧል (Email is already registered. Please login)'
          : 'ይህ የተማሪ/ሰራተኛ መታወቂያ ቀደም ሲል ተመዝግቧል (User ID is already in use)',
      })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        userId,
        name,
        email,
        passwordHash,
        userType, // 'Student' | 'Faculty' | 'Librarian' | 'Administrator'
        department,
        status: 'ABLE_TO_BORROW',
        emailVerified: true,
      },
    })

    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      userType: user.userType,
      department: user.department || 'General',
    }

    const token = generateToken(tokenPayload)

    // Set cookie
    setCookie(event, 'auth_token', token, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })

    return {
      success: true,
      message: 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል! (Account created successfully)',
      data: {
        token,
        user: {
          userId: user.userId,
          id: user.userId,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.userType,
          department: user.department,
          status: user.status,
        },
      },
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Registration failed',
    })
  }
})
