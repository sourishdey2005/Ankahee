import { Button } from '@/components/ui/button'
import { Feather, Terminal } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Home({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const error = searchParams?.error

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid-purple-500/10 bg-[size:30px_30px] [mask-image:linear-gradient(to_bottom,white_0%,white_75%,transparent_100%)]"></div>
      <main className="relative z-10 flex flex-col items-center text-center space-y-8">
        {error === 'anon_disabled' && (
          <Alert variant="destructive" className="max-w-2xl text-left">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              Anonymous sign-ins are disabled. To fix this, please go to your Supabase project's Authentication providers and enable the "Anonymous" provider.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center space-x-4">
          <Feather className="w-16 h-16 text-primary" />
          <h1 className="text-6xl md:text-7xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Ankahee
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium">
          Speak Freely. Stay Unknown.
        </p>
        <div className="max-w-2xl space-y-4">
          <p className="text-lg text-foreground/80">
            “Every heart has an untold story.”
          </p>
          <p className="text-muted-foreground">
            A safe space to share your deepest thoughts, secrets, and feelings without revealing who you are. All confessions vanish after 24 hours, leaving no trace.
          </p>
        </div>
        <Link href="/feed">
          <Button
            size="lg"
            className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
          >
            Enter the Void
          </Button>
        </Link>
      </main>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Built with ❤️ for the unspoken.
      </footer>
    </div>
  )
}
