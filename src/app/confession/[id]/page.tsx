import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CommentSection from '@/components/CommentSection'
import { Tables } from '@/lib/supabase/types'
import EditPost from '@/components/EditPost'

type Comment = Tables<'comments'>
type PollVote = Tables<'poll_votes'>
type Poll = Tables<'polls'> & { poll_votes: PollVote[] }
type PostWithDetails = Tables<'posts'> & {
  reactions: Tables<'reactions'>[]
  polls: Poll[]
}

export default async function ConfessionPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/feed')
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, polls(*, poll_votes(*))')
    .eq('id', params.id)
    .single()

  if (postError || !post) {
    notFound()
  }

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', params.id)
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
      
      <EditPost post={post as any} user={session.user} />
      
      <CommentSection postId={post.id} initialComments={initialComments} session={session} />
    </div>
  )
}
