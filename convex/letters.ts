import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createLetter = mutation({
  args: {
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const letterId = await ctx.db.insert("letters", {
      content: args.content,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
    return letterId;
  },
});

export const getLetters = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("letters")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);
  },
});
