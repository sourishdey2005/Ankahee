"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2, User, Clock, Send } from "lucide-react";
import Image from "next/image";

export default function StoriesPage() {
  const stories = useQuery(api.stories.getStories);
  const createStory = useMutation(api.stories.createStory);
  
  const [text, setText] = useState("");
  const [storageId, setStorageId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await createStory({
        text,
        authorId: "anonymous", // Simplified for now
        authorName: "Anonymous Soul",
        storageId: storageId as any,
      });
      setText("");
      setStorageId(undefined);
    } catch (error) {
      console.error("Failed to create story", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Real-time Stories
        </h1>
        <p className="text-muted-foreground">Share your moments. They sync instantly across the world.</p>
      </header>

      <Card className="mb-12 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-lg font-semibold">Share a fragment of your life</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-background/50 border-primary/10 focus-visible:ring-primary/30"
            />
            <ImageUpload onUpload={(id) => setStorageId(id)} />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post Story
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        {!stories ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stories.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No stories yet. Be the first to share one!</p>
        ) : (
          stories.map((story) => (
            <Card key={story._id} className="overflow-hidden border-primary/5 hover:border-primary/20 transition-colors bg-card/30">
              {story.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={story.imageUrl}
                    alt="Story content"
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-500"
                  />
                </div>
              )}
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">{story.text}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t border-primary/5 pt-4">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{story.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(story.createdAt).toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
