'use server'

import { db, comments, reactions, polls, pollVotes, voidAnswers, bookmarks } from '@/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function addComment(postId: number, authorId: string, username: string, content: string) {
  const [comment] = await db.insert(comments).values({
    postId,
    authorId,
    username,
    content,
  }).returning();
  revalidatePath(`/confession/${postId}`);
  revalidatePath('/feed');
  return comment;
}

export async function toggleReaction(postId: number, userId: string, reaction: string) {
  // Check if existing
  const existing = await db.select().from(reactions).where(
    and(
      eq(reactions.postId, postId),
      eq(reactions.authorId, userId),
      eq(reactions.reaction, reaction)
    )
  ).limit(1);

  if (existing.length > 0) {
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
  } else {
    await db.insert(reactions).values({
      postId,
      authorId: userId,
      reaction,
    });
  }
  revalidatePath(`/confession/${postId}`);
  revalidatePath('/feed');
}

export async function voteInPoll(pollId: number, userId: string, optionIndex: number, postId: number) {
  await db.insert(pollVotes).values({
    pollId,
    userId,
    optionIndex,
  });
  revalidatePath(`/confession/${postId}`);
  revalidatePath('/feed');
}

export async function submitVoidAnswer(postId: number, userId: string, word: string) {
  await db.insert(voidAnswers).values({
    postId,
    userId,
    word,
  });
  revalidatePath(`/confession/${postId}`);
  revalidatePath('/feed');
}

export async function toggleBookmark(postId: number, userId: string) {
  const existing = await db.select().from(bookmarks).where(
    and(
      eq(bookmarks.postId, postId),
      eq(bookmarks.userId, userId)
    )
  ).limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(
        and(
            eq(bookmarks.postId, postId),
            eq(bookmarks.userId, userId)
        )
    );
  } else {
    await db.insert(bookmarks).values({
      postId,
      userId,
    });
  }
  revalidatePath('/feed');
}
