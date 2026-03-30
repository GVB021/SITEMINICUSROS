import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'DUBLAGEM': 'Dublagem',
    'FONOAUDIOLOGIA': 'Fonoaudiologia',
    'CARREIRA': 'Carreira'
  };
  return labels[category] || category;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'INICIANTE': 'Iniciante',
    'INTERMEDIARIO': 'Intermediário',
    'AVANCADO': 'Avançado',
    'TODOS_NIVEIS': 'Todos os níveis'
  };
  return labels[level] || level;
}

export function getMediaTypeIcon(mediaType: string): string {
  const icons: Record<string, string> = {
    'VIDEO': '🎥',
    'AUDIO': '🎧',
    'TEXT': '📄',
    'QUIZ': '❓',
    'SLIDE': '📊'
  };
  return icons[mediaType] || '📄';
}
