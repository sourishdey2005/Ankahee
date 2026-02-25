'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { isEditable } from '@/lib/utils'
import { updatePost } from '@/actions'
import { createClient } from '@/lib/supabase/client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import Countdown from '@/components/Countdown'
import { useToast } from '@/hooks/use-toast'
import { Clock, Pencil, Loader2 } from 'lucide-react'
import { moodColors } from '@/lib/mood-tags'
import Echoes from './Echoes'
import BurnButton from './BurnButton'
import Poll from './Poll'
import VoidQuestion from './VoidQuestion'

type Post = Tables<'posts'>
type PollVote = Tables<'poll_votes'>
type PollWithVotes = Tables<'polls'> & { poll_votes: PollVote[] }
type PostWithDetails = Post & { reactions: Tables<'reactions'>[], polls: PollWithVotes[], void_answers: Tables<'void_answers'>[] }


const formSchema = z.object({
  content: z.string().min(10, 'Must be at least 10 characters.').max(500, 'Cannot exceed 500 characters.'),
})

export default function EditPost({ post: initialPost, user }: { post: PostWithDetails; user: User }) {
  const [post, setPost] = useState(initialPost);
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const supabase = createClient()
  
  const canEdit = user.id === post.user_id
  const moodColor = post.mood ? moodColors[post.mood as keyof typeof moodColors] || 'bg-secondary' : 'bg-secondary';
  const poll = post.polls?.[0];
  const isVoidQuestion = post.is_void_question;

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    const channel = supabase.channel(`details-granular:${initialPost.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${initialPost.id}`
      }, (payload: any) => {
        setPost(currentPost => {
          if (!currentPost) return null as any;
          const reactionUser = (payload.new?.user_id || payload.old?.user_id);
          const filteredReactions = currentPost.reactions.filter(r => r.user_id !== reactionUser);
          
          let newReactions: Tables<'reactions'>[];
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            newReactions = [...filteredReactions, payload.new as Tables<'reactions'>];
          } else { // DELETE
            newReactions = filteredReactions;
          }
          return { ...currentPost, reactions: newReactions };
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'poll_votes'
      }, (payload: any) => {
        setPost(currentPost => {
            if (!currentPost || !currentPost.polls.length) return currentPost;
            const pollId = currentPost.polls[0].id;
            if (payload.new.poll_id !== pollId) return currentPost;
            
            if (currentPost.polls[0].poll_votes.some(v => v.id === payload.new.id)) return currentPost;
            
            const newVotes = [...currentPost.polls[0].poll_votes, payload.new as Tables<'poll_votes'>];
            const updatedPoll = { ...currentPost.polls[0], poll_votes: newVotes };
            return { ...currentPost, polls: [updatedPoll] };
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'void_answers',
        filter: `post_id=eq.${initialPost.id}`
      }, (payload: any) => {
        setPost(currentPost => {
            if (!currentPost) return currentPost;
            if (currentPost.void_answers.some(a => a.id === payload.new.id)) return currentPost;
            const newAnswers = [...currentPost.void_answers, payload.new as Tables<'void_answers'>];
            return { ...currentPost, void_answers: newAnswers };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPost.id, supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: post.content,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      if (!isEditable(post.created_at)) {
        toast({ title: 'Error', description: 'Edit window has expired.', variant: 'destructive' })
        setIsEditing(false);
        return;
      }
      const result = await updatePost({ postId: post.id, content: values.content })
      if (result.error) {
        toast({ title: 'Error', description: result.error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Your confession has been updated.' })
        // Optimistically update content
        setPost(p => ({ ...p, content: values.content }));
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
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <FormMessage />
                        <span>{field.value.length} / 500</span>
                    </div>
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
        {poll && !isVoidQuestion && <Poll poll={poll} user={user} />}
        {isVoidQuestion && <VoidQuestion postId={post.id} initialAnswers={post.void_answers || []} user={user} />}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground">
        <div className="flex items-center space-x-4">
            <Echoes post={post} />
             <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <Countdown expiresAt={post.expires_at} />
            </div>
        </div>
        {canEdit && !isEditing && (
            <div className="flex items-center gap-2">
                {isEditable(post.created_at) && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                )}
                <BurnButton postId={post.id} />
            </div>
        )}
      </CardFooter>
    </Card>
  )
}
