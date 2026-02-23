import Link from 'next/link'
import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'
import Countdown from './Countdown'

type PostWithCommentCount = Tables<'posts'> & {
    // In a real app, you'd probably join this in the query
    comment_count?: number 
};

const moodColors: { [key: string]: string } = {
  '❤️ Sad': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '😡 Angry': 'bg-red-500/20 text-red-300 border-red-500/30',
  '😍 Love': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '😰 Anxiety': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '🤫 Secret': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function ConfessionCard({ post }: { post: PostWithCommentCount }) {
  const moodColor = post.mood ? moodColors[post.mood] || 'bg-secondary' : 'bg-secondary';

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
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <Countdown expiresAt={post.expires_at} />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            {/* Real comment count would come from DB */}
            <span>{post.comment_count || 0} comments</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
