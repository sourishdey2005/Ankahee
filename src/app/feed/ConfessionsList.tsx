'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'
import { User } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Loader2 } from 'lucide-react'

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

export default function ConfessionsList({ serverPosts = [], sort, mood }: { serverPosts?: any[], sort?: string, mood?: string }) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  
  const convexPosts = useQuery(api.posts.getPosts, { 
    parentId: undefined,
    mood: mood
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [supabase.auth])

  const posts = useMemo(() => {
    if (!convexPosts) return serverPosts;
    // Map Convex posts to the expected Post type for compatibility
    return convexPosts.map(p => ({
      ...p,
      id: p._id,
      comments: [{ count: 0 }],
      reactions: [],
      polls: [],
      void_answers: [],
      bookmarks: []
    }));
  }, [convexPosts, serverPosts]);

  const sortedPosts = useMemo(() => {
    const postsCopy = Array.isArray(posts) ? [...posts] : [];
    if (sort === 'popular') {
      return postsCopy.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }
    if (sort === 'loved') {
        const countHearts = (reactions: any[]) => (reactions || []).filter(r => r.reaction === 'Heart').length;
        return postsCopy.sort((a, b) => countHearts(b.reactions) - countHearts(a.reactions));
    }
    return postsCopy;
  }, [posts, sort]);

  if (!convexPosts && serverPosts.length === 0) {
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
        <ConfessionCard key={post.id} post={post} user={user} />
      ))}
    </div>
  )
}
