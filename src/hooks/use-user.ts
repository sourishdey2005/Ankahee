import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing ID in localStorage
    const storedId = localStorage.getItem('ankahee_guest_id');
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = `guest_${uuidv4().split('-')[0]}_${Date.now().toString(36)}`;
      localStorage.setItem('ankahee_guest_id', newId);
      setUserId(newId);
    }
  }, []);

  const user = userId ? {
    id: userId,
    username: 'Shadow',
    _id: userId, // for backwards compatibility
  } : null;

  return {
    user,
    userId,
    isLoading: userId === null,
    isAuthenticated: userId !== null,
  };
}
