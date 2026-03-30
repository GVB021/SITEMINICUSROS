import { supabase } from '@/lib/supabase';

export async function getUserProgress(userId: string, courseId?: string) {
  let query = supabase
    .from('progress')
    .select('*, lessons(*)')
    .eq('user_id', userId);
  
  if (courseId) {
    query = query.eq('lessons.course_id', courseId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('progress')
    .upsert([
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      } as any,
    ])
    .select()
    .single();
  
  return { data, error };
}

export async function toggleFavorite(userId: string, courseId: string) {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    return { data: null, error };
  } else {
    // Add favorite
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, course_id: courseId } as any])
      .select()
      .single();
    
    return { data, error };
  }
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, courses(*, lessons(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function rateCourse(userId: string, courseId: string, stars: number, review?: string) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert([
      {
        user_id: userId,
        course_id: courseId,
        stars,
        review: review || null,
      } as any,
    ])
    .select()
    .single();
  
  return { data, error };
}

export async function getCourseRatings(courseId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}
