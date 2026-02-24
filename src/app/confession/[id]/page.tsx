import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CommentSection from '@/components/CommentSection'
import { Tables } from '@/lib/supabase/types'
import EditPost from '@/components/EditPost'
import ConfessionCard from '@/components/ConfessionCard'
import { Separator } from '@/components/ui/separator'

type Comment = Tables<'comments'>
type PollVote = Tables<'poll_votes'>
type Poll = Tables<'polls'> & { poll_votes: PollVote[] }
type PostWithDetails = Tables<'posts'> & {
  reactions: Tables<'reactions'>[]
  polls: Poll[]
  comments: Array<{ count: number }>
  void_answers: Tables<'void_answers'>[]
}

export default async function ConfessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/feed')
  }

  // 1. Fetch the main post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, reactions(*), polls(*, poll_votes(*)), void_answers(*)')
    .eq('id', id)
    .single()

  if (postError || !post) {
    notFound()
  }

  // 2. Fetch the parent post, if it exists
  let parentPost: PostWithDetails | null = null;
  if (post.parent_post_id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(count), reactions(*), polls(*, poll_votes(*)), void_answers(*)')
      .eq('id', post.parent_post_id)
      .single()
    if (data) {
      parentPost = data as any;
    }
  }

  // 3. Fetch child posts
  const { data: childPostsData, error: childPostsError } = await supabase
    .from('posts')
    .select('*, comments(count), reactions(*), polls(*, poll_votes(*)), void_answers(*)')
    .eq('parent_post_id', id)
    .order('created_at', { ascending: true })

  const childPosts: PostWithDetails[] = (childPostsData as any) || [];

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const initialComments: Comment[] = comments || [];

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
          <ConfessionCard post={parentPost} user={session.user} />
        </div>
      )}

      <EditPost post={post as any} user={session.user} />

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
            {childPosts.map(child => (
              <ConfessionCard key={child.id} post={child} user={session.user} />
            ))}
          </div>
        </div>
      )}

      <Separator className="my-8" />
      <CommentSection postId={post.id} initialComments={initialComments} session={session} />
    </div>
  )
}
