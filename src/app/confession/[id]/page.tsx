import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CommentSection from '@/components/CommentSection'
import ConfessionCard from '@/components/ConfessionCard'
import { Separator } from '@/components/ui/separator'
import { db, posts } from '@/db'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function ConfessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Fetch the main post with enriched details via SQLite
  const postId = parseInt(id)
  if (isNaN(postId)) notFound()

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      comments: true,
      reactions: true,
      polls: {
        with: {
          votes: true
        }
      },
      bookmarks: true,
      voidAnswers: true,
    }
  })

  if (!post) {
    notFound()
  }

  // Fetch children and parent (simplified for now)
  const childPosts = await db.query.posts.findMany({
    where: eq(posts.parentId, postId),
    with: {
      comments: true,
      reactions: true,
      polls: true,
      bookmarks: true,
    },
    orderBy: [desc(posts.createdAt)]
  })

  let parentPost = null
  if (post.parentId) {
    parentPost = await db.query.posts.findFirst({
      where: eq(posts.id, post.parentId),
      with: {
        comments: true,
        reactions: true,
        polls: true,
        bookmarks: true,
      }
    })
  }

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
          <ConfessionCard post={parentPost} />
        </div>
      )}

      <ConfessionCard post={post} />

      <div className="my-8 flex justify-center">
        <Link href={`/new?parent_id=${post.id}`}>
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
              <ConfessionCard key={child.id} post={child} />
            ))}
          </div>
        </div>
      )}

      <Separator className="my-8" />
      <CommentSection postId={post.id} initialComments={post.comments} />
    </div>
  )
}
