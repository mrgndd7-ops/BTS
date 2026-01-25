import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS class names'leri birleştiren utility fonksiyonu
 * Conditional classes ve conflict resolution için kullanılır
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
