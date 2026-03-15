import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createStory = mutation({
  args: {
    text: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const storyId = await ctx.db.insert("stories", {
      text: args.text,
      authorId: args.authorId,
      authorName: args.authorName,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
    return storyId;
  },
});

export const getStories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);
  },
});
