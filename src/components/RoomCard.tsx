import Link from 'next/link'
import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Countdown from './Countdown'
import { Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type RoomWithMembers = Tables<'rooms'> & {
  room_members: Array<{ count: number }>
}

export default function RoomCard({ room }: { room: RoomWithMembers }) {
  const memberCount = room.room_members && Array.isArray(room.room_members) && room.room_members.length > 0 ? room.room_members[0].count : 0;

  return (
    <Link href={`/rooms/${room.id}`} className="block">
        <Card className="hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="truncate">{room.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1"></CardContent>
            <CardFooter className="flex justify-between items-center text-muted-foreground text-sm">
                 <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <Countdown expiresAt={room.expires_at} />
                </div>
            </CardFooter>
        </Card>
    </Link>
  )
}
