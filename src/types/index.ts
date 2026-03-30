export type Category = 'DUBLAGEM' | 'FONOAUDIOLOGIA' | 'CARREIRA';
export type Level = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS_NIVEIS';
export type MediaType = 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ' | 'SLIDE';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  level: Level;
  image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  duration: string;
  media_type: MediaType;
  slide_bg_url: string | null;
  order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Favorite {
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  course_id: string;
  stars: number;
  review: string | null;
  created_at: string;
}

export interface Settings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  featured_course_id: string | null;
  updated_at: string;
}
