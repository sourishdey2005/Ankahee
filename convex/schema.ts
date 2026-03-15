import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stories: defineTable({
    text: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  
  posts: defineTable({
    content: v.string(),
    authorId: v.string(),
    mood: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    parentId: v.optional(v.string()), // For replies
    isVoidQuestion: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"])
    .index("by_parentId", ["parentId"]),

  letters: defineTable({
    content: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  rooms: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
});
