'use client'

import { useMemo } from 'react'
import ConfessionCard from '@/components/ConfessionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@/hooks/use-user'

const PostSkeleton = () => (
    <div className="space-y-4 rounded-lg border bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );

export default function ConfessionsList({ sort, mood }: { sort?: string, mood?: string }) {
  const { user } = useUser()
  
  const convexPosts = useQuery(api.posts.getPosts, { 
    parentId: undefined,
    mood: mood
  })

  const posts = useMemo(() => {
    if (!convexPosts) return [];
    return convexPosts;
  }, [convexPosts]);

  const sortedPosts = useMemo(() => {
    const postsCopy = Array.isArray(posts) ? [...posts] : [];
    if (sort === 'popular') {
      return postsCopy.sort((a: any, b: any) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }
    if (sort === 'loved') {
        const countHearts = (reactions: any[]) => (reactions || []).filter(r => r.reaction === 'Heart').length;
        return postsCopy.sort((a: any, b: any) => countHearts(b.reactions) - countHearts(a.reactions));
    }
    return postsCopy;
  }, [posts, sort]);

  if (!convexPosts) {
    return (
        <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
        </div>
    )
  }

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
        <ConfessionCard key={post._id} post={post} user={user} />
      ))}
    </div>
  )
}
