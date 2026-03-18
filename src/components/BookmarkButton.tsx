'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleBookmark } from '@/app/actions/interactions'
import { useUser } from '@/hooks/use-user'

export default function BookmarkButton({ postId, isBookmarked: initialIsBookmarked }: { postId: any, isBookmarked: boolean }) {
  const { toast } = useToast()
  const { userId } = useUser()
  const [isPending, startTransition] = useTransition()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)

  const handleToggleBookmark = () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to bookmark.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const newBookmarkState = !isBookmarked
      setIsBookmarked(newBookmarkState) // Optimistic update

      try {
        await toggleBookmark(postId, userId)
      } catch (err: any) {
        setIsBookmarked(!newBookmarkState) // Revert on error
        toast({
          title: `Error updating bookmark`,
          description: err.message || 'Could not update bookmark.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleToggleBookmark()
        }}
        disabled={isPending}
    >
        {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current text-primary")} />
        )}
        <span className="sr-only">Toggle Bookmark</span>
    </Button>
  )
}
