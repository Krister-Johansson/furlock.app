import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    encryptedContent: v.string(),
    iv: v.string(),
    totalShares: v.number(),
    threshold: v.number(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),
})
