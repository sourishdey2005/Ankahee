'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Flame } from 'lucide-react'

export default function BurnButton({ postId }: { postId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost({ postId })
      if (result?.error) {
        toast({
          title: 'Error Burning Confession',
          description: result.error.message,
          variant: 'destructive',
        })
        setIsDialogOpen(false)
      } else {
        toast({
          title: 'Confession Burned',
          description: 'Your confession has been permanently removed.',
        })
        setIsDialogOpen(false)
        router.push('/feed')
      }
    })
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
            <Flame className="mr-2 h-4 w-4" />
            Burn
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this confession. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className={buttonVariants({ variant: 'destructive' })}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Flame className="mr-2 h-4 w-4" />
            )}
            Burn It
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
