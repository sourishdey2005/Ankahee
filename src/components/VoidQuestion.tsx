'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import WordCloud from 'react-wordcloud'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
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
    const [isFontLoaded, setIsFontLoaded] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      // Ensure the font is loaded before rendering the word cloud to prevent measurement errors.
      document.fonts.load('bold 1rem "Space Grotesk"').then(() => {
        setIsFontLoaded(true);
      });
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
        return Object.entries(frequencies)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
    }, [answers]);

    const colors = useMemo(() => ['#FF9933', '#A162F7', '#F2C94C', '#EB5757', '#2D9CDB', '#6FCF97'], []);
    const options: any = {
        colors,
        fontFamily: '"Space Grotesk", sans-serif',
        fontSizes: [16, 48],
        padding: 1,
        rotations: 0,
        scale: 'sqrt',
        spiral: 'archimedean',
        transitionDuration: 1000,
    };

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
                <div className="h-48 w-full">
                    {isMounted && isFontLoaded ? <WordCloud words={wordCloudData} options={options} /> : <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}
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
