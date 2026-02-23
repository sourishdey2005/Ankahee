'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from './ui/dropdown-menu'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </DropdownMenuItem>
  )
}
