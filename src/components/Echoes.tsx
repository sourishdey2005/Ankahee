'use client'

import { useTransition, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { REACTIONS, ReactionTypes, type ReactionType } from '@/lib/reactions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@/hooks/use-user'

export default function Echoes({ post }: { post: any }) {
  const { userId } = useUser()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const toggleReaction = useMutation(api.reactions.toggleReaction)

  const reactions = post.reactions || []

  const userReaction = useMemo(() => {
    if (!userId) return null
    const found = reactions.find((r: any) => r.authorId === userId)
    return found?.reaction as ReactionType || null
  }, [reactions, userId])

  const reactionCounts = useMemo(() => {
    const counts: { [key in ReactionType]?: number } = {}
    if (!Array.isArray(reactions)) return counts

    for (const reaction of reactions) {
      const type = reaction.reaction as ReactionType
      if (ReactionTypes.includes(type)) {
        counts[type] = (counts[type] || 0) + 1
      }
    }
    return counts
  }, [reactions])

  const handleReact = (reaction: ReactionType) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to react.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        await toggleReaction({
          postId: post._id,
          authorId: userId,
          reaction: reaction
        })
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Could not update reaction.',
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1" onClick={(e) => e.preventDefault()}>
        {ReactionTypes.map((reactionType) => {
          const reactionInfo = REACTIONS[reactionType];
          const Icon = reactionInfo.icon;
          const count = reactionCounts[reactionType] || 0;
          const isSelected = userReaction === reactionType;

          return (
            <Tooltip key={reactionType} delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center space-x-1.5 text-muted-foreground px-2 transition-all",
                    isSelected && `${reactionInfo.color} bg-accent`,
                    isPending && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleReact(reactionType)}
                  disabled={isPending}
                >
                  <Icon className={cn("h-4 w-4", isSelected && reactionInfo.fill)} />
                  {count > 0 && <span className="text-xs font-semibold">{count}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reactionInfo.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  )
}
