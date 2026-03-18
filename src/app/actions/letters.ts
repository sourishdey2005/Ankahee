'use server'

import { db, letters } from '@/db'
import { eq, desc, and, gt } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createLetter(values: { content: string; authorId: string; imageUrl?: string }) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 72);

  const [newLetter] = await db.insert(letters).values({
    content: values.content,
    authorId: values.authorId,
    imageUrl: values.imageUrl,
    expiresAt,
  }).returning();

  revalidatePath('/letters');
  return newLetter;
}

export async function getLetters(authorId: string) {
  const now = new Date();
  return await db.select().from(letters).where(
    and(
      eq(letters.authorId, authorId),
      gt(letters.expiresAt, now)
    )
  ).orderBy(desc(letters.createdAt));
}
