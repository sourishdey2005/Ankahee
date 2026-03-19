'use server'

import { db, rooms, roomMembers, roomMessages } from '@/db'
import { eq, desc, and, gt, or, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createRoom(values: {
  name: string;
  createdBy: string;
  imageUrl?: string;
  isDM?: boolean;
  dmKey?: string;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const [newRoom] = await db.insert(rooms).values({
    name: values.name,
    createdBy: values.createdBy,
    imageUrl: values.imageUrl,
    isDM: values.isDM,
    dmKey: values.dmKey,
    expiresAt,
  }).returning();

  // Add creator as member
  await db.insert(roomMembers).values({
    roomId: newRoom.id,
    userId: values.createdBy,
  });

  revalidatePath('/rooms');
  return newRoom;
}

export async function getRooms(userId?: string) {
  const now = new Date();

  // Fetch all rooms that haven't expired
  const allRooms = await db.select().from(rooms).where(
    gt(rooms.expiresAt, now)
  ).orderBy(desc(rooms.createdAt));

  if (!userId) {
    return allRooms.filter(r => !r.isDM);
  }

  // For signed-in users, show public rooms + DMs they are in
  const userRoomIds = (await db.select().from(roomMembers).where(eq(roomMembers.userId, userId))).map(m => m.roomId);

  return allRooms.filter(r => !r.isDM || userRoomIds.includes(r.id));
}

export async function joinRoom(roomId: number, userId: string) {
  if (!roomId || !userId) {
    throw new Error('Missing room ID or user ID');
  }

  try {
    await db.insert(roomMembers).values({
      roomId,
      userId,
    }).onConflictDoNothing();
    revalidatePath(`/rooms/${roomId}`);
    return { success: true };
  } catch (error) {
    console.error('Error joining room:', error);
    throw new Error('Failed to join room');
  }
}

export async function getRoomMessages(roomId: number) {
  if (!roomId || isNaN(roomId)) return [];
  try {
    const messages = await db.select().from(roomMessages).where(
      eq(roomMessages.roomId, roomId)
    ).orderBy(desc(roomMessages.id));

    // Serialize dates for Next.js
    return messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching room messages:', error);
    return [];
  }
}

export async function sendRoomMessage(roomId: number, authorId: string, content: string) {
  if (!roomId || !authorId || !content) {
    throw new Error('Missing required fields');
  }
  try {
    const [msg] = await db.insert(roomMessages).values({
      roomId,
      authorId,
      content,
    }).returning();
    revalidatePath(`/rooms/${roomId}`);
    return {
      ...msg,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
    };
  } catch (error) {
    console.error('Error sending room message:', error);
    throw new Error('Failed to send message');
  }
}

export async function getRoomById(id: number) {
  if (!id || isNaN(id)) return null;
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    if (!room) return null;

    // Ensure proper serialization for Next.js
    return {
      id: room.id,
      name: room.name,
      createdBy: room.createdBy,
      imageUrl: room.imageUrl,
      isDM: room.isDM,
      dmKey: room.dmKey,
      expiresAt: room.expiresAt instanceof Date ? room.expiresAt.toISOString() : room.expiresAt,
      createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt,
    };
  } catch (error) {
    console.error('Database Error in getRoomById:', error);
    return null;
  }
}



export async function getRoomMembers(roomId: number) {
  if (!roomId || isNaN(roomId)) return [];
  try {
    const members = await db.select().from(roomMembers).where(eq(roomMembers.roomId, roomId));
    return members.map(member => ({
      ...member,
      createdAt: member.createdAt instanceof Date ? member.createdAt.toISOString() : member.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching room members:', error);
    return [];
  }
}

export async function getOrCreateDMAction(userA: string, userB: string) {
  if (!userA || !userB) throw new Error('Missing user IDs');
  const dmKey = [userA, userB].sort().join(':');

  try {
    // 1. Check if existing DM room exists
    const [existing] = await db.select().from(rooms).where(
      and(eq(rooms.isDM, true), eq(rooms.dmKey, dmKey))
    ).limit(1);

    if (existing) {
      return { id: existing.id };
    }

    // 2. Create new DM room in a transaction
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12);

    const result = await db.transaction(async (tx) => {
      const [newRoom] = await tx.insert(rooms).values({
        name: `Private Chat`,
        createdBy: userA,
        isDM: true,
        dmKey,
        expiresAt,
      }).returning();

      await tx.insert(roomMembers).values([
        { roomId: newRoom.id, userId: userA },
        { roomId: newRoom.id, userId: userB },
      ]);

      return newRoom;
    });

    revalidatePath('/rooms');
    return { id: result.id };
  } catch (err: any) {
    console.error('Critical DM Action Error:', err);
    throw new Error(err.message || 'Failed to create private chat session.');
  }
}
