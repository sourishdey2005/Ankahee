'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { add } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { isEditable } from '@/lib/utils'

const PollSchema = z.object({
  optionOne: z.string().min(1).max(80),
  optionTwo: z.string().min(1).max(80),
}).optional()

const PostSchema = z.object({
  content: z.string().min(10).max(500),
  mood: z.string().optional(),
  userId: z.string().uuid(),
  poll: PollSchema,
})

export async function createPost(input: z.infer<typeof PostSchema>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || session.user.id !== input.userId) {
    return { error: { message: 'Unauthorized' } }
  }
  
  const parsed = PostSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  const expires_at = add(new Date(), { hours: 24 }).toISOString()

  const { data, error } = await supabase.from('posts').insert({
    content: parsed.data.content,
    mood: parsed.data.mood,
    user_id: parsed.data.userId,
    expires_at,
  }).select().single()

  if (error) {
    return { error }
  }

  if (parsed.data.poll) {
    const { error: pollError } = await supabase.from('polls').insert({
      post_id: data.id,
      option_one_text: parsed.data.poll.optionOne,
      option_two_text: parsed.data.poll.optionTwo,
    })

    if (pollError) {
        console.error("Poll creation failed:", pollError)
        return { error: { message: "Your confession was posted, but the poll could not be created." } }
    }
  }

  revalidatePath('/feed');
  return { data }
}

const UpdatePostSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(10).max(500),
})

export async function updatePost(input: z.infer<typeof UpdatePostSchema>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: { message: 'Unauthorized' } }
  }

  const parsed = UpdatePostSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  const { postId, content } = parsed.data

  const { data: post, error: fetchError } = await supabase.from('posts').select('user_id, created_at').eq('id', postId).single()

  if (fetchError || !post) {
    return { error: { message: 'Post not found.' } }
  }

  if (post.user_id !== session.user.id) {
    return { error: { message: 'You are not the owner of this post.' } }
  }

  if (!isEditable(post.created_at)) {
      return { error: { message: 'Edit window has expired.' } }
  }

  const { error: updateError } = await supabase.from('posts').update({ content }).eq('id', postId)

  if (updateError) {
    return { error: updateError }
  }

  revalidatePath(`/confession/${postId}`)
  revalidatePath('/feed')
  return { data: { message: 'Post updated successfully.' } }
}

const UpdateCommentSchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().min(1).max(280),
})

export async function updateComment(input: z.infer<typeof UpdateCommentSchema>) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return { error: { message: 'Unauthorized' } }
    }

    const parsed = UpdateCommentSchema.safeParse(input)
    if (!parsed.success) {
        return { error: { message: 'Invalid input' } }
    }

    const { commentId, content } = parsed.data

    const { data: comment, error: fetchError } = await supabase.from('comments').select('user_id, created_at, post_id').eq('id', commentId).single()

    if (fetchError || !comment) {
        return { error: { message: 'Comment not found.' } }
    }

    if (comment.user_id !== session.user.id) {
        return { error: { message: 'You are not the owner of this comment.' } }
    }

    if (!isEditable(comment.created_at)) {
        return { error: { message: 'Edit window has expired.' } }
    }

    const { error: updateError } = await supabase.from('comments').update({ content }).eq('id', commentId)

    if (updateError) {
        return { error: updateError }
    }

    revalidatePath(`/confession/${comment.post_id}`)
    return { data: { message: 'Comment updated successfully.' } }
}

const DeletePostSchema = z.object({
    postId: z.string().uuid(),
})

export async function deletePost(input: z.infer<typeof DeletePostSchema>) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return { error: { message: 'Unauthorized' } }
    }

    const parsed = DeletePostSchema.safeParse(input)
    if (!parsed.success) {
        return { error: { message: 'Invalid input' } }
    }

    const { postId } = parsed.data

    const { data: post, error: fetchError } = await supabase.from('posts').select('user_id').eq('id', postId).single()

    if (fetchError || !post) {
        return { error: { message: 'Post not found.' } }
    }

    if (post.user_id !== session.user.id) {
        return { error: { message: 'You are not the owner of this post.' } }
    }

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId)

    if (deleteError) {
        return { error: deleteError }
    }

    revalidatePath('/feed')
    revalidatePath(`/confession/${postId}`)

    return { data: { message: 'Post deleted successfully.' } }
}

const VoteSchema = z.object({
    pollId: z.string().uuid(),
    option: z.union([z.literal(1), z.literal(2)]),
})

export async function castVote(input: z.infer<typeof VoteSchema>) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return { error: { message: 'Unauthorized' } }
    }

    const parsed = VoteSchema.safeParse(input)
    if (!parsed.success) {
        return { error: { message: 'Invalid input' } }
    }

    const { pollId, option } = parsed.data

    const { error } = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        user_id: session.user.id,
        selected_option: option,
    })

    if (error) {
        if (error.code === '23505') { // unique_violation
            return { error: { message: 'You have already voted on this poll.' } }
        }
        return { error: { message: 'Failed to cast vote.' } }
    }
    
    // Revalidate paths to show updated poll results
    const { data: pollData } = await supabase.from('polls').select('post_id').eq('id', pollId).single()
    if (pollData) {
        revalidatePath(`/confession/${pollData.post_id}`)
        revalidatePath('/feed')
    }

    return { data: { message: 'Vote cast successfully.' } }
}
