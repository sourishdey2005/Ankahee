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

export async function getRooms() {
  const now = new Date();
  return await db.select().from(rooms).where(
    gt(rooms.expiresAt, now)
  ).orderBy(desc(rooms.createdAt));
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
  ).orderBy(desc(roomMessages.createdAt));
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
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
  return room || null;
}

export async function getRoomMembers(roomId: number) {
  return await db.select().from(roomMembers).where(eq(roomMembers.roomId, roomId));
}
