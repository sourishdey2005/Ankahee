'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { add } from 'date-fns'
import { revalidatePath } from 'next/cache'

const PostSchema = z.object({
  content: z.string().min(10).max(500),
  mood: z.string().optional(),
  userId: z.string().uuid(),
})

export async function createPost(input: z.infer<typeof PostSchema>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || session.user.id !== input.userId) {
    return { error: { message: 'Unauthorized' } }
  }
  
  const parsed = PostSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  const expires_at = add(new Date(), { hours: 24 }).toISOString()

  const { data, error } = await supabase.from('posts').insert({
    content: parsed.data.content,
    mood: parsed.data.mood,
    user_id: parsed.data.userId,
    expires_at,
  }).select().single()

  if (error) {
    return { error }
  }

  revalidatePath('/feed');
  return { data }
}
