'use client';

import { useQuery } from '@tanstack/react-query';
import { getCourses, getCourseBySlug, CourseFilters } from '@/services/courses';

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const { data, error } = await getCourses(filters);
      if (error) throw error;
      return data;
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await getCourseBySlug(slug);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
