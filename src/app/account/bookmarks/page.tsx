import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'
import { User } from '@supabase/supabase-js'

export const revalidate = 0

type PostWithDetails = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
  polls: (Tables<'polls'> & { poll_votes: Tables<'poll_votes'>[] })[]
  void_answers: Tables<'void_answers'>[]
  bookmarks: Array<Tables<'bookmarks'>>
}

export default async function BookmarksPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/feed')
  }

  const { data: bookmarkedPosts, error } = await supabase
    .from('posts')
    .select('*, comments(count), reactions(*), polls(*, poll_votes(*)), void_answers(*), bookmarks!inner(*)')
    .eq('bookmarks.user_id', session.user.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarked posts:', error)
  }

  const posts: PostWithDetails[] = (bookmarkedPosts as any) || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/feed" className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">My Bookmarks</h1>
          <p className="text-muted-foreground">A private list of your saved confessions. Bookmarks are removed when a post expires.</p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <ConfessionCard key={post.id} post={post} user={session.user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-lg bg-card/50">
            <h2 className="text-2xl font-headline mb-2">Nothing Bookmarked Yet</h2>
            <p className="text-muted-foreground">Use the bookmark icon on a confession to save it for later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
