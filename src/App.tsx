/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';
import AdminPanel from './pages/AdminPanel';
import { useCourseStore } from './store/courseStore';

export default function App() {
  const loadCourses = useCourseStore(state => state.loadCourses);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/course/:courseId" element={<CourseView />} />
          <Route path="/course/:courseId/lesson/:lessonId" element={<LessonView />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}
