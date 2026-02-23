'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createPost } from '@/actions'
import { suggestMoodTagForConfession } from '@/ai/flows/suggest-mood-tag-flow'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles } from 'lucide-react'

const MoodTags = ['❤️ Sad', '😡 Angry', '😍 Love', '😰 Anxiety', '🤫 Secret'] as const

const formSchema = z.object({
  content: z.string().min(10, 'Must be at least 10 characters.').max(500, 'Cannot exceed 500 characters.'),
  mood: z.enum(MoodTags).optional(),
})

type FormValues = z.infer<typeof formSchema>

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor)
    })
}

export default function NewPostForm({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const contentValue = form.watch('content')

  const getSuggestion = useCallback(async (text: string) => {
    if (text.length < 20) {
        setSuggestedMood(null)
        return;
    };
    setIsSuggesting(true)
    try {
      const result = await suggestMoodTagForConfession({ confessionText: text })
      if (result.moodTag) {
        setSuggestedMood(result.moodTag)
      }
    } catch (error) {
      console.error('Error suggesting mood:', error)
      setSuggestedMood(null)
    } finally {
      setIsSuggesting(false)
    }
  }, [])
  
  const debouncedSuggest = useCallback(debounce(getSuggestion, 1000), [getSuggestion])

  useEffect(() => {
    debouncedSuggest(contentValue)
  }, [contentValue, debouncedSuggest])


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await createPost({ ...values, userId })
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Your confession has been shared.',
        })
        router.push('/feed')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Confession</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Pour your heart out..."
                  className="min-h-[200px] text-lg"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <FormMessage />
                <span>{field.value.length} / 500</span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Mood Tag (Optional)
                {isSuggesting && <Loader2 className="h-4 w-4 animate-spin" />}
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {MoodTags.map((mood) => (
                    <Button
                      key={mood}
                      type="button"
                      variant={field.value === mood ? 'default' : 'outline'}
                      onClick={() => field.onChange(field.value === mood ? undefined : mood)}
                      className="relative"
                    >
                      {mood}
                      {suggestedMood === mood && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-primary p-1">
                            <Sparkles className="h-full w-full text-primary-foreground" />
                          </span>
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full font-bold text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post Anonymously
        </Button>
      </form>
    </Form>
  )
}
