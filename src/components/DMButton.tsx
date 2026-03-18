'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { getOrCreateDMAction } from '@/app/actions/rooms';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

export function DMButton({ 
  targetUserId, 
  variant = "ghost",
  size = "sm",
  label = "Message"
}: { 
  targetUserId: string, 
  variant?: any,
  size?: any,
  label?: string
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleCreateDM = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to message users.", variant: "destructive" });
      router.push('/login');
      return;
    }

    if (user.id === targetUserId) {
        toast({ title: "Error", description: "You cannot message yourself." });
        return;
    }

    setIsPending(true);
    try {
      const room = await getOrCreateDMAction(user.id, targetUserId);
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      console.error('DM Error:', err);
      toast({ title: "Error", description: "Failed to open private chat.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleCreateDM}
      disabled={isPending}
      className={label ? 'gap-2' : 'p-2'}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <MessageSquarePlus className="h-4 w-4 text-primary" />}
      {label && <span>{label}</span>}
    </Button>
  );
}
