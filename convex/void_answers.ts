import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addVoidAnswer = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voidAnswers", {
      postId: args.postId,
      userId: args.userId,
      word: args.word,
      createdAt: Date.now(),
    });
  },
});

export const getVoidAnswers = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voidAnswers")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
  },
});
