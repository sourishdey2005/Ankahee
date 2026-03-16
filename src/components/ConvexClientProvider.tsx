"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-white mb-2">Convex Config Missing</h2>
          <p className="text-muted-foreground text-sm mb-6">
            The application cannot connect to the void without <code>NEXT_PUBLIC_CONVEX_URL</code>.
          </p>
          <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-left font-mono text-xs text-white/60 mb-6">
             NEXT_PUBLIC_CONVEX_URL={process.env.NEXT_PUBLIC_CONVEX_URL || 'undefined'}
          </div>
          <p className="text-xs text-muted-foreground italic">
            Check your Vercel environment variables and redeploy.
          </p>
        </div>
      </div>
    );
  }
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
