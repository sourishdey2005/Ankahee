'use client'

import { useState, useEffect } from 'react'
import { getRoomById } from '@/app/actions/rooms'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Countdown from '@/components/Countdown'
import RoomClient from './RoomClient'

export default function RoomPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any | null>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRoom() {
      try {
        const data = await getRoomById(parseInt(params.id));
        setRoom(data);
      } catch (err) {
        console.error('Failed to fetch room:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoom();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (room === null) {
    return notFound();
  }

  const expires_at = room.expiresAt || new Date();
  const pageTitle = room.name;

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 px-4">
        <Link href="/rooms">
          <Button variant="ghost" size="sm">
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

      <div className="border rounded-lg overflow-hidden mx-4 h-[calc(100vh-18rem)] sm:h-[calc(100vh-13rem)]">
        <RoomClient
          room={room}
        />
      </div>
    </div>
  )
}
