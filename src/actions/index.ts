'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { add } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { isEditable } from '@/lib/utils'
import { redirect } from 'next/navigation'

const PollSchema = z.object({
  optionOne: z.string().min(1).max(80),
  optionTwo: z.string().min(1).max(80),
}).optional()

const PostSchema = z.object({
  content: z.string().min(10).max(500),
  mood: z.string().optional(),
  userId: z.string().uuid(),
  poll: PollSchema,
  parentId: z.string().uuid().optional(),
  is_void_question: z.boolean().optional(),
})

export async function createPost(input: z.infer<typeof PostSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()

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
    parent_post_id: parsed.data.parentId,
    is_void_question: parsed.data.is_void_question,
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
  if (parsed.data.parentId) {
    revalidatePath(`/confession/${parsed.data.parentId}`)
  }
  return { data }
}

const LetterSchema = z.object({
  content: z.string().min(20, 'Must be at least 20 characters.').max(5000, 'Cannot exceed 5000 characters.'),
})

export async function createLetter(input: z.infer<typeof LetterSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: { message: 'Unauthorized' } }
  }

  const parsed = LetterSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  const expires_at = add(new Date(), { days: 3 }).toISOString()

  const { data, error } = await supabase.from('letters').insert({
    content: parsed.data.content,
    user_id: session.user.id,
    expires_at,
  }).select().single()

  if (error) {
    return { error }
  }

  revalidatePath('/letters');
  return { data }
}

const UpdatePostSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(10).max(500),
})

export async function updatePost(input: z.infer<typeof UpdatePostSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()

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
  const supabase: SupabaseClient<Database> = await createClient()

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
  const supabase: SupabaseClient<Database> = await createClient()

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
  const supabase: SupabaseClient<Database> = await createClient()

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

  const { data: pollData } = await supabase.from('polls').select('post_id').eq('id', pollId).single()
  if (pollData) {
    revalidatePath(`/confession/${pollData.post_id}`)
    revalidatePath('/feed')
  }

  return { data: { message: 'Vote cast successfully.' } }
}

const RoomSchema = z.object({
  name: z.string().min(3, 'Must be at least 3 characters.').max(50, 'Cannot exceed 50 characters.'),
})

export async function createRoom(input: z.infer<typeof RoomSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: { message: 'Unauthorized' } }
  }

  const parsed = RoomSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  const expires_at = add(new Date(), { hours: 24 }).toISOString()

  const { data: room, error } = await supabase.from('rooms').insert({
    name: parsed.data.name,
    created_by: session.user.id,
    expires_at,
  }).select().single()

  if (error) {
    return { error: { message: 'Failed to create room.', details: error.message } }
  }

  revalidatePath('/rooms')
  return { data: room }
}

const RoomIdSchema = z.object({ roomId: z.string().uuid() })

export async function joinRoom(input: z.infer<typeof RoomIdSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: { message: 'Unauthorized' } }

  const { error } = await supabase.from('room_members').insert({
    room_id: input.roomId,
    user_id: session.user.id,
  })

  if (error) return { error: { message: 'Failed to join room.' } }

  revalidatePath(`/rooms/${input.roomId}`)
  return { data: { message: 'Joined room.' } }
}

export async function leaveRoom(input: z.infer<typeof RoomIdSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: { message: 'Unauthorized' } }

  const { error } = await supabase.from('room_members').delete()
    .eq('room_id', input.roomId)
    .eq('user_id', session.user.id)

  if (error) return { error: { message: 'Failed to leave room.' } }

  revalidatePath(`/rooms/${input.roomId}`)
  return { data: { message: 'Left room.' } }
}

const RoomMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty.').max(1000, 'Message too long.'),
})

export async function postRoomMessage(input: z.infer<typeof RoomMessageSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: { message: 'Unauthorized' } }

  const { error } = await supabase.from('room_messages').insert({
    room_id: input.roomId,
    user_id: session.user.id,
    content: input.content,
  })

  if (error) return { error: { message: 'Failed to send message.' } }

  // No revalidation needed, client will handle real-time update
  return { data: { message: 'Message sent.' } }
}

const StorySegmentSchema = z.object({
  storyId: z.string(),
  content: z.string().min(1, 'Sentence cannot be empty.').max(280, 'Sentence too long.'),
  order: z.number().int().positive(),
})

export async function addStorySegment(input: z.infer<typeof StorySegmentSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: { message: 'Unauthorized' } }

  // Basic check to prevent user from posting twice in a row
  const { data: lastSegment, error: lastSegmentError } = await supabase
    .from('story_segments')
    .select('user_id')
    .eq('story_id', input.storyId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  if (lastSegment && lastSegment.user_id === session.user.id) {
    return { error: { message: 'Please wait for someone else to contribute.' } }
  }

  const { error } = await supabase.from('story_segments').insert({
    story_id: input.storyId,
    user_id: session.user.id,
    content: input.content,
    order: input.order,
  })

  if (error) {
    if (error.code === '23505') { // unique_violation on (story_id, order)
      return { error: { message: 'Someone just added a sentence. Please try again.' } }
    }
    return { error: { message: 'Failed to add to story.' } }
  }

  revalidatePath('/story')
  return { data: { message: 'Segment added.' } }
}

const VoidAnswerSchema = z.object({
  postId: z.string().uuid(),
  word: z.string().trim().min(1).max(30),
})

export async function addVoidAnswer(input: z.infer<typeof VoidAnswerSchema>) {
  const supabase: SupabaseClient<Database> = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: { message: 'Unauthorized' } }

  const parsed = VoidAnswerSchema.safeParse(input)
  if (!parsed.success) {
    return { error: { message: 'Invalid input' } }
  }

  if (parsed.data.word.includes(' ')) {
    return { error: { message: 'Only a single word is allowed.' } }
  }

  const { error } = await supabase.from('void_answers').insert({
    post_id: parsed.data.postId,
    user_id: session.user.id,
    word: parsed.data.word.toLowerCase(),
  })

  if (error) {
    if (error.code === '23505') { // unique_violation for user already answering
      return { error: { message: 'You have already answered.' } }
    }
    return { error: { message: 'Failed to submit answer.' } }
  }

  revalidatePath(`/confession/${parsed.data.postId}`)
  revalidatePath('/feed')

  return { data: { message: 'Answer submitted.' } }
}
