'use server';

import { db, posts, letters, rooms, stories } from '@/db';
import { sql } from 'drizzle-orm';

/**
 * Permanently deletes all expired content from the database.
 * Higher reliability than standard delete when dealing with LibSQL timestamps.
 */
export async function purgeExpiredAction() {
  const nowMs = Date.now();
  
  try {
    const purgeActions = [
      { name: 'posts', table: posts, col: posts.expiresAt },
      { name: 'letters', table: letters, col: letters.expiresAt },
      { name: 'rooms', table: rooms, col: rooms.expiresAt },
      { name: 'stories', table: stories, col: stories.expiresAt },
    ];

    const results: any = {};

    for (const action of purgeActions) {
      try {
        // We use sql raw with params to ensure consistent timestamp format (MS since epoch as number)
        await db.run(sql`DELETE FROM ${action.table} WHERE ${action.col} <= ${nowMs}`);
        results[action.name] = true;
      } catch (e: any) {
        // Catch table non-existence or other SQL issues gracefully
        results[action.name] = false;
        console.warn(`[Purge Warning] Skipping ${action.name}:`, e.message);
      }
    }

    return { success: true, results };
  } catch (err: any) {
    console.error('[Purge Critical] Block failure:', err.message);
    return { success: false, error: err.message };
  }
}
