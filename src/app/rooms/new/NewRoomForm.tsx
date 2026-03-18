'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUser } from '@/hooks/use-user'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  name: z.string().min(3, 'Must be at least 3 characters.').max(50, 'Cannot exceed 50 characters.'),
})

import { ImageUpload } from '@/components/ImageUpload'
import { useState } from 'react'
import { createRoom } from '@/app/actions/rooms'

export default function NewRoomForm() {
  const { userId } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [imageUrl, setImageUrl] = useState<string | undefined>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!userId) {
        toast({ title: 'User not ready', description: 'Please wait...', variant: 'destructive' });
        return;
    }
    startTransition(async () => {
      try {
        const room = await createRoom({
          name: values.name,
          createdBy: userId,
          isDM: false,
          imageUrl: imageUrl,
        });

        toast({
          title: 'Success',
          description: 'Your room has been created in the void.',
        })
        router.push(`/rooms/${room.id}`)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create room',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Late Night Thoughts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Room Cover Image (Optional)</FormLabel>
          <ImageUpload onUpload={(url) => setImageUrl(url)} />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full font-bold text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Room
        </Button>
      </form>
    </Form>
  )
}
