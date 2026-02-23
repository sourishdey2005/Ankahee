'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'

type Post = Tables<'posts'> & {
  comments: Array<{ count: number }>
  likes: Array<{ count: number }>
}

export default function ConfessionsList({ serverPosts }: { serverPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(serverPosts)
  const supabase = createClient()

  useEffect(() => {
    setPosts(serverPosts)
  }, [serverPosts])

  useEffect(() => {
    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPost = payload.new as Tables<'posts'>
            const postWithCounts: Post = { ...newPost, comments: [], likes: [] }
            setPosts((prevPosts) => [postWithCounts, ...prevPosts])
          } else if (payload.eventType === 'DELETE') {
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== (payload.old as Post).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

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
