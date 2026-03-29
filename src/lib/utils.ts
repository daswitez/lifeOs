import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilidad esencial para fusionar clases dinámicas de Tailwind 
 * sin colisiones (Ej: pr-4 + px-2 = px-2).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
