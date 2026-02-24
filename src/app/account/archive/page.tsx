import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tables } from '@/lib/supabase/types'
import ArchivedPostCard from '@/components/ArchivedPostCard'

export const revalidate = 0

type ArchivedPost = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
}

export default async function ArchivePage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/feed')
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, comments(count), reactions(*)')
    .eq('user_id', session.user.id)
    .lt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived posts:', error)
  }

  const archivedPosts: ArchivedPost[] = (posts as any) || [];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Link href="/feed" className="mb-8 inline-block">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">My Archive</h1>
          <p className="text-muted-foreground">A private record of your past confessions. Only you can see this.</p>
        </div>

        {archivedPosts.length > 0 ? (
          <div className="space-y-4">
            {archivedPosts.map(post => (
              <ArchivedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-lg bg-card/50">
            <h2 className="text-2xl font-headline mb-2">The Past is a Blank Page</h2>
            <p className="text-muted-foreground">You don't have any expired confessions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
