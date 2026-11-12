// server/api/users/index.post.ts
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = String(body.userId || body.id || '').trim()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || 'mau123456').trim()
    const userType = String(body.userType || 'Student').trim()
    const department = body.department ? String(body.department).trim() : 'Computer Science'
    const status = String(body.status || 'ABLE_TO_BORROW').trim()

    if (!userId || !name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID, Full Name, and Email are required',
      })
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ userId }, { email }],
      },
    })

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'ተጠቃሚው አስቀድሞ ተመዝግቧል (User with this ID or Email already exists)',
      })
    }

    const passwordHash = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        userId,
        name,
        email,
        passwordHash,
        userType,
        department,
        status,
        emailVerified: true,
      },
    })

    return {
      success: true,
      message: `ተጠቃሚ "${newUser.name}" በተሳካ ሁኔታ ተመዝግቧል!`,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        department: newUser.department,
        status: newUser.status,
      },
    }
  } catch (error: any) {
    console.error('Create user error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create user',
    })
  }
})
