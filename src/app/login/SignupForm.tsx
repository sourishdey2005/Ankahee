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
import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

const formSchema = z
  .object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export default function SignupForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [isPending, startTransition] = useTransition()
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const { toast } = useToast()
  const router = useRouter()
  const syncUser = useMutation(api.users.syncUser)

  console.log("SignupForm rendered. Clerk isLoaded:", isLoaded, "Key exists:", !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await signUp.create({
          emailAddress: values.email,
          password: values.password,
        })

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setVerifying(true)
        toast({
          title: 'Verification Sent',
          description: 'Please check your email for a verification code.',
        })
      } catch (err: any) {
        toast({
          title: 'Sign Up Failed',
          description: err.errors?.[0]?.message || 'An error occurred during sign up.',
          variant: 'destructive',
        })
      }
    })
  }

  async function onVerify(e: React.FormEvent) {
    // Clerk loading state is handled by the page-level overlay
    startTransition(async () => {
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code,
        })

        if (completeSignUp.status === 'complete') {
          await setActive({ session: completeSignUp.createdSessionId })
          
          try {
            await syncUser({
              tokenIdentifier: completeSignUp.createdUserId || completeSignUp.emailAddress || 'anonymous',
              name: form.getValues('email').split('@')[0],
              email: form.getValues('email')
            })
          } catch (syncErr) {
            console.error("Convex sync failed:", syncErr)
          }

          router.push('/feed')
        } else {
          console.error(JSON.stringify(completeSignUp, null, 2))
          toast({
            title: 'Verification Failed',
            description: 'The code you entered is invalid.',
            variant: 'destructive',
          })
        }
      } catch (err: any) {
        toast({
          title: 'Verification Error',
          description: err.errors?.[0]?.message || 'An error occurred during verification.',
          variant: 'destructive',
        })
      }
    })
  }

  if (verifying) {
    return (
      <form onSubmit={onVerify} className="space-y-4">
        <div className="space-y-2">
          <FormLabel>Verification Code</FormLabel>
          <Input 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder="123456" 
            className="text-center text-lg tracking-[1em]"
          />
          <p className="text-xs text-muted-foreground text-center">Enter the code sent to your email.</p>
        </div>
        <Button 
          type="submit" 
          className="w-full font-semibold bg-gradient-to-r from-primary to-purple-600" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
      </form>
    )
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  )
}
