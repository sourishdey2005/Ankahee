'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function deleteAccount() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return { error: 'Not authenticated. Please log in to delete your account.' }
  }

  const { user } = session

  // 1. Delete user's reactions
  const { error: reactionsError } = await supabase
    .from('reactions')
    .delete()
    .eq('user_id', user.id)

  if (reactionsError) {
    return { error: `Failed to delete your reactions: ${reactionsError.message}` }
  }

  // 2. Delete user's comments
  const { error: commentsError } = await supabase
    .from('comments')
    .delete()
    .eq('user_id', user.id)

  if (commentsError) {
    return { error: `Failed to delete your comments: ${commentsError.message}` }
  }

  // 3. Delete user's posts
  const { error: postsError } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', user.id)

  if (postsError) {
    return { error: `Failed to delete your posts: ${postsError.message}` }
  }

  // 4. Delete user's record from public.users table.
  // This is best-effort as RLS might prevent it, but the user's content is gone.
  const { error: userTableError } = await supabase
    .from('users')
    .delete()
    .eq('id', user.id)

  if (userTableError) {
    console.error('Could not delete from users table:', userTableError.message)
  }

  // 5. Sign the user out
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')

  // Let the client-side component handle redirection after refresh.
  return { error: null }
}
