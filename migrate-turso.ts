import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Starting manual migration to Turso with corrected schema...');
  
  const drops = [
    'DROP TABLE IF EXISTS bookmarks',
    'DROP TABLE IF EXISTS void_answers',
    'DROP TABLE IF EXISTS poll_votes',
    'DROP TABLE IF EXISTS polls',
    'DROP TABLE IF EXISTS reactions',
    'DROP TABLE IF EXISTS comments',
    'DROP TABLE IF EXISTS posts',
    'DROP TABLE IF EXISTS users',
    'DROP TABLE IF EXISTS letters',
    'DROP TABLE IF EXISTS rooms',
    'DROP TABLE IF EXISTS room_members',
    'DROP TABLE IF EXISTS room_messages',
    'DROP TABLE IF EXISTS stories'
  ];

  const creates = [
    `CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      image_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )`,
    `CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      mood TEXT,
      image_url TEXT,
      is_void_question INTEGER DEFAULT 0,
      parent_id INTEGER,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (parent_id) REFERENCES posts(id)
    )`,
    `CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`,
    `CREATE TABLE reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_id TEXT NOT NULL,
      reaction TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`,
    `CREATE TABLE polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`,
     `CREATE TABLE poll_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (poll_id) REFERENCES polls(id)
    )`,
    `CREATE TABLE void_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      word TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`,
    `CREATE TABLE bookmarks (
      user_id TEXT NOT NULL,
      post_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`,
    `CREATE TABLE letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      image_url TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )`,
    `CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      image_url TEXT,
      is_dm INTEGER DEFAULT 0,
      dm_key TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )`,
    `CREATE TABLE room_members (
      room_id INTEGER NOT NULL,
      userId TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      PRIMARY KEY (room_id, userId),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )`,
    `CREATE TABLE room_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )`,
    `CREATE TABLE stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      image_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )`
  ];

  for (const query of drops) {
    try {
      await client.execute(query);
      console.log('Dropped:', query);
    } catch (err) {
      console.warn('Drop failed (expected if table missing):', query);
    }
  }

  for (const query of creates) {
    try {
      await client.execute(query);
      console.log('Created:', query.substring(0, 50) + '...');
    } catch (err) {
      console.error('Create failed:', query.substring(0, 50), err);
    }
  }
  console.log('Migration complete!');
}

migrate();
