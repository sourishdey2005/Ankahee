"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { 
  Home, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Bell,
  Search,
  Menu,
  X,
  Mail,
  BookOpen,
  Archive,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import Image from "next/image";
import SignOutButton from "./SignOutButton";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isGuest } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login") return null;

  const navLinks = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/new", label: "Whisper", icon: PlusCircle },
    { href: "/rooms", label: "Rooms", icon: MessageSquare },
    { href: "/letters", label: "Letters", icon: Mail },
    { href: "/story", label: "Stories", icon: BookOpen },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/0 ${
        scrolled ? "bg-black/60 backdrop-blur-2xl border-white/5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 group-hover:bg-primary/40 transition-colors"></div>
            <Image 
              src="https://res.cloudinary.com/dodhvvewu/image/upload/v1771867857/9f24ff89-ae84-41e9-8d46-e1f47d467017_xoroac.png" 
              alt="Ankahee Logo" 
              width={36} 
              height={36} 
              className="relative rounded-lg border border-white/10" 
            />
          </motion.div>
          <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
            Ankahee
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-full backdrop-blur-md px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className={`relative rounded-full px-4 py-2 transition-all duration-300 h-9 ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    <link.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    <span className="font-medium">{link.label}</span>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground/60 hover:text-white rounded-full h-10 w-10">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground/60 hover:text-white rounded-full h-10 w-10 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-black"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full border border-white/10 p-0 overflow-hidden bg-white/5 hover:bg-white/10"
              >
                <div className="bg-gradient-to-br from-primary/40 to-purple-600/40 w-full h-full flex items-center justify-center">
                   <User className="h-5 w-5 text-white/80" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0A]/95 backdrop-blur-2xl border-white/10">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{isGuest ? "Guest Identity" : (user?.username || "Unknown Entity")}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user?.email || "Encrypted Identity"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-primary" asChild>
                <Link href="/account/archive" className="flex items-center w-full">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>My Archive</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-primary" asChild>
                <Link href="/account/bookmarks" className="flex items-center w-full">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Bookmarks</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-white/5" asChild>
                <SignOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-3xl border-t border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"} 
                      className={`w-full justify-start text-lg h-14 rounded-2xl ${
                        isActive ? "bg-white/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <link.icon className={`mr-4 h-6 w-6 ${isActive ? "text-primary" : ""}`} />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-white/5">
                <SignOutButton className="w-full justify-start text-lg h-14 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
