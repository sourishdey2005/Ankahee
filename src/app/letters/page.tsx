import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { MailPlus } from 'lucide-react'
import Link from 'next/link'
import UnsentLetterCard from '@/components/UnsentLetterCard'

export const revalidate = 0

type Letter = Tables<'letters'>

export default async function LettersPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: letters, error } = await supabase
    .from('letters')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching letters:', error)
  }

  const initialLetters: Letter[] = letters || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
       <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Unsent Letters</h1>
            <p className="text-muted-foreground">A space for words left unspoken. Letters expire after 3 days.</p>
        </div>
        <Link href="/new/letter">
            <Button>
                <MailPlus className="mr-2 h-4 w-4" />
                Write a Letter
            </Button>
        </Link>
      </div>

      {initialLetters.length > 0 ? (
        <div className="space-y-4">
          {initialLetters.map((letter) => (
            <UnsentLetterCard key={letter.id} letter={letter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-lg bg-card/50">
          <h2 className="text-2xl font-headline mb-2">The Page is Blank</h2>
          <p className="text-muted-foreground">Be the first to write an unsent letter.</p>
        </div>
      )}

    </div>
  )
}
