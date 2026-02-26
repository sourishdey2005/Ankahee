'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: z.infer<typeof loginSchema>) {
  const supabase = await createClient()

  const validatedData = loginSchema.safeParse(formData)
  if (!validatedData.success) {
    return { error: 'Invalid data.' }
  }

  const { email, password } = validatedData.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signup(formData: z.infer<typeof signupSchema>) {
  const supabase = await createClient()

  const validatedData = signupSchema.safeParse(formData)
  if (!validatedData.success) {
    return { error: 'Invalid data.' }
  }

  const { email, password } = validatedData.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // On successful signup, Supabase will also sign the user in if email confirmation
  // is disabled in your project's auth settings. We then immediately redirect
  // them to the feed, skipping the email confirmation message.
  revalidatePath('/', 'layout')
  redirect('/feed')
}
