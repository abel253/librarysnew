// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email?: string
  name?: string
  userType?: string
  department?: string
  [key: string]: any
}

export function generateToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret || process.env.JWT_SECRET || 'mau-library-super-secret-key-2025'
  const expiresIn = config.jwtExpiresIn || process.env.JWT_EXPIRES_IN || '7d'

  return jwt.sign(payload, secret, {
    expiresIn,
  } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret || process.env.JWT_SECRET || 'mau-library-super-secret-key-2025'
    return jwt.verify(token, secret) as TokenPayload
  } catch {
    return null
  }
}
