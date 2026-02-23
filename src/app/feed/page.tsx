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

type PostWithCounts = Tables<'posts'> & {
  comments: Array<{ count: number }>
  likes: Array<{ count: number }>
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { mood?: string; sort?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { mood, sort } = searchParams

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
    .select('*, comments(count), likes(count)')
    .gt('expires_at', new Date().toISOString())
  
  if (mood && (MoodTags as readonly string[]).includes(mood)) {
    query = query.eq('mood', mood)
  }

  if (sort === 'popular') {
    query = query.order('count', { foreignTable: 'likes', ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
  }
  
  const initialPosts: PostWithCounts[] = (posts as any) || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
       <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-headline font-bold">The Void</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Sort by:</span>
          <Link href={{ pathname: '/feed', query: { mood } }}>
            <Badge
              variant={!sort ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors"
            >
              Newest
            </Badge>
          </Link>
          <Link href={{ pathname: '/feed', query: { mood, sort: 'popular' } }}>
             <Badge
              variant={sort === 'popular' ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors"
            >
              Popular
            </Badge>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by mood:</span>
          <Link href={{ pathname: '/feed', query: { sort } }}>
            <Badge
              variant={!mood ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors"
            >
              All
            </Badge>
          </Link>
          {MoodTags.map((tag) => (
            <Link href={{ pathname: '/feed', query: { sort, mood: tag } }} key={tag}>
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
