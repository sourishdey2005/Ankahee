'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Countdown from '@/components/Countdown'
import RoomClient from './RoomClient'
import { useId } from 'react'

export default function RoomPage({ params }: { params: { id: string } }) {
  const room = useQuery(api.rooms.getRoomById, { id: params.id as any });

  if (room === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (room === null) {
    return notFound();
  }

  const expiresAt = (room as any).expiresAt || (room._creationTime + (48 * 60 * 60 * 1000));
  const isDM = (room as any).isDM;
  const pageTitle = isDM ? 'Direct Message' : (room as any).name;
  const breadcrumbText = 'Back to Chats';

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 px-4">
        <Link href="/rooms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {breadcrumbText}
          </Button>
        </Link>
        <div className="w-full text-left sm:w-auto sm:text-right">
          <h1 className="text-2xl font-headline font-bold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-start sm:justify-end gap-2">
            Expires <Countdown expiresAt={expiresAt.toString()} />
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden mx-4 h-[calc(100vh-18rem)] sm:h-[calc(100vh-13rem)]">
        <RoomClient
          room={{ ...room, id: room._id } as any}
          user={null as any} 
          initialMessages={[]}
          initialMembers={[]}
          isMember={true}
        />
      </div>
    </div>
  )
}
