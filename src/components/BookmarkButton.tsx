'use client'

import { useState, useTransition } from 'react'
import { addBookmark, removeBookmark } from '@/actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BookmarkButton({ postId, isBookmarked: initialIsBookmarked }: { postId: string, isBookmarked: boolean }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)

  const handleToggleBookmark = () => {
    startTransition(async () => {
      const action = isBookmarked ? removeBookmark : addBookmark
      const newBookmarkState = !isBookmarked
      setIsBookmarked(newBookmarkState) // Optimistic update

      const result = await action({ postId })
      if (result?.error) {
        setIsBookmarked(!newBookmarkState) // Revert on error
        toast({
          title: `Error ${newBookmarkState ? 'saving' : 'removing'} bookmark`,
          description: result.error.message,
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
