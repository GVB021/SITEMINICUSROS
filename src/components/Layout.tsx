import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic2, BookOpen, Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Explorar Cursos', path: '/explore' },
    { name: 'Plano de Carreira', path: '/course/plano-de-carreira' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav className="glass-morphism border-b sticky top-0 z-50 transition-all duration-300" style={{ borderColor: 'var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Mic2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Voz & Carreira
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    style={{ color: location.pathname === link.path ? undefined : 'var(--text-secondary)' }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  style={{ color: location.pathname === link.path ? undefined : 'var(--text-primary)' }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative mt-auto py-16 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-purple-800/5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                  <Mic2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Voz & Carreira
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Material de apoio gratuito com milhares de minicursos de dublagem, fonoaudiologia e desenvolvimento de carreira.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base" style={{ color: 'var(--text-primary)' }}>Categorias</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    to="/explore?category=dublagem" 
                    className="inline-flex items-center gap-2 transition-all duration-300 hover:translate-x-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    Dublagem
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/explore?category=fonoaudiologia" 
                    className="inline-flex items-center gap-2 transition-all duration-300 hover:translate-x-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    Fonoaudiologia
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/explore?category=carreira" 
                    className="inline-flex items-center gap-2 transition-all duration-300 hover:translate-x-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    Carreira e Mercado
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base" style={{ color: 'var(--text-primary)' }}>Acesso Livre</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Nossa plataforma é 100% gratuita e não exige cadastro. Acreditamos na democratização do conhecimento para futuros dubladores.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 text-sm text-center" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}>
            <p>&copy; {new Date().getFullYear()} Voz & Carreira. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
