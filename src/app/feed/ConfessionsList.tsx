'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import ConfessionCard from '@/components/ConfessionCard'
import { User } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'

type Post = Tables<'posts'> & {
  comments: Array<{ count: number }>
  reactions: Array<Tables<'reactions'>>
  polls: (Tables<'polls'> & { poll_votes: Tables<'poll_votes'>[] })[]
  void_answers: Tables<'void_answers'>[]
  bookmarks: Tables<'bookmarks'>[]
}

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
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [supabase.auth])

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select('*, comments(count), reactions(*), polls(*, poll_votes(*)), void_answers(*), bookmarks(*)')
        .gt('expires_at', new Date().toISOString())
        .is('parent_post_id', null);

      if (mood) {
        query = query.eq('mood', mood);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } else {
        setPosts((data as any) || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [supabase, mood]);

  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    if (sort === 'popular') {
      return postsCopy.sort((a, b) => (b.reactions?.length ?? 0) - (a.reactions?.length ?? 0));
    }
    if (sort === 'loved') {
        const countHearts = (reactions: Tables<'reactions'>[]) => (reactions || []).filter(r => r.reaction === 'Heart').length;
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
            const newPost = payload.new as Tables<'posts'>;
            
            if (newPost.parent_post_id) return;
            if (mood && newPost.mood !== mood) return;

            setPosts((prevPosts) => {
              if (prevPosts.some(p => p.id === newPost.id)) return prevPosts;
              const postWithCounts: Post = { ...newPost, comments: [{count: 0}], reactions: [], polls: [], void_answers: [], bookmarks: [] };
              return [postWithCounts, ...prevPosts];
            });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const updatedPost = payload.new as Post;

          if (mood && updatedPost.mood !== mood) {
              setPosts(prevPosts => prevPosts.filter(p => p.id !== updatedPost.id));
              return;
          }

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
              const filteredReactions = (p.reactions || []).filter(r => r.user_id !== reactionUser);

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
                const postToUpdate = currentPosts.find(p => (p.polls || []).some(poll => poll.id === pollId));
                if (!postToUpdate) return currentPosts;

                return currentPosts.map(p => {
                    if (p.id !== postToUpdate.id) return p;

                    const updatedPolls = (p.polls || []).map(poll => {
                        if (poll.id !== pollId) return poll;
                        if ((poll.poll_votes || []).some(v => v.id === payload.new.id)) return poll;
                        
                        const newVotes = [...(poll.poll_votes || []), payload.new as Tables<'poll_votes'>];
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
                if ((p.void_answers || []).some(a => a.id === payload.new.id)) return p;
                
                const newAnswers = [...(p.void_answers || []), payload.new as Tables<'void_answers'>];
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
  }, [supabase, mood])

  if (loading) {
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
