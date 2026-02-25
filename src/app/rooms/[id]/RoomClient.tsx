'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { generateHslColorFromString, generateAvatarDataUri } from '@/lib/utils'
import { joinRoom, leaveRoom, postRoomMessage } from '@/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, LogIn, LogOut } from 'lucide-react'

type RoomMessage = Tables<'room_messages'>;
type RoomMember = Tables<'room_members'>;

const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty.'),
})

export default function RoomClient({
    room,
    user,
    initialMessages,
    initialMembers,
    isMember: initialIsMember,
}: {
    room: Tables<'rooms'>,
    user: User,
    initialMessages: RoomMessage[],
    initialMembers: RoomMember[],
    isMember: boolean,
}) {
    const [messages, setMessages] = useState(initialMessages)
    const [members, setMembers] = useState(initialMembers)
    const [isMember, setIsMember] = useState(initialIsMember)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const supabase = createClient()
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: { content: '' },
    })

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages])

    useEffect(() => {
        const messageChannel = supabase
            .channel(`room-messages:${room.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${room.id}` },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as RoomMessage])
                }
            )
            .subscribe()

        const memberChannel = supabase
            .channel(`room-members:${room.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${room.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setMembers(prev => [...prev, payload.new as RoomMember])
                    } else if (payload.eventType === 'DELETE') {
                        setMembers(prev => prev.filter(m => m.user_id !== (payload.old as RoomMember).user_id))
                    }
                }
            ).subscribe()

        return () => {
            supabase.removeChannel(messageChannel)
            supabase.removeChannel(memberChannel)
        }
    }, [supabase, room.id])

    const handleJoin = () => {
        startTransition(async () => {
            const result = await joinRoom({ roomId: room.id })
            if (result.error) {
                toast({ title: 'Error', description: result.error.message, variant: 'destructive' })
            } else {
                setIsMember(true)
                toast({ title: 'Success', description: 'You have joined the room.' })
            }
        })
    }

    const handleLeave = () => {
        startTransition(async () => {
            const result = await leaveRoom({ roomId: room.id })
            if (result.error) {
                toast({ title: 'Error', description: result.error.message, variant: 'destructive' })
            } else {
                setIsMember(false)
                toast({ title: 'Success', description: 'You have left the room.' })
            }
        })
    }

    const onSubmit = (values: z.infer<typeof messageSchema>) => {
        const content = values.content
        form.reset()
        startTransition(async () => {
            const result = await postRoomMessage({ roomId: room.id, content })
            if (result.error) {
                toast({
                    title: 'Failed to send message',
                    description: result.error.message,
                    variant: 'destructive',
                })
            }
        })
    }

    return (
        <div className="flex h-[calc(100vh-10rem)]">
            <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((msg) => {
                            const commenterColor = generateHslColorFromString(msg.user_id, 50, 60);
                            const avatarUri = generateAvatarDataUri(msg.user_id);
                            return (
                                <div key={msg.id} className="flex items-start gap-4 group">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={avatarUri} />
                                        <AvatarFallback />
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold" style={{ color: commenterColor }}>Anonymous</span>
                                            <span className="text-muted-foreground">·</span>
                                            <span className="text-muted-foreground">
                                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-foreground/90 mt-1">{msg.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
                {isMember ? (
                    <div className="p-4 border-t">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input autoComplete="off" placeholder="Speak your mind..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" size="icon" disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </Form>
                    </div>
                ) : (
                    <div className="p-4 border-t flex items-center justify-center">
                        <Button onClick={handleJoin} disabled={isPending}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Join Room to Chat
                        </Button>
                    </div>
                )}
            </div>
            <aside className="w-64 border-l p-4 flex flex-col space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Members ({members.length})</h3>
                    <ScrollArea className="h-64">
                        <div className="space-y-2">
                            {members.map(member => {
                                const memberColor = generateHslColorFromString(member.user_id, 50, 60);
                                const memberAvatarUri = generateAvatarDataUri(member.user_id);
                                const isCurrentUser = member.user_id === user.id;
                                return (
                                    <div key={member.user_id} className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={memberAvatarUri} />
                                            <AvatarFallback />
                                        </Avatar>
                                        <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                                            Anonymous {isCurrentUser && '(You)'}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
                {isMember && (
                    <Button variant="outline" onClick={handleLeave} disabled={isPending}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave Room
                    </Button>
                )}
            </aside>
        </div>
    )
}
