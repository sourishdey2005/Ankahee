import { db } from '../src/db';
import { posts } from '../src/db/schema';
import { lte } from 'drizzle-orm';

async function testDelete() {
    try {
        console.log('Testing delete with year 2026...');
        const now = 1774019430 * 1000; // ms
        const res = await db.delete(posts).where(lte(posts.expiresAt, new Date(now)));
        console.log('Delete Res:', res);
    } catch (e: any) {
        console.error('Delete FAILED with:', e.message);
    }
}

testDelete();
