import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

if (process.env.NODE_ENV === 'development') {
  console.log('Using DB:', process.env.TURSO_DATABASE_URL ? 'Turso Remote' : 'Local SQLite');
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from './schema';
