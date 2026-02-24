'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { REACTIONS, ReactionTypes, type ReactionType } from '@/lib/reactions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

type PostWithReactions = Tables<'posts'> & {
  reactions: Tables<'reactions'>[]
}

export default function Echoes({ post }: { post: PostWithReactions }) {
  const [reactions, setReactions] = useState(post.reactions)
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [userId, setUserId] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    setReactions(post.reactions)
  }, [post.reactions])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUserId = session?.user?.id
        setUserId(currentUserId)
        if (currentUserId) {
          const foundUserReaction = reactions.find(r => r.user_id === currentUserId)
          setUserReaction(foundUserReaction?.reaction as ReactionType || null)
        } else {
          setUserReaction(null)
        }
      }
    )
    return () => authListener.subscription.unsubscribe()
  }, [reactions, supabase.auth])

  const reactionCounts = useMemo(() => {
    const counts: { [key in ReactionType]?: number } = {}
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
      // If user is removing their reaction
      if (userReaction === reaction) {
        setUserReaction(null)
        setReactions(prev => prev.filter(r => !(r.user_id === userId && r.reaction === reaction)))
        
        const { error } = await supabase.from('reactions').delete().match({ post_id: post.id, user_id: userId, reaction: reaction })
        if (error) {
          toast({ title: 'Error', description: error.message || 'Could not remove reaction.', variant: 'destructive'})
          // Revert optimistic update
          setUserReaction(reaction)
          setReactions(post.reactions)
        }
      } else { // If user is adding a new reaction or changing it
        const oldReaction = userReaction
        setUserReaction(reaction)

        // Optimistic update
        const newReactions = reactions.filter(r => r.user_id !== userId)
        newReactions.push({ id: '', created_at: new Date().toISOString(), post_id: post.id, user_id, reaction })
        setReactions(newReactions)
        
        const { error } = await supabase.from('reactions').upsert({ post_id: post.id, user_id: userId, reaction: reaction }, { onConflict: 'post_id, user_id' })

        if (error) {
          toast({ title: 'Error', description: error.message || 'Could not add reaction.', variant: 'destructive'})
          // Revert optimistic update
          setUserReaction(oldReaction)
          setReactions(post.reactions)
        }
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
                    isPending && 'cursor-not-allowed'
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
