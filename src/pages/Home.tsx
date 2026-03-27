import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Star, BookOpen, Users, Mic2 } from 'lucide-react';
import { courses } from '../data/courses';
import { useHeroStore } from '../store/heroStore';

export default function Home() {
  const { hero, loadHero, isLoading } = useHeroStore();
  const featuredCourse = courses.find(c => c.id === 'plano-de-carreira');
  const recentCourses = courses.filter(c => c.id !== 'plano-de-carreira').slice(0, 3);

  useEffect(() => {
    loadHero();
  }, [loadHero]);

  if (isLoading) {
    return <div className="min-h-screen bg-indigo-950" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img
            src={hero.backgroundImage}
            className="w-full h-full object-cover"
            alt="Banner"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-28 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              {hero.title}<span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">{hero.titleHighlight}</span>.
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 leading-relaxed font-light">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '+100', label: 'Minicursos' },
              { value: '100%', label: 'Gratuito' },
              { value: '24/7', label: 'Acesso Livre' },
              { value: '3', label: 'Áreas de Foco' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl transition-all duration-500 hover:scale-105"
                style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-primary)' }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Career Plan */}
      {featuredCourse && (
        <section className="py-24" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold mb-8 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Módulo em Destaque
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {featuredCourse.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {featuredCourse.description}
                  </p>
                </motion.div>
                <ul className="space-y-5 mb-10">
                  {[
                    { icon: Mic2, text: 'Aprenda a montar seu Voice Reel profissional.' },
                    { icon: Users, text: 'Comportamento e ética dentro do estúdio.' },
                    { icon: BookOpen, text: 'Lista exclusiva de contatos de estúdios para cadastro.', bold: true }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400 mt-0.5 shadow-sm">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-base leading-relaxed ${item.bold ? 'font-semibold' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                        {item.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  to={`/course/${featuredCourse.id}`}
                  className="premium-button inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base text-white"
                >
                  Acessar Plano de Carreira
                </Link>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:w-1/2 w-full"
              >
                <div className="relative rounded-3xl overflow-hidden aspect-video group" style={{ boxShadow: 'var(--shadow-2xl)' }}>
                  <img
                    src={featuredCourse.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Plano de Carreira"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8 pointer-events-none">
                    <div className="text-white">
                      <div className="font-bold text-2xl mb-2">O Guia Definitivo</div>
                      <div className="text-white/90 text-base">Prepare-se para o mercado de trabalho</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Courses */}
      <section className="py-24" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Adicionados Recentemente</h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Explore os últimos minicursos de dublagem e fonoaudiologia.</p>
            </div>
            <Link to="/explore" className="hidden md:inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold hover:gap-3 transition-all duration-300">
              Ver todos os cursos
              <span className="text-xl">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/course/${course.id}`} className="premium-card group flex flex-col rounded-2xl overflow-hidden">
                  <div className="aspect-video relative overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <img
                      src={course.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <span className="glass-morphism text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg" style={{ color: 'var(--text-primary)' }}>
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {course.title}
                    </h3>
                    <p className="text-sm mb-6 line-clamp-3 flex-grow leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm mt-auto pt-5" style={{ borderTop: '1px solid var(--border-primary)' }}>
                      <span className="flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                        <BookOpen className="w-4 h-4" />
                        {course.lessons.length} aulas
                      </span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:gap-2 inline-flex items-center gap-1 transition-all duration-300">
                        Acessar <span className="text-lg">&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/explore" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold hover:gap-3 transition-all duration-300">
              Ver todos os cursos
              <span className="text-xl">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
