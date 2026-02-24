import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { MoodTag, moodColors } from '@/lib/mood-tags'
import { REACTIONS } from '@/lib/reactions'
import { cn } from '@/lib/utils'

type PostWithDetails = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
};

export default function ArchivedPostCard({ post }: { post: PostWithDetails }) {
  const moodColor = post.mood ? moodColors[post.mood as MoodTag] || 'bg-secondary' : 'bg-secondary';
  const commentCount = post.comments?.[0]?.count ?? 0;
  
  const reactionCounts = post.reactions.reduce((acc, reaction) => {
    const reactionType = reaction.reaction as keyof typeof REACTIONS;
    if (!acc[reactionType]) {
        acc[reactionType] = { count: 0, icon: REACTIONS[reactionType]?.icon };
    }
    acc[reactionType].count++;
    return acc;
  }, {} as Record<string, { count: number, icon: React.ElementType }>);

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm")}>
      <CardHeader>
        <div className="flex justify-between items-center">
            {post.mood && (
                <Badge variant="outline" className={`${moodColor}`}>
                {post.mood}
                </Badge>
            )}
            <span className="text-xs text-muted-foreground">
                Posted on {format(parseISO(post.created_at), 'MMM d, yyyy')}
            </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground">
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                {Object.entries(reactionCounts).map(([key, { count, icon: Icon }]) => (
                    <div key={key} className="flex items-center text-xs">
                        <Icon className="h-4 w-4 mr-1" />
                        <span>{count}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  )
}
