'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RoomCard from '@/components/RoomCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RoomsPage() {
  const rooms = useQuery(api.rooms.getRooms)

  const allRooms = rooms || []
  const publicRooms = allRooms.filter(r => !r.is_dm)
  const dmRooms = allRooms.filter(r => r.is_dm)

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold">Chats</h1>
          <p className="text-muted-foreground text-sm">Join a conversation or create your own. Rooms expire after 24 hours.</p>
        </div>
        <Link href="/rooms/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Room
          </Button>
        </Link>
      </div>

      {!rooms ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public Rooms</TabsTrigger>
            <TabsTrigger value="dms">Direct Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-6">
            {publicRooms.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                {publicRooms.map(room => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-lg bg-card/50 mx-4">
                <h2 className="text-2xl font-headline mb-2">It's Quiet in Here</h2>
                <p className="text-muted-foreground">No active public rooms right now. Why not create one?</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="dms" className="mt-6">
            {dmRooms.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                {dmRooms.map(room => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-lg bg-card/50 mx-4">
                <h2 className="text-2xl font-headline mb-2">No Direct Messages</h2>
                <p className="text-muted-foreground">You can start a private chat by clicking the message icon on a comment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
