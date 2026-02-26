import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tables } from '@/lib/supabase/types'
import RoomCard from '@/components/RoomCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const revalidate = 0

type RoomWithMembers = Tables<'rooms'> & {
  room_members: Array<{ count: number }>
}

export default async function RoomsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_members(count)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rooms:', JSON.stringify(error, null, 2))
  }

  const allRooms: RoomWithMembers[] = (data as any) || []
  const publicRooms = allRooms.filter(r => !r.is_dm)
  const dmRooms = allRooms.filter(r => r.is_dm)

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Chats</h1>
          <p className="text-muted-foreground">Join a conversation or create your own. Rooms expire after 24 hours.</p>
        </div>
        <Link href="/rooms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Room
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Public Rooms</TabsTrigger>
          <TabsTrigger value="dms">Direct Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="public" className="mt-6">
          {publicRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-lg bg-card/50">
              <h2 className="text-2xl font-headline mb-2">It's Quiet in Here</h2>
              <p className="text-muted-foreground">No active public rooms right now. Why not create one?</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="dms" className="mt-6">
          {dmRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dmRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-lg bg-card/50">
              <h2 className="text-2xl font-headline mb-2">No Direct Messages</h2>
              <p className="text-muted-foreground">You can start a private chat by clicking the message icon on a comment.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
