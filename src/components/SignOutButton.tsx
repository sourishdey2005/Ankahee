'use client'

import { signOutAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function SignOutButton({ className }: { readonly className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut(e: React.MouseEvent) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setIsLoading(true);
    try {
        await signOutAction();
        router.push('/login');
        router.refresh(); 
    } catch (err) {
        console.error("Sign out failed:", err);
        setIsLoading(false);
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isLoading}
      className={`w-full flex items-center h-full text-left disabled:opacity-50 ${className || ''}`}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> : <LogOut className="mr-2 h-4 w-4" />}
      <span>{isLoading ? 'Splitting from Void...' : 'Sign Out'}</span>
    </button>
  )
}
