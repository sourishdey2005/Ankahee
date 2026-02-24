'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createPost } from '@/actions'
import { suggestMoodTagForConfession } from '@/ai/flows/suggest-mood-tag-flow'
import { MoodTags } from '@/lib/mood-tags'

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
import { Loader2, Sparkles, PlusCircle, X, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  content: z.string().min(10, 'Must be at least 10 characters.').max(500, 'Cannot exceed 500 characters.'),
  mood: z.enum(MoodTags).optional(),
  pollOptionOne: z.string().max(80, 'Option cannot exceed 80 characters.').optional(),
  pollOptionTwo: z.string().max(80, 'Option cannot exceed 80 characters.').optional(),
})
  .refine(data => {
    if (data.pollOptionOne || data.pollOptionTwo) {
      return !!data.pollOptionOne && !!data.pollOptionTwo && data.pollOptionOne.length > 0 && data.pollOptionTwo.length > 0;
    }
    return true;
  }, {
    message: "Both poll options are required if you add a poll.",
    path: ["pollOptionTwo"],
  });

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

export default function NewPostForm({ userId, promptText, parentId }: { userId: string, promptText?: string, parentId?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [creationMode, setCreationMode] = useState<null | 'poll' | 'void'>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: parentId ? '' : promptText || '',
      mood: undefined,
      pollOptionOne: '',
      pollOptionTwo: '',
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
    const postData: any = { content: values.content, userId, parentId };
    if (values.mood) {
      postData.mood = values.mood;
    }
    if (creationMode === 'poll' && values.pollOptionOne && values.pollOptionTwo) {
      postData.poll = {
        optionOne: values.pollOptionOne,
        optionTwo: values.pollOptionTwo,
      }
    }
    if (creationMode === 'void') {
      postData.is_void_question = true;
    }

    startTransition(async () => {
      const result = await createPost(postData)
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
        router.push(parentId ? `/confession/${parentId}` : '/feed')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {parentId && (
          <div className="p-4 border rounded-lg bg-card/50 text-sm text-muted-foreground">
            You are replying to another confession. Your post will be added to the chain.
          </div>
        )}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{creationMode === 'void' ? 'Your Question' : 'Your Confession'}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={creationMode === 'void' ? "Ask the void a question..." : "Pour your heart out..."}
                  className="min-h-[150px] sm:min-h-[200px] text-lg"
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

        <div className="space-y-4">
          {creationMode === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setCreationMode('poll')} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Poll
              </Button>
              <Button variant="outline" onClick={() => setCreationMode('void')} className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Ask the Void
              </Button>
            </div>
          )}

          {creationMode === 'poll' && (
            <div className="p-4 border rounded-lg space-y-4 bg-card/50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Add a Poll</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setCreationMode(null)
                  form.setValue('pollOptionOne', '')
                  form.setValue('pollOptionTwo', '')
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name="pollOptionOne"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option 1</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Yes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pollOptionTwo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option 2</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {creationMode === 'void' && (
            <div className="p-4 border rounded-lg space-y-2 bg-card/50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Ask the Void</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCreationMode(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Your confession will become a question. Others can only respond with a single word, which will form a word cloud.</p>
            </div>
          )}
        </div>


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
