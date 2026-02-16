import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const MAX_TITLE_LENGTH = 500
const MAX_ENCRYPTED_CONTENT_LENGTH = 1_048_576 // ~1 MB
const MAX_IV_LENGTH = 24 // base64 of 12 bytes = 16 chars, allow headroom
const MAX_TOTAL_SHARES = 20

export const createDocument = mutation({
  args: {
    title: v.string(),
    encryptedContent: v.string(),
    iv: v.string(),
    totalShares: v.number(),
    threshold: v.number(),
  },
  handler: async (ctx, args) => {
    // Title validation
    if (args.title.length === 0 || args.title.length > MAX_TITLE_LENGTH) {
      throw new Error(
        `Title must be between 1 and ${MAX_TITLE_LENGTH} characters`,
      )
    }

    // Encrypted content validation
    if (args.encryptedContent.length === 0) {
      throw new Error('Encrypted content cannot be empty')
    }
    if (args.encryptedContent.length > MAX_ENCRYPTED_CONTENT_LENGTH) {
      throw new Error('Encrypted content exceeds maximum size')
    }

    // IV validation
    if (args.iv.length === 0 || args.iv.length > MAX_IV_LENGTH) {
      throw new Error('Invalid IV length')
    }

    // Share configuration validation
    if (
      !Number.isInteger(args.threshold) ||
      !Number.isInteger(args.totalShares)
    ) {
      throw new Error('Share counts must be integers')
    }
    if (args.threshold < 2) {
      throw new Error('Threshold must be at least 2')
    }
    if (args.totalShares < args.threshold) {
      throw new Error('Total shares must be >= threshold')
    }
    if (args.totalShares > MAX_TOTAL_SHARES) {
      throw new Error(`Total shares must not exceed ${MAX_TOTAL_SHARES}`)
    }

    return await ctx.db.insert('documents', {
      title: args.title,
      encryptedContent: args.encryptedContent,
      iv: args.iv,
      totalShares: args.totalShares,
      threshold: args.threshold,
      createdAt: Date.now(),
    })
  },
})

/**
 * Get a document by its ID (returns metadata + ciphertext).
 */
export const get = query({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
