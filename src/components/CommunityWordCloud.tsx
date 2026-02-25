'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BrainCircuit } from 'lucide-react'

type WordCloudData = {
  text: string
  value: number
}

export default function CommunityWordCloud({
  data,
}: {
  data: WordCloudData[]
}) {
  const safeWords = useMemo(() => {
    if (!Array.isArray(data)) return []

    const filtered = data
      .filter(
        (w) =>
          w &&
          typeof w.text === 'string' &&
          w.text.trim() !== '' &&
          typeof w.value === 'number' &&
          w.value > 0
      )
      .slice(0, 40)

    const max = Math.max(...filtered.map((w) => w.value), 1)

    return filtered.map((w) => ({
      ...w,
      size: 14 + (w.value / max) * 36, // dynamic font scaling
    }))
  }, [data])

  if (!safeWords.length) return null

  const colors = [
    'text-orange-500',
    'text-purple-500',
    'text-yellow-500',
    'text-red-500',
    'text-blue-500',
    'text-green-500',
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <BrainCircuit className="h-6 w-6 text-primary" />
          Community Pulse
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full flex flex-wrap items-center justify-center gap-3 overflow-hidden">
          {safeWords.map((word, index) => (
            <span
              key={word.text}
              className={`font-bold transition-transform duration-300 hover:scale-125 ${colors[index % colors.length]
                }`}
              style={{
                fontSize: `${word.size}px`,
              }}
            >
              {word.text}
            </span>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          A snapshot of the most-used words in the last 24 hours.
        </p>
      </CardContent>
    </Card>
  )
}