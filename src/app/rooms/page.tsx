import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tables } from '@/lib/supabase/types'
import RoomCard from '@/components/RoomCard'

export const revalidate = 0

type RoomWithMembers = Tables<'rooms'> & {
  room_members: Array<{ count: number }>
}

export default async function RoomsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*, room_members(count)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rooms:', error)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Chat Rooms</h1>
            <p className="text-muted-foreground">Join a conversation or create your own. Rooms expire after 24 hours.</p>
        </div>
        <Link href="/rooms/new">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Room
            </Button>
        </Link>
      </div>
      
      {rooms && rooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rooms as RoomWithMembers[]).map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-lg bg-card/50">
          <h2 className="text-2xl font-headline mb-2">It's Quiet in Here</h2>
          <p className="text-muted-foreground">No active rooms right now. Why not create one?</p>
        </div>
      )}
    </div>
  )
}
