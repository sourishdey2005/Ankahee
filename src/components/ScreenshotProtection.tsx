'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

export default function ScreenshotProtection() {
  const [isBlurred, setIsBlurred] = useState(false)

  useEffect(() => {
    // 1. Prevent Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // 2. Prevent Common Screenshot/DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === 'PrintScreen') {
        setIsBlurred(true)
        setTimeout(() => setIsBlurred(false), 2000)
        navigator.clipboard.writeText('') // Clear clipboard
      }

      // Cmd+Shift+S, Cmd+S, Ctrl+Shift+I, etc.
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.shiftKey && e.key === 's') ||
        (e.metaKey && e.key === 's')
      ) {
        // e.preventDefault() // Can't always prevent browser defaults but we can try
      }
    }

    // 3. Blur on focus loss (anti-screenshot trick)
    const handleBlur = () => {
      setIsBlurred(true)
    }

    const handleFocus = () => {
      setIsBlurred(false)
    }

    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <AnimatePresence>
      {isBlurred && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] backdrop-blur-[50px] bg-black/60 flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4 text-white">
            <ShieldAlert className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-xl font-headline font-bold tracking-widest uppercase">Void Protection Active</p>
            <p className="text-sm text-muted-foreground">The void cannot be captured.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
