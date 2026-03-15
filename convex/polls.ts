import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPoll = mutation({
  args: {
    postId: v.id("posts"),
    question: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("polls", {
      postId: args.postId,
      question: args.question,
      options: args.options,
      createdAt: Date.now(),
    });
  },
});

export const voteInPoll = mutation({
  args: {
    pollId: v.id("polls"),
    userId: v.string(),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pollVotes")
      .withIndex("by_user_poll", (q) => 
        q.eq("userId", args.userId).eq("pollId", args.pollId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { optionIndex: args.optionIndex });
    } else {
      await ctx.db.insert("pollVotes", {
        pollId: args.pollId,
        userId: args.userId,
        optionIndex: args.optionIndex,
        createdAt: Date.now(),
      });
    }
  },
});

export const getPollWithVotes = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();
    
    if (!poll) return null;
    
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
      .collect();

    return { ...poll, votes };
  },
});
