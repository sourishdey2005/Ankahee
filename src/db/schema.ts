import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// Posts table
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  authorId: text('author_id'), // Allow guest IDs too
  mood: text('mood'),
  imageUrl: text('image_url'),
  isVoidQuestion: integer('is_void_question', { mode: 'boolean' }).default(false),
  parentId: integer('parent_id'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
  polls: many(polls),
  bookmarks: many(bookmarks),
  voidAnswers: many(voidAnswers),
}));

// Comments table
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').notNull(),
  username: text('username').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

// Reactions table
export const reactions = sqliteTable('reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').notNull(),
  reaction: text('reaction').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
}));

// Polls table
export const polls = sqliteTable('polls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  options: text('options').notNull(), // JSON string array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const pollsRelations = relations(polls, ({ one, many }) => ({
  post: one(posts, {
    fields: [polls.postId],
    references: [posts.id],
  }),
  votes: many(pollVotes),
}));

// Poll Votes table
export const pollVotes = sqliteTable('poll_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').references(() => polls.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  optionIndex: integer('option_index').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
}));

// Void Answers table
export const voidAnswers = sqliteTable('void_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  word: text('word').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const voidAnswersRelations = relations(voidAnswers, ({ one }) => ({
  post: one(posts, {
    fields: [voidAnswers.postId],
    references: [posts.id],
  }),
}));

// Bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
  userId: text('user_id').notNull(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.postId] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id],
  }),
}));

// Letters table
export const letters = sqliteTable('letters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  authorId: text('author_id').notNull(),
  imageUrl: text('image_url'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Rooms table
export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdBy: text('created_by').notNull(),
  imageUrl: text('image_url'),
  isDM: integer('is_dm', { mode: 'boolean' }).default(false),
  dmKey: text('dm_key'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  members: many(roomMembers),
  messages: many(roomMessages),
}));

// Room Members table
export const roomMembers = sqliteTable('room_members', {
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] }),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
}));

// Room Messages table
export const roomMessages = sqliteTable('room_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const roomMessagesRelations = relations(roomMessages, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMessages.roomId],
    references: [rooms.id],
  }),
}));

// Stories table
export const stories = sqliteTable('stories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});
