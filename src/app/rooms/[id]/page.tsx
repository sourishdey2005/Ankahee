import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Countdown from '@/components/Countdown'
import RoomClient from './RoomClient'

export const revalidate = 0

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await params

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: room, error: roomError } = await (supabase
    .from('rooms')
    .select('*')
    .eq('id', resolvedParams.id)
    .single() as any)

  if (roomError || !room || new Date(room.expires_at) < new Date()) {
    notFound()
  }

  const { data: messages, error: messagesError } = await supabase
    .from('room_messages')
    .select('*')
    .eq('room_id', resolvedParams.id)
    .order('created_at', { ascending: true })

  const { data: members, error: membersError } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', resolvedParams.id)

  const { data: memberRecord, error: memberRecordError } = await supabase
    .from('room_members')
    .select('id')
    .eq('room_id', resolvedParams.id)
    .eq('user_id', session.user.id)
    .maybeSingle()
    
  const isDM = room.is_dm;
  const pageTitle = isDM ? 'Direct Message' : room.name;
  const breadcrumbText = 'All Chats';


  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex justify-between items-center mb-4">
        <Link href="/rooms">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {breadcrumbText}
          </Button>
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-headline font-bold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-end gap-2">
            Expires <Countdown expiresAt={room.expires_at} />
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <RoomClient
          room={room}
          user={session.user}
          initialMessages={messages || []}
          initialMembers={members || []}
          isMember={!!memberRecord}
        />
      </div>
    </div>
  )
}
