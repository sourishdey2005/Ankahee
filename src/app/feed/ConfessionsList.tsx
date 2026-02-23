'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'
import { Skeleton } from '@/components/ui/skeleton'

type Post = Tables<'posts'> & {
  comments: Array<{ count: number }>
  likes: Array<{ count: number }>
}

export default function ConfessionsList({ serverPosts }: { serverPosts: Post[] }) {
  const [posts, setPosts] = useState(serverPosts)
  const [loading, setLoading] = useState(serverPosts.length === 0)
  const supabase = createClient()

  useEffect(() => {
    setPosts(serverPosts)
    setLoading(false)
  }, [serverPosts])

  useEffect(() => {
    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          // This only adds new posts, sorting doesn't re-trigger a full list refresh
          // for realtime, which is fine for now. A full re-fetch on any change
          // might be too much.
          setPosts((prevPosts) => [payload.new as Post, ...prevPosts])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4 bg-card/50">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (posts.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-headline mb-2">The Void is Quiet</h2>
            <p className="text-muted-foreground">Be the first to share a confession.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ConfessionCard key={post.id} post={post} />
      ))}
    </div>
  )
}
