'use client'

import { useMemo } from 'react'
import ConfessionCard from '@/components/ConfessionCard'
import { useUser } from '@/hooks/use-user'

export default function ConfessionsList({ 
  posts, 
  sort 
}: { 
  posts: any[], 
  sort?: string 
}) {
  const { user } = useUser()
  
  const sortedPosts = useMemo(() => {
    const postsCopy = Array.isArray(posts) ? [...posts] : [];
    if (sort === 'popular') {
      return postsCopy.sort((a: any, b: any) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }
    if (sort === 'loved') {
        const countHearts = (reactions: any[]) => (reactions || []).filter(r => r.reaction === 'Heart').length;
        return postsCopy.sort((a: any, b: any) => countHearts(b.reactions) - countHearts(a.reactions));
    }
    return postsCopy.sort((a: any, b: any) => b.createdAt - a.createdAt);
  }, [posts, sort]);

  if (sortedPosts.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-headline mb-2">The Void is Quiet</h2>
            <p className="text-muted-foreground">No confessions found for this filter. Be the first to share one.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <ConfessionCard key={post.id} post={post} user={user} />
      ))}
    </div>
  )
}
