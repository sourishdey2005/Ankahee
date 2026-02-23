import Link from 'next/link'
import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'
import Countdown from './Countdown'
import { moodColors } from '@/lib/mood-tags'
import LikeButton from './LikeButton'

type PostWithCounts = Tables<'posts'> & {
  comments: Array<{ count: number }>
  likes: Array<{ count: number }>
};

export default function ConfessionCard({ post }: { post: PostWithCounts }) {
  const moodColor = post.mood ? moodColors[post.mood] || 'bg-secondary' : 'bg-secondary';
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <Link href={`/confession/${post.id}`} className="block">
      <Card className="hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          {post.mood && (
            <Badge variant="outline" className={`self-start ${moodColor}`}>
              {post.mood}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center space-x-4">
            <LikeButton postId={post.id} />
            <div className="flex items-center space-x-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <Countdown expiresAt={post.expires_at} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
