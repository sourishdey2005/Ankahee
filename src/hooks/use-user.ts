"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getSessionUser } from "@/app/actions/auth";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        // 1. Try to get authenticated user from session cookie via server action
        const sessionUser = await getSessionUser();
        
        if (sessionUser) {
          setUser(sessionUser);
        } else {
          // 2. Fallback to guest ID in localStorage
          const storedId = localStorage.getItem("ankahee_guest_id");
          if (storedId) {
            setUser({ id: storedId, username: "Guest", isGuest: true });
          } else {
            const newId = `guest_${uuidv4().split("-")[0]}_${Date.now().toString(36)}`;
            localStorage.setItem("ankahee_guest_id", newId);
            setUser({ id: newId, username: "Guest", isGuest: true });
          }
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    user,
    userId: user?.id || null,
    isLoading,
    isAuthenticated: !!user && !user.isGuest,
    isGuest: user?.isGuest || false,
  };
}
