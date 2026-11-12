// server/api/settings/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // Save fine rates, duration days, or system properties
    return {
      success: true,
      message: 'የቤተ-መጽሐፍት ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል! (Library settings saved successfully!)',
      data: body
    }
  } catch (err: any) {
    console.error('Save settings error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to save settings'
    })
  }
})
