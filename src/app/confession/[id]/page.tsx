import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Countdown from '@/components/Countdown'
import CommentSection from '@/components/CommentSection'
import { Tables } from '@/lib/supabase/types'
import { moodColors } from '@/lib/mood-tags'

type Post = Tables<'posts'>
type Comment = Tables<'comments'>

export default async function ConfessionPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/feed')
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
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

  const moodColor = post.mood ? moodColors[post.mood] || 'bg-secondary' : 'bg-secondary';
  const initialComments: Comment[] = comments || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/feed" className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>
      </Link>
      
      <Card className="bg-card/50 backdrop-blur-sm mb-8">
        <CardHeader>
          {post.mood && (
            <Badge variant="outline" className={`self-start ${moodColor}`}>
              {post.mood}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <Countdown expiresAt={post.expires_at} />
          </div>
        </CardFooter>
      </Card>
      
      <CommentSection postId={post.id} initialComments={initialComments} session={session} />
    </div>
  )
}
