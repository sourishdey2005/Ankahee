import { getRoomById } from '@/app/actions/rooms'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Countdown from '@/components/Countdown'
import RoomClient from './RoomClient'

export default async function RoomPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const roomId = parseInt(id);
  
  if (isNaN(roomId)) {
    notFound();
  }

  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  const expires_at = room.expiresAt || new Date();
  const pageTitle = room.name;

  return (
    <div className="container mx-auto max-w-6xl py-3 sm:py-8 h-screen sm:h-auto flex flex-col">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 px-4 shrink-0">
        <Link href="/rooms">
          <Button variant="ghost" size="sm" className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chats
          </Button>
        </Link>
        <div className="w-full text-left sm:w-auto sm:text-right">
          <h1 className="text-2xl font-headline font-bold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-start sm:justify-end gap-2">
            Expires <Countdown expiresAt={expires_at.toString()} />
          </p>
        </div>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden mx-2 sm:mx-4 flex-1 shadow-2xl relative bg-black/20 backdrop-blur-sm">
        <RoomClient
          room={room}
        />
      </div>
    </div>
  )
}

