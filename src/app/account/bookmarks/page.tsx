import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConfessionCard from '@/components/ConfessionCard'
import { cookies } from 'next/headers'
import { db, bookmarks, posts } from '@/db'
import { eq, desc, and, gt, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('ankahee_session')?.value
  
  if (!userId) {
    redirect('/login')
  }
  
  // Fetch bookmarked posts via SQLite
  const userBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  const postIds = userBookmarks.map(b => b.postId);
  
  let bookmarkedPosts: any[] = [];
  if (postIds.length > 0) {
    const now = new Date();
    bookmarkedPosts = await db.query.posts.findMany({
      where: and(inArray(posts.id, postIds), gt(posts.expiresAt, now)),
      with: {
        comments: true,
        reactions: true,
        polls: true,
        bookmarks: true,
      },
      orderBy: [desc(posts.createdAt)]
    });
  }

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

        {bookmarkedPosts.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedPosts.map((post: any) => (
              <ConfessionCard key={post.id} post={post} />
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
