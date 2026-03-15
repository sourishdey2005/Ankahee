'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { MailPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import UnsentLetterCard from '@/components/UnsentLetterCard'
import { useAuth } from '@clerk/nextjs'

export default function LettersPage() {
  const { userId } = useAuth()
  const letters = useQuery(api.letters.getLetters, userId ? { authorId: userId } : "skip")

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Unsent Letters</h1>
          <p className="text-muted-foreground text-sm">A space for words left unspoken. Letters expire after 1 day.</p>
        </div>
        <Link href="/new/letter">
          <Button size="sm">
            <MailPlus className="mr-2 h-4 w-4" />
            Write
          </Button>
        </Link>
      </div>

      {!userId ? (
        <div className="text-center py-20">Please log in to see your letters.</div>
      ) : !letters ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : letters.length > 0 ? (
        <div className="space-y-4 px-4">
          {letters.map((letter) => (
            <UnsentLetterCard key={letter._id} letter={letter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-lg bg-card/50 mx-4">
          <h2 className="text-2xl font-headline mb-2">The Page is Blank</h2>
          <p className="text-muted-foreground">Be the first to write an unsent letter.</p>
        </div>
      )}

    </div>
  )
}
