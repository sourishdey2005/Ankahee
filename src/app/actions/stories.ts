'use server';

import { db, stories } from '@/db';
import { desc, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createStoryAction(data: {
  text: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  try {
    await db.insert(stories).values({
      text: data.text,
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      authorName: data.authorName,
      expiresAt,
    });

    revalidatePath('/story');
    return { success: true };
  } catch (error) {
    console.error('Failed to create story:', error);
    return { success: false, error: 'Failed to create story' };
  }
}

export async function getStoriesAction() {
  const now = new Date();
  
  try {
    const data = await db.query.stories.findMany({
      where: gt(stories.expiresAt, now),
      orderBy: [desc(stories.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return { success: false, data: [] };
  }
}
