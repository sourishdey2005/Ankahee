'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { generateHslColorFromString } from '@/lib/utils'
import { addStorySegment } from '@/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type StorySegment = Tables<'story_segments'>;

const segmentSchema = z.object({
  content: z.string().min(1, 'Sentence cannot be empty.').max(280, 'Sentence too long.'),
})

export default function StoryClient({
  user,
  storyId,
  prompt,
  initialSegments,
}: {
  user: User,
  storyId: string,
  prompt: string,
  initialSegments: StorySegment[],
}) {
  const [segments, setSegments] = useState(initialSegments)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof segmentSchema>>({
    resolver: zodResolver(segmentSchema),
    defaultValues: { content: '' },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`story:${storyId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_segments', filter: `story_id=eq.${storyId}` },
        (payload) => {
          setSegments((prev) => [...prev, payload.new as StorySegment].sort((a, b) => a.order - b.order))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, storyId])

  const onSubmit = (values: z.infer<typeof segmentSchema>) => {
    form.reset()

    const lastSegmentOrder = segments.length > 0 ? segments[segments.length - 1].order : 0;
    
    startTransition(async () => {
      const result = await addStorySegment({
        storyId: storyId,
        content: values.content,
        order: lastSegmentOrder + 1
      })
      if (result?.error) {
        toast({
            title: "Error",
            description: result.error.message,
            variant: "destructive"
        })
      }
    })
  }

  const canPost = segments.length === 0 || segments[segments.length - 1].user_id !== user.id;
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
        <ScrollArea className="flex-1">
            <Card className="border-0 shadow-none rounded-b-none">
                <CardHeader>
                    <p className="text-lg text-muted-foreground italic">"{prompt}"</p>
                </CardHeader>
                <CardContent className="space-y-2 text-lg">
                    {segments.map((segment) => {
                        const userColor = generateHslColorFromString(segment.user_id, 50, 60);
                        return (
                             <span key={segment.id} style={{ color: userColor }} className="font-medium">
                                {segment.content}{' '}
                            </span>
                        )
                    })}
                </CardContent>
            </Card>
        </ScrollArea>
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormControl>
                            <Input 
                                autoComplete="off" 
                                placeholder={canPost ? "Add the next sentence..." : "Wait for someone else to contribute."} 
                                {...field}
                                disabled={isPending || !canPost}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit" size="icon" disabled={isPending || !canPost}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                </form>
            </Form>
        </div>
    </div>
  )
}
