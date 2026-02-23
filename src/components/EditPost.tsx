'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { isEditable } from '@/lib/utils'
import { updatePost } from '@/actions'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import Countdown from '@/components/Countdown'
import { useToast } from '@/hooks/use-toast'
import { Clock, Pencil, Loader2 } from 'lucide-react'
import { moodColors } from '@/lib/mood-tags'
import LikeButton from './LikeButton'

type Post = Tables<'posts'>

const formSchema = z.object({
  content: z.string().min(10, 'Must be at least 10 characters.').max(500, 'Cannot exceed 500 characters.'),
})

export default function EditPost({ post, user }: { post: Post; user: User }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  
  const canEdit = user.id === post.user_id && isEditable(post.created_at)
  const moodColor = post.mood ? moodColors[post.mood] || 'bg-secondary' : 'bg-secondary';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: post.content,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await updatePost({ postId: post.id, content: values.content })
      if (result.error) {
        toast({ title: 'Error', description: result.error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Your confession has been updated.' })
        setIsEditing(false)
      }
    })
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm mb-8">
      <CardHeader>
        {post.mood && (
          <Badge variant="outline" className={`self-start ${moodColor}`}>
            {post.mood}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} className="min-h-[150px] text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <p className="text-lg text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground">
        <div className="flex items-center space-x-4">
            <LikeButton postId={post.id} />
             <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <Countdown expiresAt={post.expires_at} />
            </div>
        </div>
        {canEdit && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
