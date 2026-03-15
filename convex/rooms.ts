import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createRoom = mutation({
  args: {
    name: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
    return roomId;
  },
});

export const getRooms = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);
  },
});
