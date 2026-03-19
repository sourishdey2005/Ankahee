import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Try to read .env.local manually to bypass process.env caching
  let urlFromEnv = '';
  try {
     const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
     const match = envLocal.match(/^TURSO_DATABASE_URL="?([^"\n\r]+)"?/m);
     if (match) urlFromEnv = match[1].trim();
  } catch (e) {}


  const url = urlFromEnv || process.env.TURSO_DATABASE_URL || 'file:local.db';
  console.log(`Using database at: ${url}`);
  
  const client = createClient({ url });

  try {
    console.log('Verifying tables exist and fixing schema issues...');
    
    // Create stories table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "stories" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "text" text NOT NULL,
        "author_id" text NOT NULL,
        "author_name" text NOT NULL,
        "image_url" text,
        "expires_at" integer NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL
      );
    `);
    
    // Create rooms table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "created_by" text NOT NULL,
        "image_url" text,
        "is_dm" integer DEFAULT 0,
        "dm_key" text,
        "expires_at" integer NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL
      );
    `);

    // Create room_members table (crucial for room visibility)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "room_members" (
        "room_id" integer NOT NULL,
        "user_id" text NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
        PRIMARY KEY("room_id", "user_id")
      );
    `);

    // Create room_messages table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "room_messages" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "room_id" integer NOT NULL,
        "author_id" text NOT NULL,
        "content" text NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL
      );
    `);

    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    process.exit(0);
  }
}

main();
