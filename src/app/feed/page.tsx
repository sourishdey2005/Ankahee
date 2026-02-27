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
import { stopwords } from '@/lib/stopwords'
import CommunityWordCloud from '@/components/CommunityWordCloud'

export const revalidate = 0

type PostWithCounts = Tables<'posts'> & {
  comments: { count: number }[]
  reactions: Tables<'reactions'>[]
  polls: (Tables<'polls'> & { poll_votes: Tables<'poll_votes'>[] })[]
  void_answers: Tables<'void_answers'>[]
  bookmarks: Tables<'bookmarks'>[]
}

const processPostsForWordCloud = (posts: PostWithCounts[]) => {
  if (!posts?.length) return []

  const allText = posts.map(p => p.content || '').join(' ')

  const words = allText
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)

  const wordFrequencies: Record<string, number> = {}

  for (const word of words) {
    if (word && word.length > 2 && !stopwords.includes(word)) {
      wordFrequencies[word] = (wordFrequencies[word] || 0) + 1
    }
  }

  return Object.entries(wordFrequencies)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50)
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string; sort?: string }>
}) {
  const resolvedParams = await searchParams
  const mood = resolvedParams?.mood
  const sort = resolvedParams?.sort

  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Session error:", sessionError)
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Authenticating...</p>
      </div>
    )
  }

  // 🔥 MAIN QUERY - Now only for word cloud
  let query = supabase
    .from('posts')
    .select(`content`)
    .gt('expires_at', new Date().toISOString())

  const { data, error } = await query

  if (error) {
    console.error('Supabase fetch error:', JSON.stringify(error, null, 2))
  }

  const postsForWordCloud: PostWithCounts[] = (data ?? []) as PostWithCounts[]
  const wordCloudData = processPostsForWordCloud(postsForWordCloud)

  // Daily Prompt Logic
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) *
      60 *
      1000
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const dayOfYear = getDayOfYear(new Date())
  const dailyPrompt =
    reflectionPrompts[dayOfYear % reflectionPrompts.length]

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-headline font-bold">
          The Void
        </h1>

        {wordCloudData.length > 0 && (
          <div className="pt-4">
            <CommunityWordCloud data={wordCloudData} />
          </div>
        )}

        <Link
          href={`/new?prompt=${encodeURIComponent(
            dailyPrompt
          )}`}
          className="block"
        >
          <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start gap-4">
              <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground/90">
                  Daily Prompt
                </p>
                <p className="text-muted-foreground">
                  {dailyPrompt}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* SORT */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Sort by:
          </span>

          <Link href={{ pathname: '/feed', query: { mood } }}>
            <Badge variant={!sort ? 'default' : 'secondary'}>
              Newest
            </Badge>
          </Link>

          <Link
            href={{
              pathname: '/feed',
              query: { mood, sort: 'popular' },
            }}
          >
            <Badge
              variant={
                sort === 'popular'
                  ? 'default'
                  : 'secondary'
              }
            >
              Popular
            </Badge>
          </Link>

          <Link
            href={{
              pathname: '/feed',
              query: { mood, sort: 'loved' },
            }}
          >
            <Badge
              variant={
                sort === 'loved'
                  ? 'default'
                  : 'secondary'
              }
              className="inline-flex items-center gap-1"
            >
              <Heart className="h-3 w-3" />
              Most Loved
            </Badge>
          </Link>
        </div>

        {/* MOOD FILTER */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Filter by mood:
          </span>

          <Link
            href={{
              pathname: '/feed',
              query: { sort },
            }}
          >
            <Badge
              variant={!mood ? 'default' : 'secondary'}
            >
              All
            </Badge>
          </Link>

          {MoodTags.map((tag) => (
            <Link
              href={{
                pathname: '/feed',
                query: { sort, mood: tag },
              }}
              key={tag}
            >
              <Badge
                variant="outline"
                className={cn(
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

      <ConfessionsList
        sort={sort}
      />

      <Link href="/new">
        <Button
          aria-label="New Confession"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="h-8 w-8" />
          <span className="sr-only">
            New Confession
          </span>
        </Button>
      </Link>
    </div>
  )
}
