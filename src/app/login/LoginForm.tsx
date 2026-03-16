'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export default function LoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const syncUser = useMutation(api.users.syncUser)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await signIn.create({
          identifier: values.email,
          password: values.password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          
          // Sync to Convex
          try {
            await syncUser({
              tokenIdentifier: result.userData?.id || result.identifier || values.email,
              name: values.email.split('@')[0],
              email: values.email
            })
          } catch (syncErr) {
            console.error("Convex sync failed:", syncErr)
          }

          router.push('/feed')
        } else {
          console.error(JSON.stringify(result, null, 2))
          toast({
            title: 'Login Incomplete',
            description: 'Please check your information or try again.',
            variant: 'destructive',
          })
        }
      } catch (err: any) {
        toast({
          title: 'Login Failed',
          description: err.errors?.[0]?.message || 'An error occurred during sign in.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground" 
          disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  )
}
