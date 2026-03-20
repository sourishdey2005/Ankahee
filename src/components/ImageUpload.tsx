"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useToast } from "@/hooks/use-toast";

export function ImageUpload({ onUpload }: { onUpload: (url: string | undefined) => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
            title: "Overload Detected",
            description: "The void cannot consume files larger than 20MB.",
            variant: "destructive"
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      setIsProcessing(true);
      
      try {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        };

        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => {
          onUpload(reader.result as string);
          setIsProcessing(false);
          toast({
            title: "Whisper Visualized",
            description: `Compressed ${ (file.size / (1024*1024)).toFixed(1) }MB to ${ (compressedFile.size / (1024*1024)).toFixed(1) }MB for the void.`,
          });
        };
      } catch (error) {
        console.error("Compression error:", error);
        toast({
            title: "Distortion Error",
            description: "Failed to compress the visual truth.",
            variant: "destructive"
        });
        setIsProcessing(false);
      }
    }
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    onUpload(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      {!previewUrl ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-accent/50"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload an image</span>
        </Button>
      ) : (
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-2 left-2 right-2">
            {isProcessing ? (
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-background/80 backdrop-blur-md rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Processing...</span>
                </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-green-500/20 backdrop-blur-md rounded-md border border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold text-green-500">Image Attached</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
