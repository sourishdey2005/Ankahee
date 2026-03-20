"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestMoodTagForConfession } from "@/ai/flows/suggest-mood-tag-flow";
import { MoodTags } from "@/lib/mood-tags";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, PlusCircle, X, HelpCircle, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { createPost } from "@/app/actions/posts";
import { useUser } from "@/hooks/use-user";

const formSchema = z
  .object({
    content: z
      .string()
      .min(10, "Must be at least 10 characters.")
      .max(500, "Cannot exceed 500 characters."),
    mood: z.enum(MoodTags).optional(),
    pollOptionOne: z
      .string()
      .max(80, "Option cannot exceed 80 characters.")
      .optional(),
    pollOptionTwo: z
      .string()
      .max(80, "Option cannot exceed 80 characters.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.pollOptionOne || data.pollOptionTwo) {
        return (
          !!data.pollOptionOne &&
          !!data.pollOptionTwo &&
          data.pollOptionOne.length > 0 &&
          data.pollOptionTwo.length > 0
        );
      }
      return true;
    },
    {
      message: "Both poll options are required if you add a poll.",
      path: ["pollOptionTwo"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export default function NewPostForm({
  promptText,
  parentId,
}: {
  promptText?: string;
  parentId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [creationMode, setCreationMode] = useState<null | "poll" | "void">(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: parentId ? "" : promptText || "",
      mood: undefined,
      pollOptionOne: "",
      pollOptionTwo: "",
    },
  });

  const contentValue = form.watch("content");

  const getSuggestion = useCallback(async (text: string) => {
    if (text.length < 20) {
      setSuggestedMood(null);
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestMoodTagForConfession({ confessionText: text });
      if (result.moodTag) {
        setSuggestedMood(result.moodTag);
      }
    } catch (error) {
      console.error("Error suggesting mood:", error);
      setSuggestedMood(null);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  const debouncedSuggest = useCallback(debounce(getSuggestion, 1000), [
    getSuggestion,
  ]);

  useEffect(() => {
    debouncedSuggest(contentValue);
  }, [contentValue, debouncedSuggest]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(false);

    startTransition(async () => {
      try {
        await createPost({
          content: values.content,
          mood: values.mood,
          imageUrl: imageUrl,
          parentId: parentId ? parseInt(parentId) : undefined,
          isVoidQuestion: creationMode === "void",
          pollOptionOne: values.pollOptionOne,
          pollOptionTwo: values.pollOptionTwo,
          authorId: user.id,
        });

        toast({
          title: "Whisper Received",
          description: "Your story has been merged with the void.",
        });
        router.push(parentId ? `/confession/${parentId}` : "/feed");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to post",
          variant: "destructive",
        });
      }
    });
  };

  const progress = (contentValue.length / 500) * 100;

  return (
    <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary/50 opacity-50"></div>
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {parentId && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-white/10 rounded-xl bg-white/5 text-sm text-muted-foreground backdrop-blur-md"
              >
                Connecting your thread to another's path...
              </motion.div>
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex justify-between items-end">
                    <FormLabel className="text-xl font-bold text-foreground/90">
                      {creationMode === "void" ? "Ask the Void" : "Share your Truth"}
                    </FormLabel>
                    <div className="text-xs font-mono text-muted-foreground/60">
                      {field.value.length} / 500
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Textarea
                        placeholder={
                          creationMode === "void"
                            ? "What do you want to ask from the darkness?"
                            : "Speak your unfiltered heart. Here, judgment is an echo from another world."
                        }
                        className="min-h-[180px] sm:min-h-[220px] text-lg bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none p-6"
                        {...field}
                      />
                      {/* Character limit bar */}
                      <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full rounded-b-md overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary/60"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-base font-semibold text-muted-foreground flex items-center gap-2">
                    Visualizing frequencies...
                    {isSuggesting && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {MoodTags.map((mood) => {
                        const isSelected = field.value === mood;
                        const isSuggested = suggestedMood === mood;
                        return (
                          <motion.div
                            key={mood}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() =>
                                field.onChange(isSelected ? undefined : mood)
                              }
                              className={`relative h-10 px-4 rounded-full border-white/10 transition-all ${
                                isSelected 
                                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,153,51,0.3)]" 
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              {mood}
                              <AnimatePresence>
                                {isSuggested && !isSelected && (
                                  <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-1 -right-1 flex h-4 w-4"
                                  >
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary p-0.5">
                                      <Sparkles className="h-full w-full text-primary-foreground" />
                                    </span>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6 pt-2">
              <div className="flex flex-wrap gap-4">
                <Button 
                  type="button"
                  variant={creationMode === 'poll' ? "secondary" : "ghost"} 
                  onClick={() => setCreationMode(creationMode === 'poll' ? null : 'poll')} 
                  className={`h-12 px-6 rounded-xl border border-white/5 ${creationMode === 'poll' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Poll Component
                </Button>
                <Button 
                  type="button"
                  variant={creationMode === 'void' ? "secondary" : "ghost"} 
                  onClick={() => setCreationMode(creationMode === 'void' ? null : 'void')} 
                  className={`h-12 px-6 rounded-xl border border-white/5 ${creationMode === 'void' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Ask Void
                </Button>
              </div>

              <AnimatePresence>
                {creationMode === "poll" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 border border-white/10 rounded-2xl space-y-4 bg-white/[0.02] backdrop-blur-md">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-primary/80">Active Inquiry</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full border border-white/5" 
                          onClick={() => {
                            setCreationMode(null);
                            form.setValue("pollOptionOne", "");
                            form.setValue("pollOptionTwo", "");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pollOptionOne"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">Path A</FormLabel>
                              <FormControl>
                                <Input placeholder="Option One" {...field} className="bg-white/5 border-white/10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pollOptionTwo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">Path B</FormLabel>
                              <FormControl>
                                <Input placeholder="Option Two" {...field} className="bg-white/5 border-white/10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {creationMode === "void" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 border border-white/10 rounded-2xl space-y-3 bg-white/[0.02] backdrop-blur-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-primary/80">
                          <HelpCircle className="h-5 w-5" /> Void Feedback
                        </h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/5" onClick={() => setCreationMode(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                        Your whisper transforms into a catalyst. Others can only respond with a single word, weaving a collective dream.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-4">
              <FormLabel className="text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Visual Identity (Optional)
              </FormLabel>
              <div className="p-1 rounded-2xl bg-white/5 border border-dashed border-white/10 hover:border-primary/50 transition-colors">
                <ImageUpload onUpload={(url) => setImageUrl(url)} />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-4"
            >
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full h-14 font-extrabold text-xl bg-gradient-to-r from-primary via-orange-400 to-purple-600 hover:opacity-[0.95] text-primary-foreground shadow-[0_10px_30px_rgba(255,153,51,0.25)] transition-all duration-500 rounded-2xl"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  "Merge into Darkness"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
