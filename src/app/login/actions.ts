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

  // Supabase sends a confirmation email. To make development easier, you might
  // want to disable "Confirm email" in your project's auth settings.
  revalidatePath('/', 'layout')

  // Don't auto-redirect. Let user know to check their email.
  return { error: null }
}
