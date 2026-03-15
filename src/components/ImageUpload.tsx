"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

export function ImageUpload({ onUpload }: { onUpload: (storageId: string | undefined) => void }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      
      const { storageId } = await result.json();
      onUpload(storageId);
      // We don't clear state here, we let the parent handle success flow
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
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
          <Image
            src={previewUrl}
            alt="Upload preview"
            fill
            className="object-cover"
          />
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-2 left-2 right-2">
            <Button 
              size="sm" 
              className="w-full bg-background/80 hover:bg-background text-foreground backdrop-blur-sm"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isUploading ? "Uploading..." : "Confirm Image"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
