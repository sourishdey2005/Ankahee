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
import { Feather } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-purple-950/20 to-background bg-[length:200%_auto] animate-background-pan"></div>
      
      <div className="relative z-10 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-500 w-full">
        <div className="flex items-center justify-center space-x-4 mb-8">
            <Feather className="w-12 h-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Ankahee
            </h1>
        </div>
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your confessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to start sharing anonymously.
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
