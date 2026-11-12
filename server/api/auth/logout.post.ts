// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return {
    success: true,
    message: 'በተሳካ ሁኔታ ወጥተዋል (Logged out successfully)',
  }
})
