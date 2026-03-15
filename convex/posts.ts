import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createPost = mutation({
  args: {
    content: v.string(),
    authorId: v.string(),
    mood: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    parentId: v.optional(v.string()),
    isVoidQuestion: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const postId = await ctx.db.insert("posts", {
      content: args.content,
      authorId: args.authorId,
      mood: args.mood,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      parentId: args.parentId,
      isVoidQuestion: args.isVoidQuestion,
      createdAt: Date.now(),
    });
    return postId;
  },
});

export const getPosts = query({
  args: { 
    mood: v.optional(v.string()),
    parentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q;
    
    if (args.parentId !== undefined) {
      q = ctx.db.query("posts").withIndex("by_parentId", (q) => q.eq("parentId", args.parentId));
    } else {
      q = ctx.db.query("posts").withIndex("by_createdAt");
    }

    const posts = await q.order("desc").take(50);
    
    if (args.mood) {
      return posts.filter(p => p.mood === args.mood);
    }
    
    return posts;
  },
});
