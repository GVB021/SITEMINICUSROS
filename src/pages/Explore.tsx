import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { courses } from '../data/courses';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = categoryFilter === 'All' || course.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const categories = ['All', 'Dublagem', 'Fonoaudiologia', 'Carreira'];

  return (
    <div className="min-h-screen py-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Explorar Minicursos</h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Acesse milhares de materiais de apoio gratuitos para aprimorar sua técnica vocal e impulsionar sua carreira na dublagem.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass-morphism p-5 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 transition-all duration-300" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-primary)' }}>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 mr-2 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat.toLowerCase() })}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  (categoryFilter.toLowerCase() === cat.toLowerCase()) || (categoryFilter === 'All' && cat === 'All')
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  background: (categoryFilter.toLowerCase() === cat.toLowerCase()) || (categoryFilter === 'All' && cat === 'All') ? undefined : 'var(--bg-elevated)',
                  color: (categoryFilter.toLowerCase() === cat.toLowerCase()) || (categoryFilter === 'All' && cat === 'All') ? undefined : 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                {cat === 'All' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 rounded-xl leading-5 sm:text-sm transition-all duration-300 focus:scale-[1.02]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
              onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-8 text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>
          Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link 
                to={`/course/${course.id}`} 
                className={`premium-card group flex flex-col h-full rounded-2xl overflow-hidden ${
                  course.id === 'plano-de-carreira' ? 'ring-2 ring-amber-400' : ''
                }`}
                style={{
                  boxShadow: course.id === 'plano-de-carreira' ? 'var(--shadow-premium)' : undefined
                }}
              >
                <div className="aspect-video relative overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <img
                    src={course.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                    <span className="glass-morphism text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md" style={{ color: 'var(--text-primary)' }}>
                      {course.category}
                    </span>
                    {course.id === 'plano-de-carreira' && (
                       <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                         Destaque
                       </span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {course.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2 flex-grow leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs mt-auto pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons.length} aulas
                    </span>
                    <span className="px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
              <Search className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Nenhum curso encontrado</h3>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Tente ajustar seus filtros ou termo de busca.</p>
            <button 
              onClick={() => { setSearchParams({}); setSearchQuery(''); }}
              className="premium-button px-6 py-3 rounded-xl font-semibold text-white"
            >
              Limpar todos os filtros
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
