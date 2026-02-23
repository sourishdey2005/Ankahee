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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="absolute inset-0 bg-grid-purple-500/10 bg-[size:30px_30px] [mask-image:linear-gradient(to_bottom,white_0%,white_75%,transparent_100%)]"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center space-x-4 mb-8">
            <Feather className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Ankahee
            </h1>
        </div>
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
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
            <Card>
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
