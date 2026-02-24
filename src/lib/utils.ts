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

export function generateHslColorFromString(str: string, s: number, l: number): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const PATTERNS = [
  // Plus
  (color: string) => `<path d="M10 0 V20 M0 10 H20" stroke="${color}" stroke-width="3"/>`,
  // Dots
  (color: string) => `<circle cx="5" cy="5" r="3" fill="${color}"/><circle cx="15" cy="5" r="3" fill="${color}"/><circle cx="5" cy="15" r="3" fill="${color}"/><circle cx="15" cy="15" r="3" fill="${color}"/>`,
  // Lines
  (color: string) => `<path d="M0 0 L20 20 M20 0 L0 20" stroke="${color}" stroke-width="2.5"/>`,
  // Zigzag
  (color: string) => `<path d="M0 5 H5 L10 15 H15 L20 5" stroke="${color}" stroke-width="2.5" fill="none"/>`,
  // Squares
  (color: string) => `<rect x="2" y="2" width="7" height="7" fill="${color}"/><rect x="11" y="11" width="7" height="7" fill="${color}"/>`,
  // Triangle
  (color: string) => `<path d="M10 2 L18 18 H2 Z" fill="${color}"/>`,
];

export function generateAvatarDataUri(str: string): string {
  let hash = 0;
  if (str.length === 0) return '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Ensure 32-bit integer
  }
  hash = Math.abs(hash);

  const h = hash % 360;
  const s = 40 + (hash % 30); // 40-70 saturation
  const l_bg = 15 + (hash % 15); // 15-30 lightness for background
  
  const backgroundColor = `hsl(${h}, ${s}%, ${l_bg}%)`;
  const foregroundColor = `hsl(${(h + 120) % 360}, ${s + 20}%, 75%)`;
  
  const patternIndex = hash % PATTERNS.length;
  const patternSvgContent = PATTERNS[patternIndex](foregroundColor);

  const svg = `<svg width="40" height="40" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" fill="${backgroundColor}" />
    <g transform="rotate(${hash % 90} 10 10)">
      ${patternSvgContent}
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
