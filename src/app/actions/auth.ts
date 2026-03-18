'use server'

import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function signInAction(values: { email: string; password?: string }) {
  try {
    // Simple mock/stub for now: find or create user in SQLite
    let [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);

    if (!user) {
      // Create new user for simplicity in this anonymous playground
      [user] = await db.insert(users).values({
        id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        email: values.email,
        username: values.email.split('@')[0],
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.email}`,
      }).returning();
    }

    // Set a session cookie (primitive)
    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, user };
  } catch (err: any) {
    console.error('SQLite Auth Error:', err);
    throw err;
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('ankahee_session');
  return { success: true };
}
