import { db } from '../src/db';
import { posts } from '../src/db/schema';

async function inspect() {
  try {
    const list = await db.select().from(posts).limit(5);
    console.log('Sample data:', list.map(item => ({ id: item.id, expiresAt: item.expiresAt })));
  } catch (err) {
    console.error('Inspect failed:', err);
  }
}

inspect();
