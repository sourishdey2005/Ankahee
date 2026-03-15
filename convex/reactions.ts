import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleReaction = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(),
    reaction: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_post", (q) => 
        q.eq("authorId", args.authorId).eq("postId", args.postId)
      )
      .unique();

    if (existing) {
      if (existing.reaction === args.reaction) {
        await ctx.db.delete(existing._id);
        return null;
      } else {
        await ctx.db.patch(existing._id, { reaction: args.reaction });
        return existing._id;
      }
    }

    return await ctx.db.insert("reactions", {
      postId: args.postId,
      authorId: args.authorId,
      reaction: args.reaction,
      createdAt: Date.now(),
    });
  },
});

export const getReactions = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
  },
});
