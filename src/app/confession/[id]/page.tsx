import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CommentSection from '@/components/CommentSection'
import EditPost from '@/components/EditPost'
import ConfessionCard from '@/components/ConfessionCard'
import { Separator } from '@/components/ui/separator'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../../convex/_generated/api'

export const dynamic = 'force-dynamic'

export default async function ConfessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId, user } = await auth()

  if (!userId) {
    redirect('/feed')
  }

  // Fetch the main post with enriched details via Convex
  const post: any = await fetchQuery(api.posts.getPostById, { id: id as any })

  if (!post) {
    notFound()
  }

  const parentPost = post.parentPost;
  const childPosts = post.childPosts || [];
  const initialComments = post.comments || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/feed" className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      {/* Display parent post */}
      {parentPost && (
        <div className="mb-8">
          <p className="text-sm font-semibold mb-2 text-muted-foreground">In reply to:</p>
          <ConfessionCard post={parentPost} user={user} />
        </div>
      )}

      <EditPost post={post} user={user} />

      <div className="my-8 flex justify-center">
        <Link href={`/new?parent_id=${post._id}`}>
          <Button variant="outline" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add to the chain
          </Button>
        </Link>
      </div>

      {childPosts.length > 0 && (
        <div className="space-y-6">
          <Separator />
          <h3 className="text-xl font-headline font-bold pt-4">Replies in this chain:</h3>
          <div className="space-y-4">
            {childPosts.map((child: any) => (
              <ConfessionCard key={child._id} post={child} user={user} />
            ))}
          </div>
        </div>
      )}

      <Separator className="my-8" />
      <CommentSection postId={post._id} initialComments={initialComments} user={user} />
    </div>
  )
}
