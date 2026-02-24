'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'
import { User } from '@supabase/supabase-js'

type Post = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
  polls: (Tables<'polls'> & { poll_votes: Tables<'poll_votes'>[] })[]
}

export default function ConfessionsList({ serverPosts, sort }: { serverPosts: Post[], sort?: string }) {
  const [posts, setPosts] = useState<Post[]>(serverPosts)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [supabase.auth])

  useEffect(() => {
    setPosts(serverPosts)
  }, [serverPosts])

  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    if (sort === 'popular') {
      return postsCopy.sort((a, b) => b.reactions.length - a.reactions.length);
    }
    if (sort === 'loved') {
        const countHearts = (reactions: Tables<'reactions'>[]) => reactions.filter(r => r.reaction === 'Heart').length;
        return postsCopy.sort((a, b) => countHearts(b.reactions) - countHearts(a.reactions));
    }
    return postsCopy;
  }, [posts, sort]);

  const handlePostUpdate = useCallback(async (postId: string) => {
    const { data: updatedPostData, error } = await supabase
      .from('posts')
      .select('*, comments(count), reactions(*), polls(*, poll_votes(*))')
      .eq('id', postId)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') { // Post might have been deleted
        console.error('Error refetching post:', error)
      } else {
        setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
      }
      return
    }

    const updatedPost = updatedPostData as Post;
    setPosts(currentPosts => 
      currentPosts.map(p => (p.id === postId ? updatedPost : p))
    );
  }, [supabase])

  useEffect(() => {
    const postsChannel = supabase
      .channel('realtime-posts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
            const newPost = payload.new as Tables<'posts'>
            const postWithCounts: Post = { ...newPost, comments: [{count: 0}], reactions: [], polls: [] }
            setPosts((prevPosts) => [postWithCounts, ...prevPosts])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prevPosts) => prevPosts.filter((p) => p.id !== (payload.old as Post).id))
        }
      ).subscribe()

    const reactionsChannel = supabase
      .channel('realtime-reactions-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload: any) => {
          const postId = payload.new?.post_id || payload.old?.post_id
          if (postId) {
            handlePostUpdate(postId)
          }
        }
      )
      .subscribe()

    const commentsChannel = supabase
      .channel('realtime-comments-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload: any) => {
           const postId = payload.new?.post_id || payload.old?.post_id
          if (postId) {
            handlePostUpdate(postId)
          }
        }
      )
      .subscribe()

    const pollsChannel = supabase
      .channel('realtime-polls-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'polls' },
        (payload: any) => {
           const postId = payload.new?.post_id
          if (postId) {
            handlePostUpdate(postId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(postsChannel)
      supabase.removeChannel(reactionsChannel)
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(pollsChannel)
    }
  }, [supabase, handlePostUpdate])

  if (sortedPosts.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-headline mb-2">The Void is Quiet</h2>
            <p className="text-muted-foreground">Be the first to share a confession.</p>
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
