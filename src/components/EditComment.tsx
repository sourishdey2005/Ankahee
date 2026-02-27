'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { isEditable, generateHslColorFromString, generateAvatarDataUri } from '@/lib/utils'
import { updateComment, createOrGetDirectMessageRoom } from '@/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Pencil, Loader2, MessageSquarePlus } from 'lucide-react'

type Comment = Tables<'comments'>

const formSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(280, 'Cannot exceed 280 characters.'),
})

export default function EditComment({ comment, user }: { comment: Comment, user: User }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const [isCreatingDm, startDmCreation] = useTransition()

  const canEdit = user.id === comment.user_id && isEditable(comment.created_at)

  useEffect(() => {
    setContent(comment.content)
  }, [comment.content])

  const commenterColor = generateHslColorFromString(comment.user_id, 50, 60);
  const avatarUri = generateAvatarDataUri(comment.user_id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: comment.content,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await updateComment({ commentId: comment.id, content: values.content })
      if (result.error) {
        toast({ title: 'Error', description: result.error.message, variant: 'destructive' })
      } else {
        setContent(values.content)
        setIsEditing(false)
      }
    })
  }

  const handleStartDm = () => {
    startDmCreation(async () => {
        const result = await createOrGetDirectMessageRoom({ receiverId: comment.user_id })
        if (result.error) {
            toast({
                title: 'Error starting chat',
                description: result.error.message,
                variant: 'destructive',
            })
        } else {
            router.push(`/rooms/${result.data.roomId}`)
        }
    })
  }
  
  if (isEditing) {
    return (
        <div className="flex items-start gap-4 w-full">
            <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUri} />
                <AvatarFallback />
            </Avatar>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 flex-1">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input {...field} />
                            </FormControl>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <FormMessage />
                                <span>{field.value.length} / 280</span>
                            </div>
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
                        Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                        </Button>
                    </div>
                </form>
            </Form>
      </div>
    )
  }

  return (
    <div key={comment.id} className="flex items-start gap-4 group">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUri} />
        <AvatarFallback />
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold" style={{ color: commenterColor }}>Commenter</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-foreground/90 mt-1">{content}</p>
      </div>
      <div className="flex items-center">
        {user.id !== comment.user_id && (
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleStartDm} disabled={isCreatingDm}>
                {isCreatingDm ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
                <span className="sr-only">Message commenter</span>
            </Button>
        )}
        {canEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit comment</span>
            </Button>
        )}
      </div>
    </div>
  )
}
