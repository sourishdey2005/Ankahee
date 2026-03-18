'use server';

import { db, posts, letters, rooms, roomMessages, comments, reactions, polls, pollVotes, bookmarks, voidAnswers } from '@/db';
import { lte } from 'drizzle-orm';

/**
 * Permanently deletes all expired content from the database.
 * This should be called occasionally to keep the database light.
 */
export async function purgeExpiredAction() {
  const now = new Date();
  
  try {
    // 1. Delete expired posts
    // Note: SQLite foreign keys with ON DELETE CASCADE will handle related data 
    // IF foreign keys are enabled. My migration script uses CASCADE.
    await db.delete(posts).where(lte(posts.expiresAt, now));
    
    // 2. Delete expired letters 
    await db.delete(letters).where(lte(letters.expiresAt, now));
    
    // 3. Delete expired rooms
    await db.delete(rooms).where(lte(rooms.expiresAt, now));
    
    // 4. Cleanup orphaned room messages (if needed)
    // Actually, CASCADE should handle this if defined correctly.
    
    return { success: true };
  } catch (err) {
    console.error('Purge error:', err);
    return { success: false, error: err };
  }
}
