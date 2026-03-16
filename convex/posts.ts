import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    content: v.string(),
    mood: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    parentId: v.optional(v.string()),
    isVoidQuestion: v.optional(v.boolean()),
    pollOptionOne: v.optional(v.string()),
    pollOptionTwo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authorId = await getAuthUserId(ctx);
    if (authorId === null) {
      throw new Error("Not authenticated");
    }
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from now

    const postId = await ctx.db.insert("posts", {
      content: args.content,
      authorId: authorId,
      mood: args.mood,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      parentId: args.parentId,
      isVoidQuestion: args.isVoidQuestion,
      expiresAt: expiresAt,
      createdAt: now,
    });

    if (args.pollOptionOne && args.pollOptionTwo) {
      await ctx.db.insert("polls", {
        postId,
        question: args.content,
        options: [args.pollOptionOne, args.pollOptionTwo],
        createdAt: now,
      });
    }

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
    
    // Filter out expired posts
    const activePosts = posts.filter(p => p.expiresAt > Date.now());

    // Enrich with nested data
    const enrichedPosts = await Promise.all(activePosts.map(async (post) => {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();
      const polls = await ctx.db
        .query("polls")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();
       const voidCounts = await ctx.db
        .query("voidAnswers")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();
      
      const enrichedPolls = await Promise.all(polls.map(async (poll) => {
        const pollVotes = await ctx.db
          .query("pollVotes")
          .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
          .collect();
        return { ...poll, pollVotes };
      }));

      return {
        ...post,
        reactions,
        polls: enrichedPolls,
        voidAnswers: voidCounts,
      };
    }));

    if (args.mood) {
      return enrichedPosts.filter(p => p.mood === args.mood);
    }
    
    return enrichedPosts;
  },
});

export const getPostById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;
    
    // Fetch associated data
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();
      
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();
      
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    const void_answers = await ctx.db
      .query("voidAnswers")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    // Fetch parent post if it exists
    let parentPost = null;
    if (post.parentId) {
      // For simplicity, we just get the post basics, or we could recurse
      parentPost = await ctx.db.get(post.parentId as any);
      if (parentPost) {
        // Enrich parent with reactions/polls too? 
        // For now let's just keep it simple to avoid massive payloads
      }
    }

    // Fetch replies (children)
    const childPostsRaw = await ctx.db
      .query("posts")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.id))
      .collect();

    // Enrich children with metadata
    const childPosts = await Promise.all(childPostsRaw.map(async (p) => {
        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_post", (q) => q.eq("postId", p._id))
            .collect();
        const polls = await ctx.db
            .query("polls")
            .withIndex("by_post", (q) => q.eq("postId", p._id))
            .collect();
        const enrichedPolls = await Promise.all(polls.map(async (poll) => {
            const pollVotes = await ctx.db
              .query("pollVotes")
              .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
              .collect();
            return { ...poll, pollVotes };
          }));
        return { ...p, reactions, polls: enrichedPolls };
    }));

    return {
      ...post,
      comments,
      reactions,
      polls: await Promise.all(polls.map(async (poll) => {
        const pollVotes = await ctx.db
          .query("pollVotes")
          .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
          .collect();
        return { ...poll, pollVotes };
      })),
      void_answers,
      parentPost,
      childPosts,
    };
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");
    
    await ctx.db.patch(args.id, { content: args.content });
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getArchivedPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .filter((q) => q.lt(q.field("expiresAt"), Date.now()))
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async (post) => {
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        return { ...post, reactions, comments };
      })
    );
  },
});

export const getBookmarkedPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const posts = await Promise.all(
      bookmarks.map(async (b) => {
        const post = await ctx.db.get(b.postId);
        if (!post || post.expiresAt < Date.now()) return null;

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const polls = await ctx.db
          .query("polls")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const enrichedPolls = await Promise.all(
            polls.map(async (poll) => {
                const votes = await ctx.db
                    .query("pollVotes")
                    .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
                    .collect();
                return { ...poll, poll_votes: votes };
            })
        );
        const voidAnswers = await ctx.db
          .query("voidAnswers")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return { 
            ...post, 
            reactions, 
            comments: comments.map(c => ({ count: 1 })), // Mocking for compatibility if needed
            commentCount: comments.length,
            polls: enrichedPolls,
            voidAnswers,
            isBookmarked: true
        };
      })
    );

    return posts.filter((p) => p !== null);
  },
});
