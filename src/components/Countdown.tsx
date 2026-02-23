'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const expires = new Date(expiresAt)
      const now = new Date()
      if (expires > now) {
        setTimeLeft(formatDistanceToNow(expires, { addSuffix: true }))
      } else {
        setTimeLeft('Expired')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  return <span>{timeLeft}</span>
}
