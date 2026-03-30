import { supabase } from '@/lib/supabase';
import { Course, Lesson, Category, Level } from '@/types';

export interface CourseFilters {
  category?: Category;
  level?: Level;
  search?: string;
}

export async function getCourses(filters?: CourseFilters) {
  let query = supabase
    .from('courses')
    .select('*, lessons(*)')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.level) {
    query = query.eq('level', filters.level);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  return { data: (data as unknown) as Course[], error };
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  
  return { data: (data as unknown) as Course, error };
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(*)')
    .eq('id', id)
    .single();
  
  return { data: (data as unknown) as Course, error };
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('courses')
    .insert([course as any])
    .select()
    .single();
  
  return { data: (data as unknown) as Course, error };
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  
  return { data: (data as unknown) as Course, error };
}

export async function deleteCourse(id: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  return { error };
}

export async function createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert([lesson as any])
    .select()
    .single();
  
  return { data: (data as unknown) as Lesson, error };
}

export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  
  return { data: (data as unknown) as Lesson, error };
}

export async function deleteLesson(id: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);
  
  return { error };
}
