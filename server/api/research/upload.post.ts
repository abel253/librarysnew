// server/api/research/upload.post.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUserFromEvent } from '../../utils/auth'
import {
  computeFileHash,
  normalizeText,
  calculateTitleSimilarity,
  validateAcademicContent
} from '../../utils/researchValidator'

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)
    if (!form || form.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file or metadata provided' })
    }

    let title = ''
    let college = ''
    let department = ''
    let documentType = 'Research'
    let authorName = ''
    let fileBuffer: Buffer | null = null
    let fileName = ''
    let mimeType = ''

    // ፎርሙን መበተን
    for (const part of form) {
      if (part.name === 'title') title = part.data.toString().trim()
      else if (part.name === 'college') college = part.data.toString().trim()
      else if (part.name === 'department') department = part.data.toString().trim()
      else if (part.name === 'document_type') documentType = part.data.toString().trim()
      else if (part.name === 'author_name') authorName = part.data.toString().trim()
      else if (part.name === 'file' && part.filename) {
        fileBuffer = part.data
        fileName = part.filename
        mimeType = part.type || ''
      }
    }

    let authUser: any = null
    try {
      authUser = await getUserFromEvent(event)
    } catch {}

    if (authUser) {
      if (!authorName) authorName = authUser.name || 'University Researcher'
      if (!college && authUser.college) college = authUser.college
      if (!department && authUser.department) department = authUser.department
    }

    if (!title || !fileBuffer) {
      throw createError({ statusCode: 400, statusMessage: 'Title and document file are required!' })
    }

    // 1. የፋይል ዓይነት ማረጋገጫ (PDF, DOCX ብቻ)
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt']
    const fileExt = path.extname(fileName).toLowerCase()
    if (!allowedExtensions.includes(fileExt)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ያልተፈቀደ የፋይል አይነት! እባክዎ PDF ወይም Word (.docx) ብቻ ያስገቡ።'
      })
    }

    // 2. Exact Duplication Check (በ SHA-256 Hash አማካኝነት)
    const fileHash = computeFileHash(fileBuffer)
    const exactFileDuplicate = await prisma.research.findFirst({
      where: { fileHash }
    })

    if (exactFileDuplicate) {
      throw createError({
        statusCode: 409,
        statusMessage: `የተደገመ ፋይል! ይህ ሰነድ ቀደም ሲል "${exactFileDuplicate.title}" በሚል ርዕስ ተመዝግቧል።`
      })
    }

    // 3. Title Redundancy & Similarity Check (Fuzzy match)
    const normalizedNewTitle = normalizeText(title)
    const existingTitles = await prisma.research.findMany({
      select: { id: true, title: true, normalizedTitle: true }
    })

    for (const item of existingTitles) {
      const simScore = calculateTitleSimilarity(title, item.title)
      // ከ 75% በላይ የሚመሳሰል ከሆነ ውድቅ ይደረጋል
      if (simScore >= 0.75) {
        throw createError({
          statusCode: 409,
          statusMessage: `ተመሳሳይ ጥናት ተገኝቷል! ርዕስዎ ከዚህ ቀደም ከተመዘገበው "${item.title}" ጋር በ ${(simScore * 100).toFixed(0)}% ይመሳሰላል።`
        })
      }
    }

   // 4. Academic Validity Check (ደራሲውንም ጭምር ልከን እንፈትሻለን)
    const academicCheck = validateAcademicContent(fileBuffer, fileName, title, {
      documentType,
      department,
      college,
      authorName
    })

    if (!academicCheck.isValid) {
      throw createError({
        statusCode: 422,
        statusMessage: academicCheck.reason || 'ሰነዱ ትክክለኛ የጥናት ወይም የፕሮጀክት ይዘት የለውም!'
      })
    }

    // 5. ፋይሉን ማስቀመጥ (Save file to public/uploads/research)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'research')
    await fs.mkdir(uploadDir, { recursive: true })

    const safeFileName = `${Date.now()}-${normalizeText(title).slice(0, 30)}${fileExt}`
    const finalFilePath = path.join(uploadDir, safeFileName)
    await fs.writeFile(finalFilePath, fileBuffer)

    const publicUrl = `/uploads/research/${safeFileName}`

    // 6. ዳታቤዝ ላይ ማስመዝገብ (textSample ስህተት እንዳያመጣ ተስተካክሏል)
    const cleanSnippet = `${title} — ${documentType} submitted by ${authorName || 'University Researcher'} (${department}, ${college})`
    const estimatedWords = Math.max(100, Math.round(fileBuffer.length / 7))

    const newRecord = await prisma.research.create({
      data: {
        title,
        authorName: authorName || 'University Researcher',
        college: college || 'General Academic',
        department: department || 'General Science',
        documentType,
        filePath: publicUrl,
        fileHash,
        normalizedTitle: normalizedNewTitle,
        wordCount: estimatedWords,
        abstractSnippet: cleanSnippet
      }
    })

    return {
      success: true,
      message: 'ጥናትዎ በተሳካ ሁኔታ ተመርምሮ ተመዝግቧል!',
      data: newRecord,
      qualityScore: academicCheck.score
    }
  } catch (err: any) {
    console.error('Research submission error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal Server Processing Error'
    })
  }
})