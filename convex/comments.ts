import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(),
    username: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      username: args.username,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
