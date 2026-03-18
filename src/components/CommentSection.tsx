'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { generateAvatarDataUri } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Loader2, Send, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { addComment } from '@/app/actions/interactions'
import { useUser } from '@/hooks/use-user'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.'),
})

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: any,
  initialComments: any[],
}) {
  const { userId } = useUser()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  
  const comments = initialComments || []

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    if (!userId) {
      toast({ title: 'Auth required', description: 'You must be logged in to comment.', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      try {
        await addComment(
          postId,
          userId,
          'Anonymous',
          values.content,
        )
        form.reset()
        toast({ title: 'Comment posted', description: 'Your whisper has been heard.' })
      } catch (err: any) {
        toast({ title: 'Error posting comment', description: err.message || 'Could not post comment.', variant: 'destructive' })
      }
    })
  }

  const userAvatarUri = userId ? generateAvatarDataUri(userId) : '';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
        <MessageSquare />
        Comments
      </h2>
      <Separator />

      {userId && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
            <Avatar className="h-10 w-10 mt-1">
               <AvatarImage src={userAvatarUri} />
               <AvatarFallback />
            </Avatar>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Add a comment..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" size="icon" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Post Comment</span>
            </Button>
          </form>
        </Form>
      )}
      
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-card/50 border border-white/5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={generateAvatarDataUri(comment.authorId)} />
                <AvatarFallback />
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">{comment.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to reply.</p>
        )}
      </div>
    </div>
  )
}
