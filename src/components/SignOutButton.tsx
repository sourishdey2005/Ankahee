'use client'

import { signOutAction } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from './ui/dropdown-menu'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOutAction()
    router.push('/login')
  }

  return (
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </DropdownMenuItem>
  )
}
