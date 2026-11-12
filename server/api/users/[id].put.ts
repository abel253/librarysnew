// server/api/users/[id].put.ts
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = String(body.name).trim()
    if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase()
    if (body.userType !== undefined) updateData.userType = String(body.userType).trim()
    if (body.department !== undefined) updateData.department = String(body.department).trim()
    if (body.status !== undefined) updateData.status = String(body.status).trim()
    if (body.password && String(body.password).trim()) {
      updateData.passwordHash = await hashPassword(String(body.password).trim())
    }

    const updated = await prisma.user.update({
      where: { userId: id },
      data: updateData
    })

    return {
      success: true,
      message: `የተጠቃሚ መረጃ በተሳካ ሁኔታ ተሻሽሏል! (User updated successfully)`,
      user: updated
    }
  } catch (err: any) {
    console.error('Update user error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update user'
    })
  }
})
