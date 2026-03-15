import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArchivedPostCard from '@/components/ArchivedPostCard'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../../convex/_generated/api'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/feed')
  }

  const archivedPosts = await fetchQuery(api.posts.getArchivedPosts, { userId }) || [];

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
              <ArchivedPostCard key={post._id} post={post} />
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
