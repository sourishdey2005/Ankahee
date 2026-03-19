'use server';

import { db, posts, letters, rooms, stories } from '@/db';
import { lte } from 'drizzle-orm';

/**
 * Permanently deletes all expired content from the database.
 * This should be called occasionally to keep the database light.
 */
export async function purgeExpiredAction() {
  const now = new Date();
  
  try {
    // 1. Delete expired posts
    await db.delete(posts).where(lte(posts.expiresAt, now));
    
    // 2. Delete expired letters 
    await db.delete(letters).where(lte(letters.expiresAt, now));
    
    // 3. Delete expired rooms
    // We wrap individual deletes in try/catch to prevent one table error from breaking everything
    try {
      await db.delete(rooms).where(lte(rooms.expiresAt, now));
    } catch (e) {
      console.warn("Could not purge rooms, table may not exist yet:", e);
    }

    // 4. Delete expired stories
    try {
      await db.delete(stories).where(lte(stories.expiresAt, now));
    } catch (e) {
      console.warn("Could not purge stories, table may not exist yet:", e);
    }
    
    return { success: true };
  } catch (err) {
    console.error('Purge error:', err);
    return { success: false, error: err };
  }
}

