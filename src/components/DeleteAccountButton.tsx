'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from '@/app/account/actions'
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
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function DeleteAccountButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount()
      if (result?.error) {
        toast({
          title: 'Error Deleting Account',
          description: result.error,
          variant: 'destructive',
        })
        setIsDialogOpen(false)
      } else {
        toast({
          title: 'Account Deleted',
          description: 'Your account and all associated data have been removed.',
        })
        // Refresh the current route and fetch new data from the server.
        // This will re-trigger the layout's session check and redirect to /login.
        router.refresh()
      }
    })
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all of your confessions and comments.
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
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete My Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
