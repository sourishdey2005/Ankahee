'use server'

import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { hashSync, compareSync } from 'bcrypt-ts'
import { v4 as uuidv4 } from 'uuid'

export async function signInAction(values: { email: string; password?: string }) {
  try {
    if (!values.email || !values.password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);

    if (!user) {
      return { success: false, error: 'Identity not found. Join the void first.' };
    }

    const isMatched = compareSync(values.password, user.password || '');
    if (!isMatched) {
      return { success: false, error: 'Visual pattern (password) does not match our records.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { 
      success: true, 
      user: { id: user.id, username: user.username, email: user.email, imageUrl: user.imageUrl } 
    };
  } catch (err: any) {
    console.error('Sign In Error:', err);
    return { success: false, error: 'The void is currently unstable. Try again soon.' };
  }
}

export async function signUpAction(values: { email: string; password?: string }) {
  try {
    if (!values.email || !values.password) {
      return { success: false, error: 'All fields are required to manifest in the void.' };
    }

    const [existing] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);
    if (existing) {
      return { success: false, error: 'This email is already linked to an identity. Login instead.' };
    }

    const hashedPassword = hashSync(values.password, 10);
    const userId = `u_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    const [user] = await db.insert(users).values({
      id: userId,
      email: values.email,
      username: values.email.split('@')[0],
      password: hashedPassword,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.email}`,
    }).returning();

    const finalUser = user || { id: userId, username: values.email.split('@')[0], email: values.email };

    const cookieStore = await cookies();
    cookieStore.set('ankahee_session', finalUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return { 
      success: true, 
      user: { id: finalUser.id, username: finalUser.username, email: finalUser.email } 
    };
  } catch (err: any) {
    console.error('Sign Up Error:', err);
    return { success: false, error: 'Manifestation failed. The void rejects this request currently.' };
  }
}

export async function resetPasswordAction(values: { email: string; newPassword?: string }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, values.email)).limit(1);
    if (!user) {
      return { success: false, error: 'No account found with that email.' };
    }

    if (!values.newPassword) {
      return { success: false, error: 'New password is required.' };
    }

    const hashedPassword = hashSync(values.newPassword, 10);

    await db.update(users).set({ 
      password: hashedPassword 
    }).where(eq(users.id, user.id));

    return { success: true };
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    return { success: false, error: 'Failed to reset. The void is holding onto the old key.' };
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
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ankahee_session');
    return { success: true };
  } catch (err) {
    console.error('Sign Out Error:', err);
    return { success: false };
  }
}
