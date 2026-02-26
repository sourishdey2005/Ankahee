import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Archive, MessagesSquare, Mail, BookOpen, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SignOutButton from '@/components/SignOutButton'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import Image from 'next/image'

export default async function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/feed" className="flex items-center space-x-2">
            <Image src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png" alt="Ankahee Logo" width={32} height={32} className="rounded-full" />
            <span className="font-bold font-headline text-lg">Ankahee</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/letters">
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full sm:w-auto sm:px-3 sm:rounded-md">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Letters</span>
              </Button>
            </Link>
            <Link href="/rooms">
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full sm:w-auto sm:px-3 sm:rounded-md">
                <MessagesSquare className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Chats</span>
              </Button>
            </Link>
            <Link href="/story">
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full sm:w-auto sm:px-3 sm:rounded-md">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Story</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Anonymous
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Your identity is hidden
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/account/archive">
                  <DropdownMenuItem className="cursor-pointer">
                    <Archive className="mr-2 h-4 w-4" />
                    <span>My Archive</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/account/bookmarks">
                  <DropdownMenuItem className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Bookmarks</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <SignOutButton />
                <DropdownMenuSeparator />
                <DeleteAccountButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
