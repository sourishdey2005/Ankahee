'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { ConvexHttpClient } from "convex/browser"
import { api } from '../../../convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

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

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user && convex) {
    try {
      await convex.mutation(api.users.syncUser, {
        tokenIdentifier: session.user.id,
        name: session.user.email?.split('@')[0] || 'Anonymous',
        email: session.user.email,
      })
    } catch (err) {
      console.error("Failed to sync user to Convex:", err)
      // We don't throw here to allow the user to continue since they are logged in via Supabase
    }
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

  const { data: { session: newSession } } = await supabase.auth.getSession()
  if (newSession?.user && convex) {
    try {
      await convex.mutation(api.users.syncUser, {
        tokenIdentifier: newSession.user.id,
        name: newSession.user.email?.split('@')[0] || 'Anonymous',
        email: newSession.user.email,
      })
    } catch (err) {
      console.error("Failed to sync user to Convex:", err)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}
