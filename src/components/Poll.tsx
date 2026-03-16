'use client'

import { useTransition, useMemo } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@/hooks/use-user'

export default function Poll({ poll }: { poll: any }) {
    const { userId } = useUser()
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const voteInPoll = useMutation(api.polls.voteInPoll)

    const pollVotes = poll.pollVotes || []

    const userVote = useMemo(() => {
        if (!userId) return null
        return pollVotes.find((v: any) => v.userId === userId)
    }, [pollVotes, userId])

    const totalVotes = pollVotes.length
    const optionOneVotes = pollVotes.filter((v: any) => v.selectedOption === 1).length
    const optionTwoVotes = totalVotes - optionOneVotes

    const optionOnePercentage = totalVotes > 0 ? Math.round((optionOneVotes / totalVotes) * 100) : 0
    const optionTwoPercentage = totalVotes > 0 ? 100 - optionOnePercentage : 0

    const handleVote = (option: 1 | 2) => {
        if (!userId) {
            toast({
                title: "Authentication required",
                description: "You must be logged in to vote.",
                variant: "destructive"
            })
            return
        }

        startTransition(async () => {
            try {
                await voteInPoll({ 
                    pollId: poll._id, 
                    userId,
                    optionIndex: option - 1
                })
                toast({
                    title: "Success",
                    description: "Your vote has been cast."
                })
            } catch (err: any) {
                toast({
                    title: "Error",
                    description: err.message || "Could not cast vote.",
                    variant: "destructive"
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
                            <span className={cn("font-medium", userVote?.selectedOption === 1 && "text-primary-foreground font-bold")}>{poll.optionOneText}</span>
                            <span className="font-bold">{optionOnePercentage}%</span>
                        </div>
                    </div>
                     <div className="relative h-8 w-full rounded-md overflow-hidden bg-secondary">
                        <div className="absolute h-full bg-accent transition-all" style={{ width: `${optionTwoPercentage}%` }}></div>
                         <div className="absolute inset-0 flex justify-between items-center px-3 text-sm">
                            <span className={cn("font-medium", userVote?.selectedOption === 2 && "text-accent-foreground font-bold")}>{poll.optionTwoText}</span>
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
                        {poll.optionOneText}
                    </Button>
                    <Button variant="outline" onClick={() => handleVote(2)} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {poll.optionTwoText}
                    </Button>
                </div>
            )}
        </div>
    )
}
