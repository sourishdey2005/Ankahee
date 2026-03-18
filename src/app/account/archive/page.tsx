import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArchivedPostCard from '@/components/ArchivedPostCard'
import { cookies } from 'next/headers'
import { db, posts } from '@/db'
import { eq, desc, and, lte } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('ankahee_session')?.value
  
  if (!userId) {
    redirect('/login')
  }

  const now = new Date();
  const archivedPosts = await db.query.posts.findMany({
    where: and(eq(posts.authorId, userId), lte(posts.expiresAt, now)),
    with: {
        comments: true,
        reactions: true,
    },
    orderBy: [desc(posts.createdAt)]
  }) || [];

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
          <h1 className="text-3xl font-headline font-bold">My Archive</h1>
          <p className="text-muted-foreground">A private record of your past confessions. Only you can see this.</p>
        </div>

        {archivedPosts.length > 0 ? (
          <div className="space-y-4">
            {archivedPosts.map((post: any) => (
              <ArchivedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-lg bg-card/50">
            <h2 className="text-2xl font-headline mb-2">The Past is a Blank Page</h2>
            <p className="text-muted-foreground">You don't have any expired confessions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
