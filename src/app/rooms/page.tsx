'use client'

import { useState, useEffect } from 'react'
import { getRooms } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Plus, Users, MessageSquare, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function RoomsPage() {
  const { userId } = useUser()
  const [rooms, setRooms] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await getRooms(userId || undefined);
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRooms();
  }, [userId]);

  const allRooms = rooms || []
  const publicRooms = allRooms.filter(r => !r.isDM)
  const dmRooms = allRooms.filter(r => r.isDM)
  
  const filteredPublic = publicRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Open Rooms
          </h1>
          <p className="text-muted-foreground">Ephemeral spaces for collective whispers. Rooms last 24 hours.</p>
        </div>
        <Link href="/rooms/new">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Plus className="mr-2 h-5 w-5" />
            Create Room
          </Button>
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search rooms..." 
          className="pl-10 h-12 bg-card/50 backdrop-blur-md border-white/10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Scanning the void for signals...</p>
        </div>
      ) : (filteredPublic.length > 0 || dmRooms.length > 0) ? (
        <div className="space-y-12">

          {filteredPublic.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Public Rooms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublic.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-md group relative overflow-hidden">
                    {room.imageUrl && (
                      <div className="relative h-32 w-full">
                        <Image src={room.imageUrl} alt={room.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-headline truncate">{room.name}</CardTitle>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">Live</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Anonymous Room</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                        <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            Enter Room
                            <MessageSquare className="h-4 w-4 ml-2" />
                        </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-lg">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-headline font-bold mb-2">No signals found</h2>
          <p className="text-muted-foreground mb-8">Be the one to start a conversation in the void.</p>
          <Link href="/rooms/new">
            <Button variant="outline">Create the first room</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
