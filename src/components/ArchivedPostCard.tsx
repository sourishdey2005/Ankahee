import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { MoodTag, moodColors } from '@/lib/mood-tags'
import { REACTIONS } from '@/lib/reactions'
import { cn } from '@/lib/utils'

export default function ArchivedPostCard({ post }: { post: any }) {
  const moodColor = post.mood ? moodColors[post.mood as MoodTag] || 'bg-secondary' : 'bg-secondary';
  const commentCount = post.comments?.length || 0;
  
  const reactionCounts = (post.reactions || []).reduce((acc: any, reaction: any) => {
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
                Posted on {format(new Date(post.createdAt), 'MMM d, yyyy')}
            </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground">
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                {Object.entries(reactionCounts).map(([key, { count, icon: Icon }]: [string, any]) => (
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
