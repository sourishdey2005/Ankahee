"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signInAction } from "@/app/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ResetPasswordForm from "./ResetPasswordForm";
import { useState } from "react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [resetOpen, setResetOpen] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await signInAction(values);
        if (result.success) {
          toast({
            title: "Welcome Back",
            description: "Accessing your sanctuary...",
          });
          // Use hard redirect to ensure session cookie is picked up by all components
          window.location.href = "/feed";
        } else {
          toast({
            title: "Identity Check Failed",
            description: result.error || "The void does not recognize these credentials.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "System Error",
          description: "A glitch in the void occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="name@example.com" 
                  {...field} 
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-muted-foreground">Password</FormLabel>
                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="px-0 text-xs text-muted-foreground/60 hover:text-primary h-auto py-0">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-white/10">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Enter your email and a new password. No email verification needed in this sanctuary.
                      </DialogDescription>
                    </DialogHeader>
                    <ResetPasswordForm onSuccess={() => setResetOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            className="w-full font-bold h-12 text-base bg-gradient-to-r from-primary to-orange-400 hover:from-primary/90 hover:to-orange-400/90 text-primary-foreground shadow-[0_0_20px_rgba(255,153,51,0.2)]"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
