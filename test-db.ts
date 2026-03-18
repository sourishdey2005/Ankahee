import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function test() {
  try {
    const res = await client.execute('SELECT 1');
    console.log('Turso Connection Success:', res);
  } catch (err) {
    console.error('Turso Connection Failed:', err);
  }
}

test();
