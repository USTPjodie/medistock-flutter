import { clsx, type ClassValue } from 'clsx';

// Simple cn function for React Native (no tailwind-merge)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Format number with leading zero
export function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

// Get percentage color based on value
export function getPercentageColor(percentage: number): 'low' | 'medium' | 'high' {
  if (percentage < 20) return 'low';
  if (percentage < 50) return 'medium';
  return 'high';
}
