import { Button } from '@/components/ui/button'
import {
  Feather,
  HeartHandshake,
  Hourglass,
  Lock,
  MessagesSquare,
  PenSquare,
  Tags,
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-grid-purple-500/10 bg-[size:30px_30px] [mask-image:linear-gradient(to_bottom,white_0%,white_75%,transparent_100%)]"></div>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 py-20 md:py-32 px-4">
        <div className="flex items-center space-x-4 animate-in fade-in-0 slide-in-from-top-12 duration-1000">
          <Feather className="w-16 h-16 text-primary" />
          <h1 className="text-6xl md:text-7xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Ankahee
          </h1>
        </div>
        <div className="animate-in fade-in-0 slide-in-from-top-16 duration-1000 delay-200">
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Speak Freely. Stay Unknown.
          </p>
          <div className="max-w-2xl space-y-4 mt-4">
            <p className="text-lg text-foreground/80">
              “Every heart has an untold story.”
            </p>
            <p className="text-muted-foreground">
              A safe space to share your deepest thoughts, secrets, and feelings
              without revealing who you are. All confessions vanish after 24
              hours, leaving no trace.
            </p>
          </div>
        </div>
        <div className="animate-in fade-in-0 zoom-in-95 duration-1000 delay-400">
          <Link href="/feed">
            <Button
              size="lg"
              className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
            >
              Enter the Void
            </Button>
          </Link>
        </div>
      </main>

      {/* How it works Section */}
      <section className="relative z-10 w-full py-20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                <PenSquare className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">
                Share Anonymously
              </h3>
              <p className="text-muted-foreground">
                Write down what's on your mind. No names, no profiles. Just
                pure, unadulterated expression.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                <Hourglass className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">
                Gone in 24 Hours
              </h3>
              <p className="text-muted-foreground">
                Every post has a 24-hour lifespan. After that, it disappears
                forever, ensuring your privacy.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                <HeartHandshake className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">
                Read and React
              </h3>
              <p className="text-muted-foreground">
                Explore a feed of fleeting thoughts from others. Offer support or
                simply know you're not alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold text-center mb-12">
            Features for Your Peace of Mind
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Tags className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold">
                  Mood Tagging
                </h3>
                <p className="text-muted-foreground">
                  Categorize your confessions with moods like 'Sad', 'Love', or
                  'Secret' to find and share similar feelings.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <MessagesSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold">
                  Anonymous Comments
                </h3>
                <p className="text-muted-foreground">
                  Engage in conversations without revealing your identity. A
                  truly judgment-free zone.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground">
                  We use secure authentication, and your data is deleted after 24
                  hours. Your privacy is our priority.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Feather className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold">
                  Ephemeral by Design
                </h3>
                <p className="text-muted-foreground">
                  The fleeting nature of posts encourages raw, in-the-moment
                  sharing without the fear of a permanent digital footprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 w-full py-20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline font-bold mb-4">
            Ready to Share?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            The void is listening. Your story is safe here. Take a breath, and
            let it out.
          </p>
          <Link href="/feed">
            <Button
              size="lg"
              className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
            >
              Enter the Void
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-4 text-sm text-muted-foreground">
        Built with ❤️ for the unspoken.
      </footer>
    </div>
  )
}
