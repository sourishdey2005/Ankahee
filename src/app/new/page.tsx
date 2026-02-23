import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NewPostForm from './NewPostForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewPostPage() {
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
        <Link href="/feed" className="mb-8 inline-block">
            <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Feed
            </Button>
        </Link>
      <h1 className="text-4xl font-headline font-bold mb-2">Share Your Story</h1>
      <p className="text-muted-foreground mb-8">It will be gone in 24 hours. No one will know it was you.</p>
      <NewPostForm userId={session.user.id} />
    </div>
  )
}
