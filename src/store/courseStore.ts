import { create } from 'zustand';
import localforage from 'localforage';
import { courses as initialCourses, Course } from '../data/courses';

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  loadCourses: () => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: true,
  loadCourses: async () => {
    try {
      const storedCourses = await localforage.getItem<Course[]>('courses');
      
      if (storedCourses && storedCourses.length > 0) {
        // Check if we have new hardcoded courses that aren't in storedCourses
        const storedIds = new Set(storedCourses.map(c => c.id));
        const newHardcodedCourses = initialCourses.filter(c => !storedIds.has(c.id));
        
        if (newHardcodedCourses.length > 0) {
          const combinedCourses = [...storedCourses, ...newHardcodedCourses];
          await localforage.setItem('courses', combinedCourses);
          set({ courses: combinedCourses, isLoading: false });
        } else {
          set({ courses: storedCourses, isLoading: false });
        }
      } else {
        // Initialize with default courses
        await localforage.setItem('courses', initialCourses);
        set({ courses: initialCourses, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      set({ courses: initialCourses, isLoading: false });
    }
  },
  addCourse: async (course) => {
    const newCourses = [...get().courses, course];
    await localforage.setItem('courses', newCourses);
    set({ courses: newCourses });
  },
  updateCourse: async (updatedCourse) => {
    const newCourses = get().courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    await localforage.setItem('courses', newCourses);
    set({ courses: newCourses });
  },
  deleteCourse: async (id) => {
    const newCourses = get().courses.filter(c => c.id !== id);
    await localforage.setItem('courses', newCourses);
    set({ courses: newCourses });
  }
}));
