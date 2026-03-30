export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          category: 'DUBLAGEM' | 'FONOAUDIOLOGIA' | 'CARREIRA'
          level: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS_NIVEIS'
          image_url: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          category: 'DUBLAGEM' | 'FONOAUDIOLOGIA' | 'CARREIRA'
          level: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS_NIVEIS'
          image_url: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          category?: 'DUBLAGEM' | 'FONOAUDIOLOGIA' | 'CARREIRA'
          level?: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS_NIVEIS'
          image_url?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string
          duration: string
          media_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ' | 'SLIDE'
          slide_bg_url: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content: string
          duration: string
          media_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ' | 'SLIDE'
          slide_bg_url?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string
          duration?: string
          media_type?: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ' | 'SLIDE'
          slide_bg_url?: string | null
          order?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: string
          created_at?: string
        }
      }
      progress: {
        Row: {
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
        }
      }
      favorites: {
        Row: {
          user_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          course_id?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          course_id: string
          stars: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          stars: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          stars?: number
          review?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          hero_title: string
          hero_subtitle: string
          hero_image_url: string
          featured_course_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          hero_title: string
          hero_subtitle: string
          hero_image_url: string
          featured_course_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          hero_title?: string
          hero_subtitle?: string
          hero_image_url?: string
          featured_course_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}
