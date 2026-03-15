import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Countdown from './Countdown'
import { Users, Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function RoomCard({ room }: { room: any }) {
  const memberCount = 0; // Simplified for now
  const expiresAt = room.expires_at || (room._creationTime + (24 * 60 * 60 * 1000));
  const roomId = room._id || room.id;

  if (room.isDM) {
    return (
      <Link href={`/rooms/${room._id}`} className="block">
        <Card className="hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="truncate flex items-center gap-2">
                    <MessageSquare />
                    Direct Message
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">A private conversation. Expires in 48 hours.</p>
            </CardContent>
            <CardFooter className="flex justify-end items-center text-muted-foreground text-sm">
                <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <Countdown expiresAt={room.expiresAt.toString()} />
                </div>
            </CardFooter>
        </Card>
    </Link>
    )
  }

  return (
    <Link href={`/rooms/${roomId}`} className="block">
        <Card className="hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full flex flex-col overflow-hidden">
            {room.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={room.imageUrl}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2">
                <CardTitle className="truncate text-lg">{room.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1"></CardContent>
            <CardFooter className="flex justify-between items-center text-muted-foreground text-xs pt-0">
                 <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3" />
                    <span>{memberCount} members</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <Countdown expiresAt={expiresAt.toString()} />
                </div>
            </CardFooter>
        </Card>
    </Link>
  )
}
