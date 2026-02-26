
'use client'

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
import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  // Hero parallax and fade effects
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.85])
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -80])

  // Multi-layered stars parallax
  const starsY1 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const starsY2 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const starsY3 = useTransform(scrollYProgress, [0, 1], [0, -450])

  const springScale = useSpring(scale, { stiffness: 100, damping: 30 })

  return (
    <div ref={targetRef} className="flex flex-col min-h-screen bg-[#050510] text-[#E0E0E0] overflow-x-hidden selection:bg-primary/30 scroll-smooth">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.06),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        {/* Parallax Star Layers */}
        <motion.div style={{ y: starsY1 }} className="absolute inset-0">
          <StarLayer count={60} size="w-0.5 h-0.5" opacity="opacity-15" color="bg-white" />
        </motion.div>
        <motion.div style={{ y: starsY2 }} className="absolute inset-0">
          <StarLayer count={40} size="w-1 h-1" opacity="opacity-25" color="bg-primary/20" />
        </motion.div>
        <motion.div style={{ y: starsY3 }} className="absolute inset-10">
          <StarLayer count={20} size="w-1.5 h-1.5" opacity="opacity-30" color="bg-purple-500/20" />
        </motion.div>

        {/* Floating Atmospheric Nebula */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-primary/5 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-900/10 blur-[130px] rounded-full"
        />
      </div>

      {/* Persistent Navigation */}
      <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center"
        >
        <Link href="/" className="flex items-center space-x-2 group shrink-0 cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-500"
          >
            <Feather className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="font-headline font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Ankahee</span>
        </Link>
        <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 px-6 font-medium transition-all">
              Login
            </Button>
        </Link>
      </motion.nav>

      {/* High-Fidelity Hero Section */}
      <motion.main
        style={{ opacity, scale: springScale, y }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-125"></div>
            <Image
              src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png"
              alt="Ankahee Logo"
              width={160}
              height={160}
              className="relative drop-shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:drop-shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-500"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-headline font-extrabold mb-6 tracking-tighter"
          initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-300 to-primary/70">Ankahee</span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-primary font-semibold tracking-wider font-headline mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Speak Freely. Stay Unknown.
        </motion.p>
        
        <motion.p 
          className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          A digital sanctuary to release your deepest thoughts without a trace. Where every word is heard, then forgotten.
        </motion.p>

        <motion.div
          className="mt-16 flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link href="/feed">
            <Button
              size="lg"
              className="px-10 py-8 font-bold text-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-2xl shadow-[0_10px_30px_-5px_rgba(255,153,51,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(255,153,51,0.5)] group relative overflow-hidden"
            >
              Enter the Void
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-10 py-8 font-bold text-2xl border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 rounded-2xl cursor-pointer group"
          >
            <a href="#how-it-works">
              How It Works
              <ChevronDown className="ml-2 h-5 w-5 opacity-50 group-hover:translate-y-1 group-hover:opacity-100 transition-all" />
            </a>
          </Button>
        </motion.div>
      </motion.main>

      {/* Interactive Feature Grid Section */}
      <SectionWrapper id="how-it-works" className="py-40 bg-black/40 backdrop-blur-3xl border-y border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-white mb-6 tracking-tight">
              The Architecture of Anonymity
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)]"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            <FeatureCard
              icon={<PenSquare className="w-9 h-9" />}
              title="Share Anonymously"
              description="No accounts required to browse. Your expression is detached from your identity, allowing for absolute honesty and unfiltered truth."
              index={0}
            />
            <FeatureCard
              icon={<Hourglass className="w-9 h-9" />}
              title="Gone in 24 Hours"
              description="Digital impermanence is our heart. Every post and interaction dissolves back into the void precisely 24 hours after birth."
              index={1}
            />
            <FeatureCard
              icon={<HeartHandshake className="w-9 h-9" />}
              title="Listen and Exist"
              description="Discover the raw, authentic pulse of the human condition. Find connection in the shared silence without the weight of judgment."
              index={2}
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Advanced Animated Feature Showcase */}
      <SectionWrapper className="py-40 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-48">
            <FeatureRow
              reversed={false}
              icon={<Sparkles className="w-14 h-14 text-primary" />}
              title="AI-Powered Mood Analysis"
              description="Our specialized neural flows analyze the subtext and emotional frequency of your confession, automatically weaving the perfect mood tags to ensure your story reaches the right minds."
            />
            <FeatureRow
              reversed={true}
              icon={<MessagesSquare className="w-14 h-14 text-primary" />}
              title="Identity-Shifting Dialogue"
              description="Engage in profound conversations through our fluid commenting architecture. Your identity transforms in every thread, ensuring your past never anchors your present."
            />
            <FeatureRow
              reversed={false}
              icon={<SearchX className="w-14 h-14 text-primary" />}
              title="Forbidden Indexing"
              description="Ankahee exists beyond the reach of search engines and web crawlers. What is shared in the sanctuary remains within its walls—until the clock reaches zero."
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Immersive Philosophy Section */}
      <SectionWrapper className="py-52 border-t border-white/5 bg-gradient-to-b from-transparent to-black/60 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.03),transparent_70%)] pointer-events-none"
        />
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-headline font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic leading-tight"
          >
            "In permanence, we hide.<br />In transience, we find freedom."
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="space-y-10 text-xl md:text-2xl text-muted-foreground font-extralight leading-relaxed"
          >
            <p className="hover:text-white transition-colors duration-700">
              Ankahee is a response to the digital panopticon. We believe that some truths are too heavy to carry on a permanent profile, but too important to be kept silent forever.
            </p>
            <p className="hover:text-white transition-colors duration-700">
              Our sanctuary is built for the raw, the real, and the deep. It is not for vanity or visibility—it is for the quiet relief of being heard without the weight of being watched.
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Professional Footer */}
      <footer className="relative z-10 bg-black py-24 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Feather className="h-6 w-6 text-primary" />
            </div>
            <span className="font-headline font-bold text-2xl">Ankahee</span>
          </motion.div>
          <div className="text-muted-foreground text-sm tracking-widest uppercase font-light opacity-50 hover:opacity-100 transition-opacity duration-700">
            &copy; {new Date().getFullYear()} Ankahee Sanctuary. All paths lead to the void.
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs text-white/20 tracking-[.3em] uppercase hidden sm:block">Architect</span>
            <motion.a
              href="https://sourishdeyportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 5, color: "#7C3AED" }}
              className="font-medium text-lg text-white/80 transition-all flex items-center group"
            >
              Sourish Dey
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StarLayer({ count, size, opacity, color }: { count: number, size: string, opacity: string, color: string }) {
  const [stars, setStars] = useState<{ top: string, left: string }[]>([])

  useEffect(() => {
    const generatedStars = [...Array(count)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }))
    setStars(generatedStars)
  }, [count])

  if (stars.length === 0) return null

  return (
    <div className="absolute inset-0">
      {stars.map((star, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${size} ${color} ${opacity}`}
          style={{
            top: star.top,
            left: star.left,
          }}
        />
      ))}
    </div>
  )
}

function SectionWrapper({ id, children, className }: { id?: string, children: React.ReactNode, className?: string }) {
  return (
    <section id={id} className={`relative z-10 w-full ${className}`}>
      {children}
    </section>
  )
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{
        y: -10,
        borderColor: "hsla(var(--primary), 0.5)",
        boxShadow: "0 20px 40px -10px hsla(var(--primary), 0.2)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="p-10 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-xl group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
      <div className="relative z-10">
        <motion.div 
            className="w-20 h-20 rounded-[1.5rem] bg-black/60 border border-white/5 flex items-center justify-center text-primary mb-10 shadow-lg group-hover:bg-primary/20 transition-all duration-500"
            whileHover={{ scale: 1.1, rotate: -5 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-3xl font-headline font-bold text-white mb-6 group-hover:text-primary transition-colors duration-500">
          {title}
        </h3>
        <p className="text-muted-foreground text-lg leading-relaxed font-light group-hover:text-white/80 transition-colors duration-500">
          {description}
        </p>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 group-hover:bg-primary/10 transition-all duration-1000" />
    </motion.div>
  );
}

function FeatureRow({ icon, title, description, reversed }: { icon: React.ReactNode, title: string, description: string, reversed: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-20%" })

  return (
    <div ref={ref} className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 lg:gap-24 group`}>
      <motion.div
        initial={{ opacity: 0, x: reversed ? 60 : -60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 space-y-8"
      >
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-block p-5 rounded-[2rem] bg-primary/5 border border-primary/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(124,58,237,0.1)] cursor-default"
        >
          {icon}
        </motion.div>
        <h3 className="text-4xl lg:text-5xl font-headline font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-700 leading-tight">
          {title}
        </h3>
        <p className="text-xl text-muted-foreground leading-relaxed font-extralight italic">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 w-full min-h-[400px] md:min-h-0 md:aspect-[4/3] rounded-[3rem] bg-gradient-to-tr from-white/10 via-white/5 to-transparent border border-white/10 p-1.5 shadow-2xl relative"
      >
        <div className="w-full h-full rounded-[2.8rem] bg-[#0A0A1F] flex items-center justify-center relative overflow-hidden group-hover:shadow-[0_0_80px_rgba(124,58,237,0.15)] transition-shadow duration-1000">
          {/* Scanning Line Effect */}
          <motion.div
            initial={{ y: "-10%" }}
            animate={isInView ? { y: "110%" } : {}}
            transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut", repeatType: 'mirror' }}
            className="absolute left-0 right-0 h-1.5 bg-primary/60 blur-md z-10"
          />
          <motion.div
            initial={{ y: "-10%" }}
            animate={isInView ? { y: "110%" } : {}}
            transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut", repeatType: 'mirror' }}
            className="absolute left-0 right-0 h-px bg-primary z-10"
          />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-4/5 h-4/5 border border-white/10 rounded-full opacity-20 border-dashed"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-3/5 h-3/5 border border-primary/30 rounded-full opacity-40 border-double"
          />
          <div className="absolute w-1/3 h-1/3 bg-primary/20 blur-[100px] rounded-full" />
          <motion.div
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="text-white/60 font-headline font-bold text-sm tracking-[0.8em] uppercase text-center px-4"
          >
            Scanning The Void
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
