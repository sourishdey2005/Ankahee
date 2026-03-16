'use client'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'
import Countdown from './Countdown'
import { MoodTag, moodColors } from '@/lib/mood-tags'
import Echoes from './Echoes'
import { cn } from '@/lib/utils'
import Poll from './Poll'
import VoidQuestion from './VoidQuestion'
import BookmarkButton from './BookmarkButton'
import { useMemo } from 'react'
import Image from 'next/image'
import { useUser } from '@/hooks/use-user'

type PostWithDetails = any;

export default function ConfessionCard({ post, user: propUser }: { post: PostWithDetails, user?: any }) {
  const { user: authUser } = useUser()
  const user = propUser || authUser
  const moodColor = post.mood ? moodColors[post.mood as MoodTag] || 'bg-secondary' : 'bg-secondary';
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  const expires_at = post.expiresAt || (post._creationTime ? post._creationTime + (24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000));
  const isExpiringSoon = useMemo(() => {
    const timeLeft = expires_at - Date.now();
    return timeLeft > 0 && timeLeft < (60 * 60 * 1000);
  }, [expires_at]);

  const poll = post.polls?.[0];
  const isVoidQuestion = post.isVoidQuestion;

  const isBookmarked = useMemo(() => {
    if (!user || !post.bookmarks) return false;
    return post.bookmarks.some((b: any) => b.userId === user.id);
  }, [post.bookmarks, user]);

  return (
    <Link href={`/confession/${post._id}`} className="block">
      <Card className={cn(
        "hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm",
        isExpiringSoon && "opacity-70 hover:opacity-100"
      )}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start w-full">
            {post.mood && (
              <Badge variant="outline" className={`${moodColor}`}>
                {post.mood}
              </Badge>
            )}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <Countdown expiresAt={expires_at.toString()} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
              <Image
                src={post.imageUrl}
                alt="Confession image"
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
          {poll && !isVoidQuestion && user && (
            <div onClick={(e) => e.preventDefault()}>
                <Poll poll={poll} user={user} />
            </div>
          )}
          {isVoidQuestion && user && (
            <div onClick={(e) => e.preventDefault()}>
                <VoidQuestion postId={post._id} initialAnswers={post.void_answers || []} user={user} />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground pt-0">
          <div className="flex items-center space-x-4">
            <Echoes post={post} />
            <div className="flex items-center space-x-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {user && <BookmarkButton postId={post._id} isBookmarked={isBookmarked} />}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
