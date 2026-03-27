import { useParams, Link, Navigate } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, ChevronLeft, Star, FileText, Headphones, HelpCircle, Presentation } from 'lucide-react';
import { courses } from '../data/courses';

export default function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <Navigate to="/explore" replace />;
  }

  const isCareerPlan = course.id === 'plano-de-carreira';

  const getMediaIcon = (type: string, className: string) => {
    switch (type) {
      case 'video': return <PlayCircle className={className} />;
      case 'audio': return <Headphones className={className} />;
      case 'quiz': return <HelpCircle className={className} />;
      case 'slide': return <Presentation className={className} />;
      case 'text':
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Course Header */}
      <div className="relative text-white py-16 md:py-24 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/explore" className="inline-flex items-center text-purple-200 hover:text-white mb-10 transition-all duration-300 text-sm font-semibold hover:gap-2 gap-1">
            <ChevronLeft className="w-4 h-4" />
            Voltar para Explorar
          </Link>
          
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            <div className="w-full md:w-1/3 shrink-0">
              <div className={`aspect-video md:aspect-square rounded-3xl overflow-hidden group ${isCareerPlan ? 'ring-4 ring-amber-400/60' : ''}`} style={{ boxShadow: 'var(--shadow-2xl)' }}>
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none"></div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                  {course.category}
                </span>
                <span className="glass-morphism text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-md" style={{ color: 'var(--text-primary)' }}>
                  {course.level}
                </span>
                {isCareerPlan && (
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Destaque
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-purple-100 mb-10 leading-relaxed max-w-3xl font-light">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-8 text-base text-purple-200 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{course.lessons.length} Aulas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Acesso Ilimitado</span>
                </div>
              </div>

              {course.lessons.length > 0 && (
                <Link
                  to={`/course/${course.id}/lesson/${course.lessons[0].id}`}
                  className="inline-flex items-center justify-center bg-white text-purple-900 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                >
                  <PlayCircle className="w-6 h-6 mr-3" />
                  Iniciar Curso
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Conteúdo do Curso</h2>
        
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ borderTop: '1px solid var(--border-primary)' }}>
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to={`/course/${course.id}/lesson/${lesson.id}`}
                className={`flex items-center p-5 sm:p-7 transition-all duration-300 group ${
                  lesson.isSpecial ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                }`}
                style={{
                  borderBottom: index < course.lessons.length - 1 ? '1px solid var(--border-primary)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!lesson.isSpecial) {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!lesson.isSpecial) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div className="flex-shrink-0 mr-5 sm:mr-7">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                    lesson.isSpecial 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-md' 
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:shadow-md'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-base sm:text-lg font-bold truncate transition-colors duration-300 ${
                      lesson.isSpecial ? 'text-amber-900 dark:text-amber-200' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
                    }`} style={{ color: lesson.isSpecial ? undefined : 'var(--text-primary)' }}>
                      {lesson.title}
                    </h3>
                    {lesson.isSpecial && (
                      <span className="shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Contatos
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm gap-4" style={{ color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center gap-2">
                      {getMediaIcon(lesson.mediaType, "w-4 h-4")}
                      <span className="capitalize font-medium">
                        {lesson.mediaType === 'text' ? 'Leitura' : 
                         lesson.mediaType === 'slide' ? 'Slide' : 
                         lesson.mediaType}
                      </span> • {lesson.duration}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    lesson.isSpecial 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:shadow-md'
                  }`}>
                    <PlayCircle className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
