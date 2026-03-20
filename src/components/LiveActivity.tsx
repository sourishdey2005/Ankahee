"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { generateAvatarDataUri } from "@/lib/utils";

export default function LiveActivity() {
  const [activeCount, setActiveCount] = useState(12);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    // Simulate real-time concurrency fluctuations
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(5, prev + delta);
      });
    }, 5000);

    // Initial avatars
    const initialAvatars = Array.from({ length: 5 }).map((_, i) => 
      generateAvatarDataUri(`user_${Math.random()}`)
    );
    setAvatars(initialAvatars);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-8 inline-flex"
    >
      <div className="flex -space-x-2">
        {avatars.map((avatar, i) => (
          <motion.img 
            key={i}
            src={avatar} 
            alt="Active User" 
            className="w-6 h-6 rounded-full border-2 border-background bg-card"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-muted-foreground">
          <span className="text-foreground">{activeCount}</span> in the sanctuary
        </span>
      </div>
    </motion.div>
  );
}
