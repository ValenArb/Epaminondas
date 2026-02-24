import { useState, useMemo } from 'react';
import { Search, Settings, Edit2 } from 'lucide-react';

const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Librería Escolar', margen_porcentaje: 45 },
  { id: 2, nombre: 'Golosinas', margen_porcentaje: 30 },
  { id: 3, nombre: 'Regalería', margen_porcentaje: 60 },
  { id: 4, nombre: 'Fotocopias', margen_porcentaje: 100 },
];

const MOCK_PRODUCTOS = [
  { id: 1, isbn: '978987456123', descripcion: 'Cuaderno Rivadavia Tapa Dura 50h', costo_base: 1500, categoria_id: 1 },
  { id: 2, isbn: '779123456789', descripcion: 'Lapicera Bic Azul', costo_base: 200, categoria_id: 1 },
  { id: 3, isbn: '779987654321', descripcion: 'Alfajor Jorgito Chocolate', costo_base: 350, categoria_id: 2 },
  { id: 4, isbn: '978111222333', descripcion: 'Taza de Cerámica Día de la Madre', costo_base: 4000, categoria_id: 3 },
];

export default function Buscador() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [categorias, setCategorias] = useState(MOCK_CATEGORIAS);
  const [productos, setProductos] = useState(MOCK_PRODUCTOS);

  const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return productos.map(p => {
      const cat = categorias.find(c => c.id === p.categoria_id);
      const margin = cat ? cat.margen_porcentaje : 0;
      const publicPrice = Math.ceil(p.costo_base * (1 + margin / 100));
      return { ...p, categoria_nombre: cat?.nombre || 'N/A', precio_publico: publicPrice };
    }).filter(p =>
      (p.isbn && p.isbn.toLowerCase().includes(term)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }, [searchTerm, productos, categorias]);

  const handleUpdateCost = (id) => {
    const newCost = prompt("Ingresá el nuevo costo base (sin el % de ganancia):");
    if (newCost && !isNaN(newCost)) {
      setProductos(productos.map(p => p.id === id ? { ...p, costo_base: parseFloat(newCost) } : p));
    } else if (newCost) {
      alert("Por favor, ingresá un número válido.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Buscador de Precios</h2>
        <button
          onClick={() => setShowCategoryModal(!showCategoryModal)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
        >
          <Settings size={18} /> Gestionar Categorías y %
        </button>
      </div>

      {showCategoryModal && (
        <div className="mb-8 p-5 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
          <h3 className="font-bold mb-4 text-purple-800 text-lg">Porcentajes de Ganancia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                <span className="font-medium text-gray-700">{cat.nombre}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xl text-purple-600">{cat.margen_porcentaje}%</span>
                  <button
                    onClick={() => {
                      const newMargin = prompt(`Nuevo porcentaje para ${cat.nombre}:`, cat.margen_porcentaje);
                      if (newMargin && !isNaN(newMargin)) {
                        setCategorias(categorias.map(c => c.id === cat.id ? { ...c, margen_porcentaje: parseFloat(newMargin) } : c));
                      }
                    }}
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 italic">
            * Si modificás el porcentaje, todos los productos de esa categoría actualizarán su precio al instante.
          </p>
        </div>
      )}

      <div className="relative mb-8 shadow-sm">
        <Search className="absolute left-5 top-5 text-gray-400" size={28} />
        <input
          type="text"
          placeholder="Pistolear ISBN o escribir descripción del producto..."
          className="w-full pl-16 pr-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-5 font-semibold">ISBN / Código</th>
              <th className="p-5 font-semibold">Descripción</th>
              <th className="p-5 font-semibold">Categoría</th>
              <th className="p-5 font-semibold text-right">Precio Público</th>
              <th className="p-5 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="p-5 text-gray-500 font-mono text-sm">{product.isbn}</td>
                <td className="p-5 font-medium text-gray-800 text-lg">{product.descripcion}</td>
                <td className="p-5 text-sm text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">{product.categoria_nombre}</span>
                </td>
                <td className="p-5 text-right font-bold text-2xl text-green-600">
                  {formatMoney(product.precio_publico)}
                </td>
                <td className="p-5 text-center">
                  <button
                    onClick={() => handleUpdateCost(product.id)}
                    className="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    Cambiar Costo
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-400 text-lg">
                  No hay resultados para "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
