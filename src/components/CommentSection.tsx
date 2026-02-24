'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { Session } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { generateHslColorFromString } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Loader2, Send, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from './ui/avatar'
import EditComment from './EditComment'

type Comment = Tables<'comments'>

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.'),
})

export default function CommentSection({
  postId,
  initialComments,
  session,
}: {
  postId: string,
  initialComments: Comment[],
  session: Session
}) {
  const [comments, setComments] = useState(initialComments)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const supabase = createClient()
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments((prevComments) => {
              if (prevComments.some(c => c.id === payload.new.id)) return prevComments
              return [...prevComments, payload.new as Comment]
            })
          } else if (payload.eventType === 'UPDATE') {
            setComments((prevComments) =>
              prevComments.map((comment) =>
                comment.id === payload.new.id ? (payload.new as Comment) : comment
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setComments((prevComments) =>
              prevComments.filter((comment) => comment.id !== (payload.old as { id: string }).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, postId])

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    const tempId = uuidv4()
    const newComment: Comment = {
      id: tempId,
      content: values.content,
      post_id: postId,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      username: 'Anonymous',
    }

    setComments(prev => [...prev, newComment])
    form.reset()

    startTransition(async () => {
      const { error } = await supabase.from('comments').insert({
        id: tempId,
        post_id: postId,
        content: values.content,
        user_id: session.user.id,
        username: 'Anonymous',
      })

      if (error) {
        toast({ title: 'Error posting comment', description: error.message, variant: 'destructive' })
        setComments(prev => prev.filter(c => c.id !== tempId))
      }
    })
  }

  const userColor = generateHslColorFromString(session.user.id, 50, 60);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
        <MessageSquare />
        Comments
      </h2>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
          <Avatar className="h-10 w-10 mt-1">
             <AvatarFallback style={{ backgroundColor: userColor }} />
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
      
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <EditComment key={comment.id} comment={comment} user={session.user} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to reply.</p>
        )}
      </div>
    </div>
  )
}
