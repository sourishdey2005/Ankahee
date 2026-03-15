import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createRoom = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(),
    isDM: v.boolean(),
    dmKey: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const now = Date.now();
    const expiresAt = now + 48 * 60 * 60 * 1000; // Rooms last 48h? Or matching Supabase

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      createdBy: args.createdBy,
      isDM: args.isDM,
      dmKey: args.dmKey,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      expiresAt: expiresAt,
      createdAt: now,
    });

    await ctx.db.insert("roomMembers", {
      roomId,
      userId: args.createdBy,
      createdAt: now,
    });

    return roomId;
  },
});

export const getRooms = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberRooms = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const roomIds = memberRooms.map(m => m.roomId);
    const rooms = await Promise.all(roomIds.map(id => ctx.db.get(id)));
    
    return rooms.filter(r => r !== null && r.expiresAt > Date.now());
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    authorId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      authorId: args.authorId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roomMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .collect();
  },
});
export const getOrCreateDM = mutation({
  args: {
    userA: v.string(),
    userB: v.string(),
  },
  handler: async (ctx, args) => {
    const dmKey = [args.userA, args.userB].sort().join("_");
    
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_dmKey", (q) => q.eq("dmKey", dmKey))
      .unique();
    
    if (existing) return existing._id;
    
    const roomId = await ctx.db.insert("rooms", {
      name: `DM_${dmKey}`,
      createdBy: args.userA,
      isDM: true,
      dmKey: dmKey,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // DM lasts 30 days
      createdAt: Date.now(),
    });
    
    await ctx.db.insert("roomMembers", {
      roomId,
      userId: args.userA,
      createdAt: Date.now(),
    });
    
    await ctx.db.insert("roomMembers", {
      roomId,
      userId: args.userB,
      createdAt: Date.now(),
    });
    
    return roomId;
  },
});
