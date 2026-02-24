import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NewRoomForm from './NewRoomForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewRoomPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/feed')
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
        <Link href="/rooms" className="mb-8 inline-block">
            <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
            </Button>
        </Link>
      <h1 className="text-4xl font-headline font-bold mb-2">Create a New Room</h1>
      <p className="text-muted-foreground mb-8">Rooms are public and expire after 24 hours.</p>
      <NewRoomForm />
    </div>
  )
}
