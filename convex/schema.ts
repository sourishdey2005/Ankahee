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
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"])
    .index("by_parentId", ["parentId"])
    .index("by_authorId", ["authorId"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    username: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  reactions: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    reaction: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"])
    .index("by_user_post", ["authorId", "postId"]),

  polls: defineTable({
    postId: v.id("posts"),
    question: v.string(),
    options: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  pollVotes: defineTable({
    pollId: v.id("polls"),
    userId: v.string(),
    optionIndex: v.number(),
    createdAt: v.number(),
  }).index("by_poll", ["pollId"])
    .index("by_user_poll", ["userId", "pollId"]),

  voidAnswers: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
    word: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  bookmarks: defineTable({
    userId: v.string(),
    postId: v.id("posts"),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_post", ["userId", "postId"]),

  letters: defineTable({
    content: v.string(),
    authorId: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_createdAt", ["createdAt"]),

  rooms: defineTable({
    name: v.string(),
    createdBy: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    isDM: v.boolean(),
    dmKey: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"])
    .index("by_dmKey", ["dmKey"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_user", ["roomId", "userId"]),

  roomMessages: defineTable({
    roomId: v.id("rooms"),
    authorId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),
});
