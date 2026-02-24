import { Button } from '@/components/ui/button'
import {
  Feather,
  HeartHandshake,
  Hourglass,
  MessagesSquare,
  PenSquare,
  Sparkles,
  SearchX,
  ArrowRight,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050510] text-[#E0E0E0] overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        {/* Animated Particles/Stars effect using CSS */}
        <div className="absolute inset-0 opacity-30 select-none pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-[30%] left-[80%] w-1 h-1 bg-white rounded-full animate-pulse delay-75"></div>
          <div className="absolute top-[70%] left-[40%] w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-[50%] left-[10%] w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-[85%] left-[90%] w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-2 group">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:border-primary/50 transition-colors">
            <Feather className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">Ankahee</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-white transition-colors">
            Login
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 max-w-5xl mx-auto">
        <div className="relative mb-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <Image
            src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png"
            alt="Ankahee Logo"
            width={160}
            height={160}
            className="relative drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]"
            priority
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-top-12 duration-1000 delay-100 italic">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Ankahee</span>
        </h1>

        <div className="animate-in fade-in slide-in-from-top-16 duration-1000 delay-200">
          <p className="text-2xl md:text-3xl text-primary font-medium mb-8 tracking-wide font-headline">
            Speak Freely. Stay Unknown.
          </p>
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-xl text-white/90 font-light leading-relaxed">
              “Every heart has an <span className="text-primary italic font-semibold underline decoration-primary/30 underline-offset-4">untold story</span>.”
            </p>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed border-l-2 border-primary/20 pl-4">
              A refined sanctuary to release your deepest secrets without a trace.
              Our ephemeral architecture ensures your voice is heard, then forgotten.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-400">
          <Link href="/feed">
            <Button
              size="lg"
              className="px-8 py-7 font-bold text-xl bg-white text-black hover:bg-white/90 transition-all duration-500 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] group"
            >
              Enter the Void
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-7 font-bold text-xl border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 rounded-2xl cursor-pointer"
          >
            <a href="#how-it-works">How It Works</a>
          </Button>
        </div>

        <a
          href="#how-it-works"
          className="mt-20 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center w-full"
        >
          <ChevronDown className="h-8 w-8 text-white/50" />
        </a>
      </main>

      {/* How it works Section */}
      <section id="how-it-works" className="relative z-10 w-full py-32 bg-[#08081A]/80 backdrop-blur-3xl border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-white mb-4">
              The Architecture of Anonymity
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<PenSquare className="w-8 h-8" />}
              title="Share Anonymously"
              description="No accounts required to browse. Your expression is detached from your identity, allowing for absolute honesty."
              index={0}
            />
            <FeatureCard
              icon={<Hourglass className="w-8 h-8" />}
              title="Gone in 24 Hours"
              description="Digital impermanence is our core. Every post and interaction dissolves into the void after one day."
              index={1}
            />
            <FeatureCard
              icon={<HeartHandshake className="w-8 h-8" />}
              title="Listen and Exist"
              description="Discover the raw, unfiltered pulse of the human condition. Find connection without judgment."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="relative z-10 w-full py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent_50%)]"></div>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-32">
            <FeatureRow
              reversed={false}
              icon={<Sparkles className="w-12 h-12 text-primary" />}
              title="AI-Powered Mood Analysis"
              description="Our specialized AI flows listen to the subtext of your confession, automatically suggesting the perfect mood tag to help your story resonate with the right frequency."
            />
            <FeatureRow
              reversed={true}
              icon={<MessagesSquare className="w-12 h-12 text-primary" />}
              title="Identity-Shifting Dialogue"
              description="Engage in deep conversations through our unique commenting system. Your identity shifts in every thread, ensuring your past interactions never define your current presence."
            />
            <FeatureRow
              reversed={false}
              icon={<SearchX className="w-12 h-12 text-primary" />}
              title="Forbidden Indexing"
              description="Ankahee is invisible to search engines and permanent web crawlers. What is shared here, stays here—until the clock runs out."
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative z-10 w-full py-40 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic">
            "In permanence, we hide. In transience, we find freedom."
          </h2>
          <div className="space-y-6 text-xl text-muted-foreground font-light leading-relaxed">
            <p>
              Ankahee is a response to the digital panopticon. We believe that some truths are too heavy to carry on a permanent profile, but too important to be kept silent forever.
            </p>
            <p>
              Our sanctuary is built for the raw, the real, and the deep. It is not for vanity or visibility—it is for the quiet relief of being heard without the weight of being watched.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black py-16 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <Feather className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold text-lg">Ankahee</span>
          </div>
          <div className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Ankahee Sanctuary. All paths lead to the void.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-white/30 tracking-widest uppercase">Designed & Built by</span>
            <a href="https://sourishdeyportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:text-primary transition-colors">Sourish Dey</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
  return (
    <div className={`p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-${(index + 1) * 200}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-2xl">
          {icon}
        </div>
        <h3 className="text-2xl font-headline font-bold text-white mb-4 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, description, reversed }: { icon: React.ReactNode, title: string, description: string, reversed: boolean }) {
  return (
    <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 group`}>
      <div className="flex-1 space-y-6">
        <div className="inline-block p-4 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-3xl group-hover:scale-110 transition-transform duration-700 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
          {icon}
        </div>
        <h3 className="text-3xl font-headline font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-500">
          {title}
        </h3>
        <p className="text-xl text-muted-foreground leading-relaxed font-light">
          {description}
        </p>
      </div>
      <div className="flex-1 w-full aspect-square md:aspect-video rounded-[3rem] bg-gradient-to-tr from-primary/20 via-white/5 to-transparent border border-white/10 p-1">
        <div className="w-full h-full rounded-[2.8rem] bg-[#0A0A1F] flex items-center justify-center relative overflow-hidden group-hover:shadow-[0_0_50px_rgba(124,58,237,0.1)] transition-shadow duration-700">
          <div className="w-3/4 h-3/4 border border-white/5 rounded-full animate-[spin_20s_linear_infinite] opacity-20"></div>
          <div className="absolute w-1/2 h-1/2 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite_reverse] opacity-40"></div>
          <div className="absolute w-1/4 h-1/4 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="text-white/40 font-headline font-bold text-xs tracking-[0.5em] uppercase animate-pulse">Scanning The Void</div>
        </div>
      </div>
    </div>
  );
}


