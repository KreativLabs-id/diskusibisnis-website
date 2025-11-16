import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return 'Tanggal tidak valid';
  
  try {
    // Parse the date properly
    const d = new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Tanggal tidak valid';
    }
    
    // Get current time in Indonesia timezone (UTC+7)
    const now = new Date();
    const nowIndonesia = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for WIB
    const dateIndonesia = new Date(d.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for WIB
    
    // Calculate difference in milliseconds using Indonesia time
    const diff = nowIndonesia.getTime() - dateIndonesia.getTime();
    
    // Convert to different units
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    
    // Return relative time
    if (seconds < 60) return 'baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    if (weeks < 4) return `${weeks} minggu lalu`;
    
    // Return formatted date in Indonesia timezone
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Tanggal tidak valid';
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'jt';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'rb';
  }
  return num.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
