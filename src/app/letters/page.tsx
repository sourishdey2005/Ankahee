'use client'

import { useState, useEffect } from 'react'
import { getLetters } from '@/app/actions/letters'
import { Button } from '@/components/ui/button'
import { MailPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import UnsentLetterCard from '@/components/UnsentLetterCard'
import { useUser } from '@/hooks/use-user'

export default function LettersPage() {
  const { userId } = useUser()
  const [letters, setLetters] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLetters() {
      if (!userId) return;
      try {
        const data = await getLetters(userId);
        setLetters(data);
      } catch (err) {
        console.error('Failed to fetch letters:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLetters();
  }, [userId]);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Unsent Letters</h1>
          <p className="text-muted-foreground text-sm">A space for words left unspoken. Letters expire after 72 hours.</p>
        </div>
        <Link href="/new/letter">
          <Button size="sm">
            <MailPlus className="mr-2 h-4 w-4" />
            Write
          </Button>
        </Link>
      </div>

      {!userId && !isLoading ? (
        <div className="text-center py-20">Please wait for user to load...</div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (letters && letters.length > 0) ? (
        <div className="space-y-4 px-4">
          {letters.map((letter: any) => (
            <UnsentLetterCard key={letter.id} letter={letter} />
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
