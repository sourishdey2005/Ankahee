'use server'

import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function signInAction(values: { email: string; password?: string }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);

    if (!user) {
      throw new Error('User not found. Please sign up.');
    }

    if (!values.password) {
      throw new Error('Password is required.');
    }

    if (user.password !== values.password) {
      throw new Error('Invalid credentials.');
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, user };
  } catch (err: any) {
    console.error('Sign In Error:', err);
    throw err;
  }
}

export async function signUpAction(values: { email: string; password?: string }) {
  try {
    const [existing] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);
    if (existing) {
      throw new Error('Email already registered. Please login.');
    }

    if (!values.password) {
      throw new Error('Password is required.');
    }

    const [user] = await db.insert(users).values({
      id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      email: values.email,
      username: values.email.split('@')[0],
      password: values.password,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.email}`,
    }).returning();

    // Log them in immediately after signup
    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, user };
  } catch (err: any) {
    console.error('Sign Up Error:', err);
    throw err;
  }
}

export async function resetPasswordAction(values: { email: string; newPassword?: string }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);
    if (!user) {
      throw new Error('No account found with that email.');
    }

    if (!values.newPassword) {
      throw new Error('New password is required.');
    }

    await db.update(users).set({ 
      password: values.newPassword 
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    throw err;
  }
}


export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('ankahee_session');
  return { success: true };
}
