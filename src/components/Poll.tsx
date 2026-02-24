'use client'

import { useTransition, useMemo } from 'react'
import type { Tables } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'
import { castVote } from '@/actions'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type PollWithVotes = Tables<'polls'> & {
    poll_votes: Tables<'poll_votes'>[]
}

export default function Poll({ poll, user }: { poll: PollWithVotes, user: User }) {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const userVote = useMemo(() => {
        return poll.poll_votes.find(v => v.user_id === user.id)
    }, [poll.poll_votes, user.id])

    const totalVotes = poll.poll_votes.length
    const optionOneVotes = poll.poll_votes.filter(v => v.selected_option === 1).length
    const optionTwoVotes = totalVotes - optionOneVotes

    const optionOnePercentage = totalVotes > 0 ? Math.round((optionOneVotes / totalVotes) * 100) : 0
    const optionTwoPercentage = totalVotes > 0 ? 100 - optionOnePercentage : 0

    const handleVote = (option: 1 | 2) => {
        startTransition(async () => {
            const result = await castVote({ pollId: poll.id, option })
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error.message,
                    variant: "destructive"
                })
            } else {
                 toast({
                    title: "Success",
                    description: "Your vote has been cast."
                })
            }
        })
    }

    const isVoted = !!userVote

    return (
        <div className="my-4 space-y-3 pt-4 border-t">
            {isVoted ? (
                // Results view
                <div className="space-y-2">
                    <div className="relative h-8 w-full rounded-md overflow-hidden bg-secondary">
                        <div className="absolute h-full bg-primary/50 transition-all" style={{ width: `${optionOnePercentage}%` }}></div>
                        <div className="absolute inset-0 flex justify-between items-center px-3 text-sm">
                            <span className={cn("font-medium", userVote?.selected_option === 1 && "text-primary-foreground font-bold")}>{poll.option_one_text}</span>
                            <span className="font-bold">{optionOnePercentage}%</span>
                        </div>
                    </div>
                     <div className="relative h-8 w-full rounded-md overflow-hidden bg-secondary">
                        <div className="absolute h-full bg-accent transition-all" style={{ width: `${optionTwoPercentage}%` }}></div>
                         <div className="absolute inset-0 flex justify-between items-center px-3 text-sm">
                            <span className={cn("font-medium", userVote?.selected_option === 2 && "text-accent-foreground font-bold")}>{poll.option_two_text}</span>
                            <span className="font-bold">{optionTwoPercentage}%</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</p>
                </div>
            ) : (
                // Voting view
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleVote(1)} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {poll.option_one_text}
                    </Button>
                    <Button variant="outline" onClick={() => handleVote(2)} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {poll.option_two_text}
                    </Button>
                </div>
            )}
        </div>
    )
}
