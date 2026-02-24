import { useState, useMemo } from 'react';

// Mock data while backend is down
const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Literatura', margen_porcentaje: 40 },
  { id: 2, nombre: 'Fantasía', margen_porcentaje: 45 },
  { id: 3, nombre: 'Librería', margen_porcentaje: 50 },
];

const MOCK_PRODUCTOS = [
  { id: 1, isbn: '978-84-376-0494-7', descripcion: 'Cien años de soledad', costo_base: 5000, categoria_id: 1 },
  { id: 2, isbn: '978-84-450-7033-3', descripcion: 'El Señor de los Anillos', costo_base: 8000, categoria_id: 2 },
  { id: 3, isbn: '7791234567890', descripcion: 'Cuaderno A4 Rayado', costo_base: 1200, categoria_id: 3 },
  { id: 4, isbn: '7790987654321', descripcion: 'Bolígrafo Azul', costo_base: 300, categoria_id: 3 },
];

export default function Buscador() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  
  // States for local edits
  const [categorias, setCategorias] = useState(MOCK_CATEGORIAS);
  const [productos, setProductos] = useState(MOCK_PRODUCTOS);

  // Derived state: Calculates real-time prices ensuring case-insensitive search
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return productos.map(p => {
      const cat = categorias.find(c => c.id === p.categoria_id);
      const margin = cat ? cat.margen_porcentaje : 0;
      const publicPrice = Math.ceil(p.costo_base + (p.costo_base * (margin / 100)));
      return { ...p, categoria_nombre: cat?.nombre || 'Sin categoría', precio_publico: publicPrice };
    }).filter(p => 
      (p.isbn && p.isbn.toLowerCase().includes(term)) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }, [searchTerm, productos, categorias]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Buscador de Precios</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCategories(!showCategories)}
        >
          {showCategories ? 'Ocultar Categorías' : 'Gestor de Categorías'}
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          className="input-base" 
          placeholder="Escanear código de barras o buscar por descripción..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          style={{ fontSize: '1.25rem', padding: '1rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div className="glass-card" style={{ flex: 1 }}>
          <h3>Resultados ({filteredProducts.length})</h3>
          <table className="premium-table">
            <thead>
              <tr>
                <th>ISBN/Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio Público</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.isbn}</td>
                  <td style={{ fontWeight: 500 }}>{p.descripcion}</td>
                  <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{p.categoria_nombre}</span></td>
                  <td style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
                    ${p.precio_publico.toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showCategories && (
          <div className="glass-card animate-fade-in" style={{ width: '350px' }}>
            <h3>Márgenes por Categoría</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Los cambios de porcentaje actualizan el precio al instante.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categorias.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 500 }}>{cat.nombre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      className="input-base" 
                      style={{ width: '80px', textAlign: 'right', padding: '0.5rem' }} 
                      value={cat.margen_porcentaje}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setCategorias(prev => prev.map(c => c.id === cat.id ? { ...c, margen_porcentaje: val } : c));
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
