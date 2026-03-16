'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUser } from '@/hooks/use-user'

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

import { ImageUpload } from '@/components/ImageUpload'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'

export default function NewLetterForm() {
  const { userId } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [storageId, setStorageId] = useState<string | undefined>()

  const createConvexLetter = useMutation(api.letters.createLetter)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!userId) return;
    startTransition(async () => {
      try {
        await createConvexLetter({
          content: values.content,
          storageId: storageId as any,
        });
        
        toast({
          title: 'Success',
          description: 'Your letter has been posted in real-time.',
        })
        router.push('/letters')
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to post letter',
          variant: 'destructive',
        })
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

        <div className="space-y-4">
          <FormLabel>Attach a Memory (Optional Image)</FormLabel>
          <ImageUpload onUpload={(id) => setStorageId(id)} />
        </div>

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
