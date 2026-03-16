import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createRoom = mutation({
  args: {
    name: v.string(),
    isDM: v.boolean(),
    dmKey: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    let imageUrl;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId);
    }
    const now = Date.now();
    const expiresAt = now + 48 * 60 * 60 * 1000; // Rooms last 48h? Or matching Supabase

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      createdBy: userId,
      isDM: args.isDM,
      dmKey: args.dmKey,
      imageUrl: imageUrl ?? undefined,
      storageId: args.storageId,
      expiresAt: expiresAt,
      createdAt: now,
    });

    await ctx.db.insert("roomMembers", {
      roomId,
      userId: userId,
      createdAt: now,
    });

    return roomId;
  },
});

export const getRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const memberRooms = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const roomIds = memberRooms.map(m => m.roomId);
    const rooms = await Promise.all(roomIds.map(id => ctx.db.get(id)));
    
    return rooms.filter(r => r !== null && r.expiresAt > Date.now());
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      authorId: userId,
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
    userB: v.string(),
  },
  handler: async (ctx, args) => {
    const userA = await getAuthUserId(ctx);
    if (userA === null) {
      throw new Error("Not authenticated");
    }
    const dmKey = [userA, args.userB].sort().join("_");
    
    const existing = await ctx.db
      .query("rooms")
      .withIndex("by_dmKey", (q) => q.eq("dmKey", dmKey))
      .unique();
    
    if (existing) return existing._id;
    
    const roomId = await ctx.db.insert("rooms", {
      name: `DM_${dmKey}`,
      createdBy: userA,
      isDM: true,
      dmKey: dmKey,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // DM lasts 30 days
      createdAt: Date.now(),
    });
    
    await ctx.db.insert("roomMembers", {
      roomId,
      userId: userA,
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

export const getRoomMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();
    if (existing) return;
    await ctx.db.insert("roomMembers", {
      roomId: args.roomId,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getRoomById = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    try {
      const room = await ctx.db.get(args.id);
      return room;
    } catch (e) {
      return null;
    }
  },
});
