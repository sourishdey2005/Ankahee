'use client'

import { signOutAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton({ className }: { readonly className?: string }) {
  const router = useRouter();

  async function handleSignOut(e: React.FormEvent) {
    if (e) e.preventDefault();
    await signOutAction();
    router.push('/login');
    router.refresh(); // Ensure session state is cleared in memory
  }

  return (
    <button 
      onClick={handleSignOut}
      className={`w-full flex items-center h-full text-left ${className || ''}`}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}
