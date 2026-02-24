import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Lightbulb, Plus, Heart } from 'lucide-react'
import Link from 'next/link'
import ConfessionsList from './ConfessionsList'
import { MoodTag, MoodTags, moodColors } from '@/lib/mood-tags'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { reflectionPrompts } from '@/lib/prompts'
import { Card, CardContent } from '@/components/ui/card'

export const revalidate = 0

type PostWithCounts = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
  polls: (Tables<'polls'> & { poll_votes: Tables<'poll_votes'>[] })[]
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

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Authenticating...</p>
      </div>
    )
  }

  let query = supabase
    .from('posts')
    .select('*, comments(count), reactions(*), polls(*, poll_votes(*))')
    .gt('expires_at', new Date().toISOString())
  
  if (mood && (MoodTags as readonly string[]).includes(mood)) {
    query = query.eq('mood', mood)
  }

  if (sort === 'popular' || sort === 'loved') {
    // We will fetch all and sort on the client in ConfessionsList.
    // For more complex scenarios, a database function/view would be better.
     query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
  }
  
  const initialPosts: PostWithCounts[] = (posts as any) || [];

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };
  const dayOfYear = getDayOfYear(new Date());
  const dailyPrompt = reflectionPrompts[dayOfYear % reflectionPrompts.length];

  return (
    <div className="container mx-auto max-w-2xl py-8">
       <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-headline font-bold">The Void</h1>

        <Link href={`/new?prompt=${encodeURIComponent(dailyPrompt)}`} className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start gap-4">
              <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground/90">Daily Prompt</p>
                <p className="text-muted-foreground">{dailyPrompt}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

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
           <Link href={{ pathname: '/feed', query: { mood, sort: 'loved' } }}>
             <Badge
              variant={sort === 'loved' ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors inline-flex items-center gap-1"
            >
              <Heart className="h-3 w-3" />
              Most Loved
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
      <ConfessionsList serverPosts={initialPosts} sort={sort} />
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
