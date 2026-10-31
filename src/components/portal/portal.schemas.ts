import { z } from 'zod'
export const pinSchema = z.string().regex(/^\d{6}$/)
export const groupNameSchema = z.string().trim().min(1).max(100)
export const messageSchema = z.string().trim().min(1).max(5000)
export const reportDescriptionSchema = z.string().trim().max(2000)
export const passwordSchema = z.string().min(8).max(128)
