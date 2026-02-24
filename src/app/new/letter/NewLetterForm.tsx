'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createLetter } from '@/actions'

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
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  content: z.string().min(20, 'Must be at least 20 characters.').max(5000, 'Cannot exceed 5000 characters.'),
})

export default function NewLetterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await createLetter(values)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Your letter has been posted.',
        })
        router.push('/letters')
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
              <FormLabel>Your Unsent Letter</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write what you could never send..."
                  className="min-h-[250px] sm:min-h-[400px] text-lg"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <FormMessage />
                <span>{field.value.length} / 5000</span>
              </div>
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
          Post Letter
        </Button>
      </form>
    </Form>
  )
}
