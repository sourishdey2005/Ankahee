"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2, User, Clock, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { createStoryAction, getStoriesAction } from "@/app/actions/stories";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchStories = useCallback(async () => {
    const result = await getStoriesAction();
    if (result.success) {
      setStories(result.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createStoryAction({
        text,
        authorId: "anonymous-" + Math.random().toString(36).substr(2, 9),
        authorName: "Anonymous Soul",
        imageUrl: imageUrl,
      });

      if (result.success) {
        setText("");
        setImageUrl(undefined);
        toast({
          title: "Story Shared",
          description: "Your fragment has been released into the void.",
        });
        fetchStories();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not share your story.",
        });
      }
    } catch (error) {
      console.error("Failed to create story", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const prevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#E0E0E0] selection:bg-primary/30 py-8 px-4">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-headline font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
        >
          Ephemeral Echoes
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-lg mx-auto"
        >
          Moments that bloom and vanish. Shared with the world, then forgotten by time.
        </motion.p>
      </header>

      {/* Horizontal Stories Bar */}
      <div className="container mx-auto max-w-4xl mb-12">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {/* Add Story Button */}
          <div className="flex-shrink-0 snap-start text-center group cursor-pointer" onClick={() => document.getElementById('story-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500 mb-2">
              <div className="w-full h-full rounded-full bg-[#050510] flex items-center justify-center border-2 border-[#050510]">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">+</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium">Add Yours</span>
          </div>

          {loading ? (
             [...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-20 h-20 rounded-full bg-white/5 animate-pulse" />
             ))
          ) : (
            stories.map((story, index) => (
              <div 
                key={story.id} 
                className="flex-shrink-0 snap-start text-center group cursor-pointer"
                onClick={() => setActiveStoryIndex(index)}
              >
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500 mb-2 group-hover:p-1.5 transition-all">
                  <div className="w-full h-full rounded-full bg-[#050510] overflow-hidden border-2 border-[#050510]">
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-purple-900/40 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium truncate w-20 block">{story.authorName}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Story Section */}
      <div id="story-form" className="container mx-auto max-w-xl">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem]">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Release a Moment
              </h2>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Input
                  placeholder="Whisper something to the void..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 text-lg focus-visible:ring-primary/40 rounded-xl"
                />
                <ImageUpload onUpload={(url) => setImageUrl(url)} />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Send className="h-6 w-6 mr-2" />}
                Share Fragment
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="relative w-full max-w-2xl aspect-[9/16] md:max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Progress Bar Container */}
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                {stories.map((_, idx) => (
                  <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: idx === activeStoryIndex ? "100%" : (idx < activeStoryIndex ? "100%" : "0%") }}
                      transition={{ duration: idx === activeStoryIndex ? 5 : 0, ease: "linear" }}
                      onAnimationComplete={() => {
                        if (idx === activeStoryIndex) nextStory();
                      }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setActiveStoryIndex(null)}
                className="absolute top-8 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Content */}
              <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
                {stories[activeStoryIndex].imageUrl ? (
                  <img 
                    src={stories[activeStoryIndex].imageUrl} 
                    alt="" 
                    className="w-full h-full object-contain" // VISIBLE COMPLETELY
                  />
                ) : (
                  <div className="text-center p-12">
                    <p className="text-3xl md:text-4xl font-headline font-bold leading-tight">
                      {stories[activeStoryIndex].text}
                    </p>
                  </div>
                )}

                {/* Text Overlay for pictures */}
                {stories[activeStoryIndex].imageUrl && (
                  <div className="absolute bottom-20 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                     <p className="text-xl md:text-2xl font-headline font-bold text-white leading-tight drop-shadow-lg">
                      {stories[activeStoryIndex].text}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-black flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{stories[activeStoryIndex].authorName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stories[activeStoryIndex].createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  Ephemeral
                </Badge>
              </div>

              {/* Navigation Regions */}
              <div className="absolute inset-0 z-10 flex">
                <div className="w-1/3 h-full cursor-w-resize" onClick={prevStory} />
                <div className="w-2/3 h-full cursor-e-resize" onClick={nextStory} />
              </div>

              {/* Navigation Buttons for Desktop */}
              <div className="hidden md:block">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevStory(); }}
                  className="absolute left-[-80px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-20"
                  disabled={activeStoryIndex === 0}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextStory(); }}
                  className="absolute right-[-80px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

