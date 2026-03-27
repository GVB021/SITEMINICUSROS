import React, { useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import { Course, Lesson, MediaType } from '../data/courses';
import { Plus, Trash2, Image as ImageIcon, Save, X } from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { courses, addCourse, updateCourse, deleteCourse } = useCourseStore();
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pipoca') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createNewCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: 'Novo Curso',
      description: '',
      category: 'Carreira',
      imageUrl: 'https://images.unsplash.com/photo-1516280440502-65f536af1214?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      level: 'Iniciante',
      lessons: []
    };
    setEditingCourse(newCourse);
  };

  const addLesson = () => {
    if (!editingCourse) return;
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'Nova Aula',
      duration: '10 min',
      content: '',
      mediaType: 'slide',
      slideBgUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    };
    setEditingCourse({
      ...editingCourse,
      lessons: [...editingCourse.lessons, newLesson]
    });
  };

  const saveCourse = async () => {
    if (!editingCourse) return;
    const exists = courses.some(c => c.id === editingCourse.id);
    if (exists) {
      await updateCourse(editingCourse);
    } else {
      await addCourse(editingCourse);
    }
    setEditingCourse(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Painel Administrativo</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha Master</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite a senha"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
            Acessar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
        {!editingCourse && (
          <button
            onClick={createNewCourse}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" /> Novo Curso
          </button>
        )}
      </div>

      {editingCourse ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Editando Curso</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditingCourse(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <button onClick={saveCourse} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Save className="w-5 h-5" /> Salvar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título do Curso</label>
              <input
                type="text"
                value={editingCourse.title}
                onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={editingCourse.category}
                onChange={e => setEditingCourse({...editingCourse, category: e.target.value as any})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Dublagem">Dublagem</option>
                <option value="Fonoaudiologia">Fonoaudiologia</option>
                <option value="Carreira">Carreira</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={editingCourse.description}
                onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg h-24"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumb do Curso (Imagem Principal)</label>
              <div className="flex items-center gap-4">
                <img src={editingCourse.imageUrl} alt="Thumb" className="w-32 h-20 object-cover rounded-lg border" />
                <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                  <ImageIcon className="w-5 h-5" /> Fazer Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => setEditingCourse({...editingCourse, imageUrl: base64}))} />
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Aulas ({editingCourse.lessons.length})</h3>
              <button onClick={addLesson} className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg">
                <Plus className="w-4 h-4" /> Adicionar Aula
              </button>
            </div>

            <div className="space-y-6">
              {editingCourse.lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-4 border rounded-lg bg-gray-50 relative">
                  <button 
                    onClick={() => {
                      const newLessons = [...editingCourse.lessons];
                      newLessons.splice(index, 1);
                      setEditingCourse({...editingCourse, lessons: newLessons});
                    }}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-12">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título da Aula</label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].title = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].duration = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (Markdown suportado)</label>
                      <textarea
                        value={lesson.content}
                        onChange={e => {
                          const newLessons = [...editingCourse.lessons];
                          newLessons[index].content = e.target.value;
                          setEditingCourse({...editingCourse, lessons: newLessons});
                        }}
                        className="w-full px-3 py-2 border rounded-lg h-32"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Slide</label>
                      <div className="flex items-center gap-4">
                        <img src={lesson.slideBgUrl} alt="Slide" className="w-32 h-20 object-cover rounded-lg border" />
                        <label className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                          <ImageIcon className="w-4 h-4" /> Fazer Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => {
                            const newLessons = [...editingCourse.lessons];
                            newLessons[index].slideBgUrl = base64;
                            setEditingCourse({...editingCourse, lessons: newLessons});
                          })} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{course.lessons.length} aulas</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCourse(course)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este curso?')) {
                        deleteCourse(course.id);
                      }
                    }} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
