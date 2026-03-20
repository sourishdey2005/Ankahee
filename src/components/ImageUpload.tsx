"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {isProcessing ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[200px] flex flex-col items-center gap-3 py-6 px-10 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
              >
                {/* Energy Pulse Background */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(124,58,237,0.1)_90deg,transparent_180deg)]"
                />

                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                    />
                </div>
                
                <div className="space-y-1 text-center relative z-10">
                    <p className="text-sm font-headline font-bold text-white tracking-widest uppercase">Inhaling Whisper</p>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em]">Converting to void frequency</p>
                </div>

                {/* Shimmer Progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden relative">
                    <motion.div 
                        className="absolute inset-0 bg-primary"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/30 shadow-lg"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs font-headline font-bold text-green-500 tracking-wider">VISUAL TRUTH ATTACHED</span>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
