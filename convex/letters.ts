import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createLetter = mutation({
  args: {
    content: v.string(),
    authorId: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;

    return await ctx.db.insert("letters", {
      content: args.content,
      authorId: args.authorId,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      expiresAt: expiresAt,
      createdAt: now,
    });
  },
});

export const getLetters = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("letters")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .order("desc")
      .collect();
  },
});
