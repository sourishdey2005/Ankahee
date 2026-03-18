'use server'

import { db, posts, polls } from '@/db'
import { revalidatePath } from 'next/cache'

export async function createPost(values: {
  content: string;
  mood?: string;
  imageUrl?: string;
  parentId?: number;
  isVoidQuestion?: boolean;
  pollOptionOne?: string;
  pollOptionTwo?: string;
  authorId: string;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 1. Insert the post
  const [newPost] = await db.insert(posts).values({
    content: values.content,
    mood: values.mood,
    imageUrl: values.imageUrl,
    authorId: values.authorId,
    parentId: values.parentId,
    isVoidQuestion: values.isVoidQuestion,
    expiresAt,
  }).returning();

  // 2. If it's a poll, insert the poll options
  if (values.pollOptionOne && values.pollOptionTwo) {
    await db.insert(polls).values({
      postId: newPost.id,
      question: values.content,
      options: JSON.stringify([values.pollOptionOne, values.pollOptionTwo]),
    });
  }

  revalidatePath('/feed');
  return newPost;
}
