import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewLetterForm from './NewLetterForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewLetterPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/feed')
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/letters" className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Letters
        </Button>
      </Link>
      <h1 className="text-4xl font-headline font-bold mb-2">Write an Unsent Letter</h1>
      <p className="text-muted-foreground mb-8">This is a space for words left unspoken. Letters expire after 3 days.</p>
      <NewLetterForm />
    </div>
  )
}
