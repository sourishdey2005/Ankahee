import Link from 'next/link'
import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'
import Countdown from './Countdown'
import { MoodTag, moodColors } from '@/lib/mood-tags'
import Echoes from './Echoes'
import { cn } from '@/lib/utils'

type PostWithCounts = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
};

export default function ConfessionCard({ post }: { post: PostWithCounts }) {
  const moodColor = post.mood ? moodColors[post.mood as MoodTag] || 'bg-secondary' : 'bg-secondary';
  const commentCount = post.comments?.[0]?.count ?? 0;

  const expires = new Date(post.expires_at);
  const now = new Date();
  const timeLeft = expires.getTime() - now.getTime();
  const isExpiringSoon = timeLeft > 0 && timeLeft < (60 * 60 * 1000); // Less than 1 hour

  return (
    <Link href={`/confession/${post.id}`} className="block">
      <Card className={cn(
        "hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm",
        isExpiringSoon && "opacity-70 hover:opacity-100"
      )}>
        <CardHeader>
          {post.mood && (
            <Badge variant="outline" className={`${moodColor}`}>
              {post.mood}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center space-x-4">
            <Echoes post={post} />
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
