'use client'

import { useState, useEffect, useTransition, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { generateHslColorFromString, generateAvatarDataUri } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, LogIn } from 'lucide-react'
import { joinRoom, sendRoomMessage, getRoomMessages, getRoomMembers } from '@/app/actions/rooms'
import { useUser } from '@/hooks/use-user'

const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty.'),
})

export default function RoomClient({
    room,
}: {
    room: any,
}) {
    const { userId } = useUser()
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const isMember = useMemo(() => members.some(m => m.userId === userId), [members, userId])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [msgs, mems] = await Promise.all([
                    getRoomMessages(room.id),
                    getRoomMembers(room.id)
                ]);
                setMessages(msgs);
                setMembers(mems);
            } catch (err) {
                console.error('Room fetch error:', err);
            }
        };
        fetchAll();
        const timer = setInterval(fetchAll, 3000); // Polling every 3s as fallback for real-time
        return () => clearInterval(timer);
    }, [room.id]);

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: { content: '' },
    })

    const handleJoin = () => {
        if (!userId) return;
        startTransition(async () => {
            try {
                await joinRoom(room.id, userId)
                toast({ title: 'Success', description: 'You have joined the room.' })
            } catch (err: any) {
                toast({ title: 'Error', description: err.message || 'Could not join room.', variant: 'destructive' })
            }
        })
    }

    const onSubmit = (values: z.infer<typeof messageSchema>) => {
        if (!userId) return;
        const content = values.content
        form.reset()
        startTransition(async () => {
            try {
                await sendRoomMessage(room.id, userId, content)
            } catch (err: any) {
                toast({
                    title: 'Failed to send message',
                    description: err.message || 'Could not send message.',
                    variant: 'destructive',
                })
            }
        })
    }

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {[...messages].reverse().map((msg: any) => {
                            const commenterColor = generateHslColorFromString(msg.authorId, 50, 60);
                            const avatarUri = generateAvatarDataUri(msg.authorId);
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
                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
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
            <aside className="hidden md:flex w-64 border-l p-4 flex-col space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Members ({members.length})</h3>
                    <ScrollArea className="h-64">
                        <div className="space-y-2">
                            {members.map((member: any) => {
                                const memberColor = generateHslColorFromString(member.userId, 50, 60);
                                const memberAvatarUri = generateAvatarDataUri(member.userId);
                                const isCurrentUser = member.userId === userId;
                                return (
                                    <div key={member.id} className="flex items-center gap-2">
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
            </aside>
        </div>
    )
}
