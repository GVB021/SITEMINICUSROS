import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, bucket: string = 'course-images') {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    return { data: null, error };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return { data: publicUrl, error: null };
}

export async function deleteImage(fileName: string, bucket: string = 'course-images') {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);
  
  return { error };
}
