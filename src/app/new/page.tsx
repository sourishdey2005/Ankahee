import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewPostForm from './NewPostForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ prompt?: string, parent_id?: string }> }) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/feed')
  }

  const promptText = resolvedSearchParams.prompt || ''
  const parentId = resolvedSearchParams.parent_id

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href={parentId ? `/confession/${parentId}` : '/feed'} className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {parentId ? 'Back to Confession' : 'Back to Feed'}
        </Button>
      </Link>
      <h1 className="text-4xl font-headline font-bold mb-2">{parentId ? 'Reply with your story' : 'Share Your Story'}</h1>
      <p className="text-muted-foreground mb-8">It will be gone in 24 hours. No one will know it was you.</p>
      <NewPostForm userId={session.user.id} promptText={promptText} parentId={parentId} />
    </div>
  )
}
