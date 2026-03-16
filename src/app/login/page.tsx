'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import Image from 'next/image'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { isLoaded: signInLoaded } = useSignIn()
  const { isLoaded: signUpLoaded } = useSignUp()

  const isLoaded = signInLoaded && signUpLoaded

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-headline font-bold text-white tracking-widest animate-pulse">
                WHISPERING TO THE VOID...
              </h2>
              <p className="text-muted-foreground text-sm mt-2">Preparing your digital sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-950/10 to-background bg-[length:200%_auto] animate-background-pan z-[-1]"></div>


      <div className="relative z-10 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-500 w-full text-center">
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                <Image src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png" alt="Ankahee Logo" width={64} height={64} className="rounded-2xl drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]" />
                <h1 className="text-4xl sm:text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                    Ankahee
                </h1>
            </div>
            <p className="mt-4 text-lg text-muted-foreground">Join the sanctuary. Your stories are safe here.</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 bg-card/80">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <Card className="bg-card/50 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to return to the void.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <Card className="bg-card/50 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Create Your Anonymous Account</CardTitle>
                <CardDescription>
                  Your identity remains a secret.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignupForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
