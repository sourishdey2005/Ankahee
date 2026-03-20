"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Share2, Maximize2, Minimize2 } from "lucide-react";
import Countdown from "./Countdown";
import { MoodTag, moodColors } from "@/lib/mood-tags";
import Echoes from "./Echoes";
import { cn } from "@/lib/utils";
import Poll from "./Poll";
import VoidQuestion from "./VoidQuestion";
import BookmarkButton from "./BookmarkButton";
import { useMemo, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { DMButton } from "./DMButton";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function ConfessionCard({
  post,
  user: propUser,
}: {
  post: any;
  user?: any;
}) {
  const { user: authUser } = useUser();
  const user = propUser || authUser;
  const moodColor = post.mood
    ? moodColors[post.mood as MoodTag] || "bg-secondary"
    : "bg-secondary";
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const getSafeTimestamp = (dateSource: any) => {
    if (!dateSource) return null;
    const d = new Date(dateSource);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  const expires_at = getSafeTimestamp(post.expiresAt) ?? (Date.now() + 24 * 60 * 60 * 1000);
  const createdAt = getSafeTimestamp(post.createdAt) ?? Date.now();
  
  const totalDuration = 24 * 60 * 60 * 1000;
  const timeLeft = expires_at - Date.now();
  const lifeProgress = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  const isExpiringSoon = useMemo(() => {
    return timeLeft > 0 && timeLeft < 60 * 60 * 1000;
  }, [timeLeft]);

  const poll = post.polls?.[0];
  const isVoidQuestion = post.isVoidQuestion;

  const isBookmarked = useMemo(() => {
    if (!user || !post.bookmarks) return false;
    return post.bookmarks.some((b: any) => b.userId === user.id);
  }, [post.bookmarks, user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/confession/${post.id}`} className="block">
        <Card
          className={cn(
            "relative border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden",
            isExpiringSoon && "border-primary/20 bg-primary/5"
          )}
        >
          {/* Expiration Progress Bar at top */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-white/5">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${lifeProgress}%` }}
              className={cn(
                "h-full transition-colors",
                isExpiringSoon ? "bg-primary animate-pulse" : "bg-primary/40"
              )}
            />
          </div>

          <CardHeader className="pb-3 pt-5">
            <div className="flex justify-between items-center w-full">
              {post.mood && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "rounded-full px-3 py-0.5 font-medium transition-transform group-hover:scale-105",
                    moodColor
                  )}
                >
                  {post.mood}
                </Badge>
              )}
              <div className={cn(
                "flex items-center space-x-2 text-xs font-mono",
                isExpiringSoon ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                <Clock className={cn("h-3 w-3", isExpiringSoon && "animate-spin-slow")} />
                <Countdown expiresAt={expires_at.toString()} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {post.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-4 border border-white/5 cursor-zoom-in group/img">
                <motion.img
                  layoutId={`post-image-${post.id}`}
                  initial={{ scale: 1.1, opacity: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={post.imageUrl}
                  alt="Story Visual"
                  className="w-full h-full object-cover transition-transform duration-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsImageExpanded(true);
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                
                {/* Maximize Icon Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )}
            
            {/* Full Screen Image Modal via Portal */}
            {isImageExpanded && typeof document !== 'undefined' && createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10 cursor-zoom-out"
                  onClick={() => setIsImageExpanded(false)}
                >
                    <motion.button
                        layout
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors z-50"
                        onClick={() => setIsImageExpanded(false)}
                    >
                        <Minimize2 className="w-6 h-6" />
                    </motion.button>

                    <motion.img
                        layoutId={`post-image-${post.id}`}
                        src={post.imageUrl}
                        alt="Full Story Visual"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                    
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-mono tracking-widest uppercase flex items-center gap-2">
                        <div className="w-8 h-px bg-white/20" />
                        Complete Vision
                        <div className="w-8 h-px bg-white/20" />
                    </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
            
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap font-light tracking-tight selection:bg-primary/30">
              {post.content}
            </p>

            <AnimatePresence>
              {poll && !isVoidQuestion && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.preventDefault()} 
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pt-2"
                >
                  <Poll poll={poll} />
                </motion.div>
              )}
              
              {isVoidQuestion && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.preventDefault()} 
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pt-2"
                >
                  <VoidQuestion
                    postId={post.id}
                    initialAnswers={post.voidAnswers || []}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between items-center text-muted-foreground pt-2 pb-5 border-t border-white/[0.05]">
            <div className="flex items-center space-x-5">
              <div className="flex items-center transform transition-transform hover:scale-110">
                <Echoes post={post} />
              </div>
              <div className="flex items-center space-x-2 text-sm hover:text-foreground transition-colors group/msg">
                <MessageSquare className="h-4 w-4 group-hover/msg:animate-bounce" />
                <span className="font-medium">{commentCount}</span>
              </div>
              {post.authorId && user && user.id !== post.authorId && (
                <div 
                  onClick={(e) => e.preventDefault()} 
                  onKeyDown={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <DMButton
                    targetUserId={post.authorId}
                    size="xs"
                    variant="ghost"
                    label=""
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <button 
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.share?.({
                    title: 'Confession on Ankahee',
                    url: `${window.location.origin}/confession/${post.id}`
                  }).catch(() => {});
                }}
              >
                <Share2 className="h-4 w-4" />
              </button>
              {user && (
                <div onClick={(e) => e.preventDefault()} onKeyDown={(e) => e.stopPropagation()}>
                  <BookmarkButton
                    postId={post.id}
                    isBookmarked={isBookmarked}
                  />
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
