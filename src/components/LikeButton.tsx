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
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id
      setUserId(currentUserId)

      const { data: likesData, count, error } = await supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('post_id', postId)

      if (error) {
        console.error('Error fetching likes:', error)
      } else {
        setLikes(count ?? 0)
        if (currentUserId) {
          setIsLiked(likesData.some(like => like.user_id === currentUserId))
        }
      }
    }
    fetchData()
  }, [postId, supabase])

  const handleLike = async () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to like a post.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      if (isLiked) {
        setIsLiked(false)
        setLikes(l => l - 1)
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: userId })
        if (error) {
          setIsLiked(true)
          setLikes(l => l + 1)
          toast({ title: 'Error', description: error.message || 'Could not unlike post.', variant: 'destructive'})
        }
      } else {
        setIsLiked(true)
        setLikes(l => l + 1)
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId })
        if (error) {
          setIsLiked(false)
          setLikes(l => l - 1)
           toast({ title: 'Error', description: error.message || 'Could not like post.', variant: 'destructive'})
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
