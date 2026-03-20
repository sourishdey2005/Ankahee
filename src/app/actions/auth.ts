'use server'

import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { hashSync, compareSync } from 'bcrypt-ts'

export async function signInAction(values: { email: string; password?: string }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);

    if (!user) {
      throw new Error('User not found. Please sign up.');
    }

    if (!values.password) {
      throw new Error('Password is required.');
    }

    // Secure password check
    const isMatched = compareSync(values.password, user.password || '');
    if (!isMatched) {
      // In a real app, we'd want to avoid leaking if the user exists but the password is wrong
      // but the above check for !user already leaks it. Let's keep it simple for now as requested.
      throw new Error('Invalid credentials.');
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, user: { id: user.id, username: user.username, email: user.email, imageUrl: user.imageUrl } };
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

    // Hash the password before storing
    const hashedPassword = hashSync(values.password, 10);

    const [user] = await db.insert(users).values({
      id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      email: values.email,
      username: values.email.split('@')[0],
      password: hashedPassword,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.email}`,
    }).returning();

    // Log them in immediately after signup
    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, user: { id: user.id, username: user.username, email: user.email, imageUrl: user.imageUrl } };
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

    const hashedPassword = hashSync(values.newPassword, 10);

    await db.update(users).set({ 
      password: hashedPassword 
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    throw err;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('ankahee_session')?.value;
    
    if (!sessionId) return null;

    const [user] = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    };
  } catch (err) {
    console.error('Get Session User Error:', err);
    return null;
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('ankahee_session');
  return { success: true };
}
