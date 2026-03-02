import { useState, useEffect } from 'react';
import { BookOpen, Search, Users, FileText, Book, LogOut, Lock } from 'lucide-react';

import api from './api';
import Buscador from './components/Buscador';
import Libreta from './components/Libreta';
import Fotocopias from './components/Fotocopias';
import Encargos from './components/Encargos';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeModule, setActiveModule] = useState('encargos');

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hide libreta and precios based on user preference
  const showLibreta = false;
  const showPrecios = false;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="flex bg-slate-100 h-screen font-sans justify-center items-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full text-white">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-8">Acceso Epaminondas</h1>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Usuario</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'buscador':
        return showPrecios ? <Buscador /> : <Encargos />;
      case 'libreta':
        return showLibreta ? <Libreta /> : <Encargos />;
      case 'fotocopias':
        return <Fotocopias />;
      case 'encargos':
        return <Encargos />;
      default:
        return <Encargos />;
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
          {showPrecios && (
            <button
              onClick={() => setActiveModule('buscador')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
                ${activeModule === 'buscador' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Search size={22} /> Precios
            </button>
          )}

          {showLibreta && (
            <button
              onClick={() => setActiveModule('libreta')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
                ${activeModule === 'libreta' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Users size={22} /> Libreta (Fiados)
            </button>
          )}

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

        <div className="p-6 text-slate-500 text-sm font-medium border-t border-gray-800/50 flex flex-col gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
          <div>Sistema de Gestión MVP</div>
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
