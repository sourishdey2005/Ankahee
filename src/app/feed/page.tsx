import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ConfessionsList from './ConfessionsList'
import { MoodTag, MoodTags, moodColors } from '@/lib/mood-tags'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const revalidate = 0

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { mood?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { mood } = searchParams

  const { data: { session }} = await supabase.auth.getSession()

  // Although layout handles this, it's good practice to check here too
  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Authenticating...</p>
      </div>
    )
  }

  let query = supabase
    .from('posts')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  
  if (mood && (MoodTags as readonly string[]).includes(mood)) {
    query = query.eq('mood', mood)
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
  }
  
  const initialPosts: Tables<'posts'>[] = posts || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
       <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold mb-4">The Void</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by mood:</span>
          <Link href="/feed">
            <Badge
              variant={!mood ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors"
            >
              All
            </Badge>
          </Link>
          {MoodTags.map((tag) => (
            <Link href={`/feed?mood=${encodeURIComponent(tag)}`} key={tag}>
              <Badge
                variant="outline"
                className={cn(
                  'cursor-pointer transition-colors',
                  mood === tag
                    ? `${moodColors[tag as MoodTag]} border-primary/60 ring-1 ring-primary/60`
                    : 'hover:bg-accent/50'
                )}
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
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
