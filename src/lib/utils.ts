import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const EDIT_WINDOW_MINUTES = 20;

export function isEditable(createdAt: string | Date): boolean {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInMinutes = diffInMs / (1000 * 60);
  return diffInMinutes < EDIT_WINDOW_MINUTES;
}
