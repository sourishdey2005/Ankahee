
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getRoomById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      // Check if it's a valid ID for our table
      const room = await ctx.db.get(args.id as any);
      return room;
    } catch (e) {
      return null;
    }
  },
});
