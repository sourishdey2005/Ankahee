'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LikeButton({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id
      setUserId(currentUserId)

      const { data: likesData, count, error } = await supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('post_id', postId)

      if (error) {
        console.error('Error fetching likes:', error)
        return;
      } 
      
      setLikes(count ?? 0)
      if (currentUserId && likesData) {
        setIsLiked(likesData.some(like => like.user_id === currentUserId))
      }
    }

    fetchInitialData()

    const channel = supabase
      .channel(`realtime-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId)
          setLikes(count ?? 0)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  const handleLike = () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to like a post.',
        variant: 'destructive',
      })
      return
    }

    const wasLiked = isLiked;

    setIsLiked(!wasLiked)
    setLikes(l => wasLiked ? l - 1 : l + 1)
    
    startTransition(async () => {
      if (wasLiked) {
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: userId })
        if (error) {
          toast({ title: 'Error', description: error.message || 'Could not unlike post.', variant: 'destructive'})
          setIsLiked(true)
        }
      } else {
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId })
        if (error) {
          toast({ title: 'Error', description: error.message || 'Could not like post.', variant: 'destructive'})
          setIsLiked(false)
        }
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center space-x-2 text-muted-foreground"
      onClick={handleLike}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
      )}
      <span>{likes}</span>
    </Button>
  )
}
