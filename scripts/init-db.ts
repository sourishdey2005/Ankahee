import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Try to read .env.local manually to bypass process.env caching
  let urlFromEnv = '';
  let tokenFromEnv = '';
  try {
     const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
     const matchUrl = envLocal.match(/^TURSO_DATABASE_URL="?([^"\n\r]+)"?/m);
     if (matchUrl) urlFromEnv = matchUrl[1].trim();
     
     const matchToken = envLocal.match(/^TURSO_AUTH_TOKEN="?([^"\n\r]+)"?/m);
     if (matchToken) tokenFromEnv = matchToken[1].trim();
  } catch (e) {}

  const url = urlFromEnv || process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = tokenFromEnv || process.env.TURSO_AUTH_TOKEN;
  console.log(`Using database at: ${url}`);
  
  const client = createClient({ url, authToken });


  try {
    console.log('Verifying tables exist and fixing schema issues...');
    
    // Create all missing tables for the local instance
    await client.execute(`CREATE TABLE IF NOT EXISTS "users" ("id" text PRIMARY KEY NOT NULL, "username" text NOT NULL, "email" text NOT NULL, "password" text, "image_url" text, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "author_id" text, "mood" text, "image_url" text, "is_void_question" integer DEFAULT 0, "parent_id" integer, "expires_at" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "comments" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_id" integer NOT NULL, "author_id" text NOT NULL, "username" text NOT NULL, "content" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "reactions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_id" integer NOT NULL, "author_id" text NOT NULL, "reaction" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "polls" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_id" integer NOT NULL, "question" text NOT NULL, "options" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "poll_votes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "poll_id" integer NOT NULL, "user_id" text NOT NULL, "option_index" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "void_answers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_id" integer NOT NULL, "user_id" text NOT NULL, "word" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "bookmarks" ("user_id" text NOT NULL, "post_id" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL, PRIMARY KEY("user_id", "post_id"));`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "letters" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "author_id" text NOT NULL, "image_url" text, "expires_at" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "stories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" text NOT NULL, "author_id" text NOT NULL, "author_name" text NOT NULL, "image_url" text, "expires_at" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "rooms" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "created_by" text NOT NULL, "image_url" text, "is_dm" integer DEFAULT 0, "dm_key" text, "expires_at" integer NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "room_members" ("room_id" integer NOT NULL, "user_id" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL, PRIMARY KEY("room_id", "user_id"));`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "room_messages" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "room_id" integer NOT NULL, "author_id" text NOT NULL, "content" text NOT NULL, "created_at" integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL);`);


    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    process.exit(0);
  }
}

main();
