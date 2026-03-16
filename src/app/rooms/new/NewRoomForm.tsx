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
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'

export default function NewRoomForm() {
  const { userId } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [storageId, setStorageId] = useState<string | undefined>()

  const createConvexRoom = useMutation(api.rooms.createRoom)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!userId) return;
    startTransition(async () => {
      try {
        const roomId = await createConvexRoom({
          name: values.name,
          createdBy: userId,
          isDM: false,
          storageId: storageId as any,
        });

        toast({
          title: 'Success',
          description: 'Your room has been created in real-time.',
        })
        router.push(`/rooms/${roomId}`)
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
          <ImageUpload onUpload={(id) => setStorageId(id)} />
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
