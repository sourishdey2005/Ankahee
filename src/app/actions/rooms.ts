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
  await db.insert(roomMembers).values({
    roomId,
    userId,
  }).onConflictDoNothing();
  revalidatePath(`/rooms/${roomId}`);
}

export async function getRoomMessages(roomId: number) {
  return await db.select().from(roomMessages).where(
    eq(roomMessages.roomId, roomId)
  ).orderBy(desc(roomMessages.id));
}

export async function sendRoomMessage(roomId: number, authorId: string, content: string) {
  const [msg] = await db.insert(roomMessages).values({
    roomId,
    authorId,
    content,
  }).returning();
  revalidatePath(`/rooms/${roomId}`);
  return msg;
}

export async function getRoomById(id: number) {
  if (isNaN(id)) return null;
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
  return room || null;
}


export async function getRoomMembers(roomId: number) {
  return await db.select().from(roomMembers).where(eq(roomMembers.roomId, roomId));
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
