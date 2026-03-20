'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('Unknown');
      return;
    }

    const updateCountdown = () => {
      try {
        const expires = !isNaN(Number(expiresAt)) 
          ? new Date(Number(expiresAt)) 
          : new Date(expiresAt);

        if (isNaN(expires.getTime())) {
          setTimeLeft('Invalid date');
          return;
        }
        const now = new Date()
        if (expires > now) {
          setTimeLeft(formatDistanceToNow(expires, { addSuffix: true }))
        } else {
          setTimeLeft('Expired')
        }
      } catch {
        setTimeLeft('Error');
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  return <span>{timeLeft || 'Loading...'}</span>
}
