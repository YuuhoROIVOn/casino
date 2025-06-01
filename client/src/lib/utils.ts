import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number to currency format
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

// Random number between min and max
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffles an array (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Generate a random game result with bias
export function generateGameResult(winChance: number = 0.4): boolean {
  return Math.random() <= winChance;
}

// Delay promise for animations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get possessive form of a string
export function getPossessive(str: string): string {
  if (!str) return '';
  return str.endsWith('s') ? `${str}'` : `${str}'s`;
}
