import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("bookmarks", {
        userId: args.userId,
        postId: args.postId,
        createdAt: Date.now(),
      });
      return true;
    }
  },
});

export const getUserBookmarks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
      
    const postIds = bookmarks.map(b => b.postId);
    const posts = await Promise.all(postIds.map(id => ctx.db.get(id)));
    return posts.filter(p => p !== null);
  },
});
