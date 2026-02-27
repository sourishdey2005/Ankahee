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
  void_answers: Tables<'void_answers'>[]
  bookmarks: Tables<'bookmarks'>[]
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

  useEffect(() => {
    const postsChannel = supabase
      .channel('realtime-posts-feed-granular')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
            const newPost = payload.new as Tables<'posts'>
            const postWithCounts: Post = { ...newPost, comments: [{count: 0}], reactions: [], polls: [], void_answers: [], bookmarks: [] }
            setPosts((prevPosts) => [postWithCounts, ...prevPosts])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prevPosts) =>
            prevPosts.map(post =>
              post.id === payload.new.id
                ? { ...post, ...(payload.new as Tables<'posts'>) }
                : post
            )
          );
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
      .channel('realtime-reactions-feed-granular')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload: any) => {
          const postId = payload.new?.post_id || payload.old?.post_id
          if (!postId) return;

          setPosts(currentPosts => 
            currentPosts.map(p => {
              if (p.id !== postId) return p;

              const reactionUser = (payload.new?.user_id || payload.old?.user_id);
              const filteredReactions = p.reactions.filter(r => r.user_id !== reactionUser);

              let newReactions: Tables<'reactions'>[];
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                newReactions = [...filteredReactions, payload.new as Tables<'reactions'>];
              } else { // DELETE
                newReactions = filteredReactions;
              }
              return { ...p, reactions: newReactions };
            })
          );
        }
      )
      .subscribe()

    const commentsChannel = supabase
      .channel('realtime-comments-feed-granular')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload: any) => {
           const postId = payload.new?.post_id || payload.old?.post_id
           if (!postId) return;

           setPosts(currentPosts => 
             currentPosts.map(p => {
               if (p.id !== postId) return p;
               
               const currentCount = Array.isArray(p.comments) && p.comments.length > 0 ? p.comments[0].count : 0;
               let newCount: number;

               if (payload.eventType === 'INSERT') {
                 newCount = currentCount + 1;
               } else if (payload.eventType === 'DELETE') {
                 newCount = Math.max(0, currentCount - 1);
               } else {
                 newCount = currentCount;
               }
               return { ...p, comments: [{ count: newCount }] };
             })
           );
        }
      )
      .subscribe()

    const pollVotesChannel = supabase
      .channel('realtime-poll-votes-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'poll_votes' },
        (payload: any) => {
           const pollId = payload.new?.poll_id
           if (!pollId) return;

            setPosts(currentPosts => {
                const postToUpdate = currentPosts.find(p => p.polls.some(poll => poll.id === pollId));
                if (!postToUpdate) return currentPosts;

                return currentPosts.map(p => {
                    if (p.id !== postToUpdate.id) return p;

                    const updatedPolls = p.polls.map(poll => {
                        if (poll.id !== pollId) return poll;
                        if (poll.poll_votes.some(v => v.id === payload.new.id)) return poll;
                        
                        const newVotes = [...poll.poll_votes, payload.new as Tables<'poll_votes'>];
                        return { ...poll, poll_votes: newVotes };
                    });
                    return { ...p, polls: updatedPolls };
                });
            });
        }
      )
      .subscribe()

    const voidAnswersChannel = supabase
      .channel('realtime-void-answers-feed-granular')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'void_answers' },
        (payload: any) => {
            const postId = payload.new?.post_id
            if (!postId) return;

            setPosts(currentPosts => 
              currentPosts.map(p => {
                if (p.id !== postId) return p;
                if (p.void_answers.some(a => a.id === payload.new.id)) return p;
                
                const newAnswers = [...p.void_answers, payload.new as Tables<'void_answers'>];
                return { ...p, void_answers: newAnswers };
              })
            );
        }
      )
      .subscribe()

    const bookmarksChannel = supabase
      .channel('realtime-bookmarks-feed-granular')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        (payload: any) => {
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          setPosts(currentPosts =>
            currentPosts.map(p => {
              if (p.id !== postId) return p;

              const bookmarkUser = payload.new?.user_id || payload.old?.user_id;

              const filteredBookmarks = (p.bookmarks || []).filter(b => b.user_id !== bookmarkUser);

              let newBookmarks: Tables<'bookmarks'>[];
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                newBookmarks = [...filteredBookmarks, payload.new as Tables<'bookmarks'>];
              } else { // DELETE
                newBookmarks = filteredBookmarks;
              }
              return { ...p, bookmarks: newBookmarks };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel)
      supabase.removeChannel(reactionsChannel)
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(pollVotesChannel)
      supabase.removeChannel(voidAnswersChannel)
      supabase.removeChannel(bookmarksChannel)
    }
  }, [supabase])

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
