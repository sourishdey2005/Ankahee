'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { addVoidAnswer } from '@/actions'
import { useToast } from '@/hooks/use-toast'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { Loader2 } from 'lucide-react'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type VoidAnswer = Tables<'void_answers'>

const answerSchema = z.object({
  word: z.string().trim().min(1, "Answer can't be empty.").max(30, "Word is too long."),
}).refine(data => !data.word.includes(' '), {
    message: "Only a single word is allowed.",
    path: ["word"],
});

export default function VoidQuestion({ postId, initialAnswers, user }: { postId: string, initialAnswers: VoidAnswer[], user: User }) {
    const [answers, setAnswers] = useState<VoidAnswer[]>(initialAnswers);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const supabase = createClient();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
        const channel = supabase.channel(`void-answers:${postId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'void_answers', filter: `post_id=eq.${postId}` },
            (payload) => {
              setAnswers((prev) => [...prev, payload.new as VoidAnswer])
            }
          )
          .subscribe()
    
        return () => {
          supabase.removeChannel(channel)
        }
      }, [supabase, postId]);


    const form = useForm<z.infer<typeof answerSchema>>({
        resolver: zodResolver(answerSchema),
        defaultValues: { word: '' },
    })

    const userHasAnswered = useMemo(() => {
        return answers.some(a => a.user_id === user.id)
    }, [answers, user.id]);

    const wordCloudData = useMemo(() => {
        const frequencies: { [key: string]: number } = {};
        for (const answer of answers) {
            frequencies[answer.word] = (frequencies[answer.word] || 0) + 1;
        }
        const data = Object.entries(frequencies)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);

        if (data.length === 0) return [];
        
        const max = Math.max(...data.map((w) => w.value), 1);

        return data.map((w) => ({
          ...w,
          size: 14 + (w.value / max) * 34,
        }));
    }, [answers]);

    const colors = useMemo(() => ['text-primary', 'text-purple-400', 'text-yellow-400', 'text-red-400', 'text-blue-400', 'text-green-400'], []);

    const onSubmit = (values: z.infer<typeof answerSchema>) => {
        startTransition(async () => {
            const result = await addVoidAnswer({ postId, word: values.word });
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error.message,
                    variant: "destructive"
                });
            } else {
                form.reset();
            }
        });
    }

    return (
        <div className="my-4 pt-4 border-t space-y-4">
            {wordCloudData.length > 0 ? (
                <div className="h-48 w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1 overflow-hidden">
                    {isMounted ? wordCloudData.map((word, index) => (
                        <span
                          key={word.text}
                          className={`font-bold transition-transform duration-300 hover:scale-125 ${colors[index % colors.length]}`}
                          style={{
                            fontSize: `${word.size}px`,
                            fontFamily: '"Space Grotesk", sans-serif',
                          }}
                        >
                          {word.text}
                        </span>
                    )) : <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}
                </div>
            ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Be the first to answer...
                </div>
            )}
            
            {!userHasAnswered && (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                        <FormField
                            control={form.control}
                            name="word"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormControl>
                                    <Input autoComplete="off" placeholder="Answer with a single word..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}
