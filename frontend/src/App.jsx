import { useState } from 'react';
import './App.css';
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
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">Gestión Kiosco/Librería</div>
        <div className="nav-links">
          <button
            className={`nav-item ${activeModule === 'buscador' ? 'active' : ''}`}
            onClick={() => setActiveModule('buscador')}
          >
            Buscador
          </button>
          <button
            className={`nav-item ${activeModule === 'libreta' ? 'active' : ''}`}
            onClick={() => setActiveModule('libreta')}
          >
            Libreta
          </button>
          <button
            className={`nav-item ${activeModule === 'fotocopias' ? 'active' : ''}`}
            onClick={() => setActiveModule('fotocopias')}
          >
            Fotocopias
          </button>
          <button
            className={`nav-item ${activeModule === 'encargos' ? 'active' : ''}`}
            onClick={() => setActiveModule('encargos')}
          >
            Encargos
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
