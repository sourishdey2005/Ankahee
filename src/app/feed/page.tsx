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
import { db, posts } from '@/db'
import { eq, desc, and, gt } from 'drizzle-orm'

import { purgeExpiredAction } from '@/app/actions/purge'
export const revalidate = 60

const processPostsForWordCloud = (posts: any[]) => {
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
  // Purge expired items on every feed view (cached according to revalidate)
  await purgeExpiredAction();
  
  try {
    const resolvedParams = await searchParams
    const mood = resolvedParams?.mood
    const sort = resolvedParams?.sort

    // Fetch posts for word cloud from SQLite
    // Filter by mood if provided, and only get non-expired posts
    const now = new Date();
    const whereClause = mood 
      ? and(eq(posts.mood, mood), gt(posts.expiresAt, now))
      : gt(posts.expiresAt, now);

    const postsData = await db.query.posts.findMany({
      where: whereClause,
      with: {
        comments: true,
        reactions: true,
        polls: {
          with: {
            votes: true,
          }
        },
        bookmarks: true,
        voidAnswers: true,
      },
      orderBy: [desc(posts.createdAt)],
    });
    const wordCloudData = processPostsForWordCloud(postsData)

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-headline font-bold">The Void</h1>
            <div className="flex gap-2">
               <Link href="/account/bookmarks">
                 <Button variant="ghost" size="icon" className="rounded-full">
                   <Heart className="h-5 w-5" />
                 </Button>
               </Link>
            </div>
          </div>

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
          posts={postsData}
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
  } catch (error: any) {
    console.error("FeedPage Error:", error);
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">The Void is currently unreachable</h1>
        <p className="text-muted-foreground">Error Details: {error?.message || "Unknown error"}</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Back to Home</Button>
        </Link>
      </div>
    )
  }
}
