"use client";

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
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030303] text-foreground p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-block"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-colors rounded-full overflow-visible scale-125"></div>
              <Image 
                src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png" 
                alt="Ankahee Logo" 
                width={80} 
                height={80} 
                className="relative rounded-2xl drop-shadow-[0_0_20px_rgba(255,153,51,0.4)] border border-primary/20" 
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
          >
            Ankahee
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-lg text-muted-foreground font-light tracking-wide"
          >
            Speak Freely. Stay Unknown.
          </motion.p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 mb-6 h-12 backdrop-blur-xl">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login-content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                 <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600 opacity-50"></div>
                    <CardHeader>
                      <CardTitle className="text-2xl">Welcome Back</CardTitle>
                      <CardDescription className="text-muted-foreground/80 font-normal">
                        Return to the sanctuary. Your anonymity is preserved.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LoginForm />
                    </CardContent>
                  </Card>
              </motion.div>
            ) : (
              <motion.div
                key="signup-content"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                  <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-primary opacity-50"></div>
                    <CardHeader>
                      <CardTitle className="text-2xl">Join the Void</CardTitle>
                      <CardDescription className="text-muted-foreground/80 font-normal">
                        Create an identity that remains a secret to everyone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SignupForm />
                    </CardContent>
                  </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-white/10"></span>
            End-to-End Anonymous
            <span className="w-8 h-px bg-white/10"></span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
