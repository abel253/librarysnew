// server/utils/researchValidator.ts
import crypto from 'node:crypto'

// 1. SHA-256 Hash መስሪያ (Exact identical file detection)
export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash('sha-256').update(buffer).digest('hex')
}

// 2. ርዕስን ማጽጃ
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 3. የርዕሶች ተመሳስሎ መለኪያ (Deduplication)
export function calculateTitleSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeText(str1)
  const norm2 = normalizeText(str2)

  if (norm1 === norm2) return 1.0

  const set1 = new Set(norm1.split(' ').filter((w) => w.length > 2))
  const set2 = new Set(norm2.split(' ').filter((w) => w.length > 2))

  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

// 4. የስላይድ (Landscape) ገጽታ መለያ ፈንክሽን (TypeScript-Safe)
function isLandscapeSlidePdf(buffer: Buffer): boolean {
  const header = buffer.subarray(0, 150000).toString('latin1')
  const mediaBoxMatch = header.match(/\/MediaBox\s*\[\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\]/i)
  
  if (
    mediaBoxMatch &&
    mediaBoxMatch[1] !== undefined &&
    mediaBoxMatch[2] !== undefined &&
    mediaBoxMatch[3] !== undefined &&
    mediaBoxMatch[4] !== undefined
  ) {
    const width = Math.abs(parseFloat(mediaBoxMatch[3]) - parseFloat(mediaBoxMatch[1]))
    const height = Math.abs(parseFloat(mediaBoxMatch[4]) - parseFloat(mediaBoxMatch[2]))
    if (width > height) {
      return true
    }
  }
  return false
}

// 5. የውሸት ስም (Keyboard Smash / Gibberish Name) መለያ
function isGibberishAuthor(name: string): boolean {
  const clean = name.trim().toLowerCase()
  if (clean.length < 3) return true
  if (!/[aeiouy]/.test(clean)) return true
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(clean)) return true
  return false
}

export interface AcademicValidationResult {
  isValid: boolean
  score: number
  reason?: string
}

// 6. ጥብቅ የአካዳሚክ እና የይዘት መመዘኛ
export function validateAcademicContent(
  fileBuffer: Buffer,
  fileName: string,
  userTitle: string,
  extraMetadata?: { documentType?: string; department?: string; college?: string; authorName?: string }
): AcademicValidationResult {
  const fileSizeKb = fileBuffer.length / 1024
  const lowerFileName = fileName.toLowerCase()
  const lowerTitle = userTitle.toLowerCase()
  const docType = (extraMetadata?.documentType || '').toLowerCase()
  const lowerDept = (extraMetadata?.department || '').toLowerCase()
  const author = (extraMetadata?.authorName || '').trim()

  // 1. የደራሲው ስም ትክክለኛ መሆኑን ማረጋገጥ
  if (author && isGibberishAuthor(author)) {
    return {
      isValid: false,
      score: 10,
      reason: 'ውድቅ ተደርጓል! እባክዎ ትክክለኛ የደራሲ/ተማሪ ስም ያስገቡ (የተዘበራረቁ ፊደላት ተቀባይነት የላቸውም)።'
    }
  }

  // 2. ባዶ ወይም በጣም አነስተኛ ሰነድ መከልከል
  if (fileSizeKb < 15) {
    return {
      isValid: false,
      score: 5,
      reason: 'የተሰቀለው ሰነድ በጣም አነስተኛ ወይም ባዶ ነው (ቢያንስ 15KB መሆን አለበት)።'
    }
  }

  // 3. የስላይድ አቀማመጥ መከልከል (Landscape / PowerPoint Presentation)
  if (lowerFileName.endsWith('.pdf') && isLandscapeSlidePdf(fileBuffer)) {
    return {
      isValid: false,
      score: 15,
      reason: 'ውድቅ ተደርጓል! የተሰቀለው ሰነድ የዝግጅት ስላይድ (Presentation Slides) ነው። የዩኒቨርሲቲው ጥናቶች በቁመት (A4 Portrait) መሆን አለባቸው።'
    }
  }

  // 4. የኮርስ ስላይዶችና የፈተና ጥያቄዎችን ማገድ
  const slideMarkers = [
    'lecture notes', 'lecture note', 'course syllabus', 'course outline',
    'tutorial sheet', 'slide', 'slides', 'powerpoint', 'midterm exam',
    'final exam', 'quiz questions'
  ]

  const contextText = `${lowerFileName} ${lowerTitle} ${docType} ${lowerDept}`
  for (const marker of slideMarkers) {
    if (contextText.includes(marker)) {
      return {
        isValid: false,
        score: 15,
        reason: 'ውድቅ ተደርጓል! የተሰቀለው ሰነድ የኮርስ ማስታወሻ ወይም ስላይድ (Lecture Note / Slide) እንጂ የጥናት ሰነድ አይደለም።'
      }
    }
  }

  // 5. ትክክለኛ የአካዳሚክ/የፕሮጀክት/የኢንተርንሺፕ መለያ ቃላት
  const validAcademicKeywords = [
    'internship', 'intern', 'project', 'thesis', 'report', 'proposal',
    'documentation', 'platform', 'system', 'study', 'design', 'development',
    'research', 'analysis', 'implementation', 'venue', 'management', 'portal',
    'guideline', 'guide'
  ]

  const hasValidAcademicKeyword = validAcademicKeywords.some(kw => contextText.includes(kw))

  if (!hasValidAcademicKeyword) {
    return {
      isValid: false,
      score: 25,
      reason: 'ውድቅ ተደርጓል! የሰነዱ ርዕስ የጥናት ወይም የፕሮጀክት ሰነድ መሆኑን የሚያረጋግጥ የተሟላ ርዕስ መሆን አለበት።'
    }
  }

  return {
    isValid: true,
    score: 95
  }
}