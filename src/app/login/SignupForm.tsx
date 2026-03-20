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
import { signUpAction } from "@/app/actions/auth";
import { motion } from "framer-motion";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await signUpAction(values);
        if (result.success) {
          toast({
            title: "Identity Created",
            description: "Welcome to your new sanctuary.",
          });
          window.location.href = "/feed";
        }
      } catch (err: any) {
        toast({
          title: "Setup Failed",
          description: err.message || "An unexpected error occurred.",
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
              <FormLabel className="text-muted-foreground">Shadow Email</FormLabel>
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
              <FormLabel className="text-muted-foreground">Secret Key</FormLabel>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Confirm Key</FormLabel>
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
            className="w-full font-bold h-12 text-base bg-gradient-to-r from-purple-600 to-primary hover:from-purple-600/90 hover:to-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(124,58,237,0.2)]"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Initialize Account"
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
