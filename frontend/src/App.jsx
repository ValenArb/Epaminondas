import { useState } from 'react';
import { BookOpen, Search, Users, FileText, Book } from 'lucide-react';

import Buscador from './components/Buscador';
import Libreta from './components/Libreta';
import Fotocopias from './components/Fotocopias';
import Encargos from './components/Encargos';

function App() {
  const [activeModule, setActiveModule] = useState('buscador');

  const renderModule = () => {
    switch (activeModule) {
      case 'buscador':
        return <Buscador />;
      case 'libreta':
        return <Libreta />;
      case 'fotocopias':
        return <Fotocopias />;
      case 'encargos':
        return <Encargos />;
      default:
        return <Buscador />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-blue-200">

      {/* Sidebar: Menú de Navegación */}
      <div className="w-72 bg-[#0F172A] text-white flex flex-col shadow-xl z-10">
        <div className="p-8 border-b border-gray-800/50">
          <h1 className="text-2xl font-black flex items-center gap-3 tracking-tight">
            <BookOpen className="text-blue-500" size={32} /> Mi Librería
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveModule('buscador')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeModule === 'buscador' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Search size={22} /> Precios
          </button>

          <button
            onClick={() => setActiveModule('libreta')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeModule === 'libreta' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={22} /> Libreta (Fiados)
          </button>

          <button
            onClick={() => setActiveModule('fotocopias')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeModule === 'fotocopias' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText size={22} /> Fotocopias
          </button>

          <button
            onClick={() => setActiveModule('encargos')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeModule === 'encargos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Book size={22} /> Encargos Libros
          </button>
        </nav>

        <div className="p-6 text-slate-500 text-sm font-medium border-t border-gray-800/50">
          Sistema de Gestión MVP
        </div>
      </div>

      {/* Área de Trabajo Principal */}
      <div className="flex-1 overflow-auto bg-[#F8FAFC]">
        {renderModule()}
      </div>

    </div>
  );
}

export default App;
