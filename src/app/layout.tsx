import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Ankahee - Speak Freely. Stay Unknown.',
  description: 'An anonymous confession platform where posts disappear after 24 hours.',
};

import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Navbar from "@/components/Navbar";
import ScreenshotProtection from "@/components/ScreenshotProtection";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-[#030303] text-foreground antialiased selection:bg-primary/30 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <ScreenshotProtection />
            <Navbar />
            <main className="min-h-screen relative select-none">
              {children}
            </main>
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
