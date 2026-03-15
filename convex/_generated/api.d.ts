/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookmarks from "../bookmarks.js";
import type * as comments from "../comments.js";
import type * as files from "../files.js";
import type * as letters from "../letters.js";
import type * as polls from "../polls.js";
import type * as posts from "../posts.js";
import type * as reactions from "../reactions.js";
import type * as room_queries from "../room_queries.js";
import type * as rooms from "../rooms.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";
import type * as void_answers from "../void_answers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookmarks: typeof bookmarks;
  comments: typeof comments;
  files: typeof files;
  letters: typeof letters;
  polls: typeof polls;
  posts: typeof posts;
  reactions: typeof reactions;
  room_queries: typeof room_queries;
  rooms: typeof rooms;
  stories: typeof stories;
  users: typeof users;
  void_answers: typeof void_answers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
