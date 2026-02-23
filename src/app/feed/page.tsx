import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ConfessionsList from './ConfessionsList'

export const revalidate = 0

export default async function FeedPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { session }} = await supabase.auth.getSession()

  // Although layout handles this, it's good practice to check here too
  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Authenticating...</p>
      </div>
    )
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  }
  
  const initialPosts: Tables<'posts'>[] = posts || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <ConfessionsList serverPosts={initialPosts} />
      <Link href="/new">
        <Button
          aria-label="New Confession"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          <Plus className="h-8 w-8" />
          <span className="sr-only">New Confession</span>
        </Button>
      </Link>
    </div>
  )
}
