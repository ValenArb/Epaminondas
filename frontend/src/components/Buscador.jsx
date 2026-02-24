import { useState, useMemo, useEffect } from 'react';
import { Search, Settings, Edit2, Plus, Trash2, Package } from 'lucide-react';
import { Modal, ConfirmDialog, Notification } from './Modal';
import api from '../api';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

export default function Buscador() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategorias(), api.getProductos()])
      .then(([cats, prods]) => { setCategorias(cats); setProductos(prods); })
      .catch(() => notify('❌ Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  // Modals
  const [mCategoria, setMCategoria] = useState(false);
  const [mProducto, setMProducto] = useState(false);
  const [mEditCosto, setMEditCosto] = useState(null); // productId
  const [confirm, setConfirm] = useState(null);

  // Nueva Categoría form
  const [ncNombre, setNcNombre] = useState('');
  const [ncMargen, setNcMargen] = useState('');

  // Nuevo Producto form
  const [npIsbn, setNpIsbn] = useState('');
  const [npDesc, setNpDesc] = useState('');
  const [npCosto, setNpCosto] = useState('');
  const [npCatId, setNpCatId] = useState('');

  // Edit cost form
  const [ecCosto, setEcCosto] = useState('');

  // Inline editing margins
  const [editMargin, setEditMargin] = useState(null);
  const [editMarginVal, setEditMarginVal] = useState('');
  const [editCatName, setEditCatName] = useState(null);
  const [editCatNameVal, setEditCatNameVal] = useState('');

  const notify = (m) => { setNotif(m); setTimeout(() => setNotif(null), 4000); };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return productos.map(p => {
      const cat = categorias.find(c => c.id === p.categoria_id);
      const margin = cat ? cat.margen_porcentaje : 0;
      const publicPrice = Math.ceil(p.costo_base * (1 + margin / 100));
      return { ...p, categoria_nombre: cat?.nombre || 'N/A', precio_publico: publicPrice };
    }).filter(p =>
      !term || (p.isbn && p.isbn.toLowerCase().includes(term)) || (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }, [searchTerm, productos, categorias]);

  const crearCategoria = async () => {
    if (!ncNombre) return;
    try {
      const cat = await api.createCategoria({ nombre: ncNombre, margen_porcentaje: parseFloat(ncMargen) || 0 });
      setCategorias([...categorias, cat]);
      notify(`✅ Categoría "${ncNombre}" creada`);
      setNcNombre(''); setNcMargen(''); setMCategoria(false);
    } catch { notify('❌ Error al crear categoría'); }
  };

  const crearProducto = async () => {
    if (!npDesc || !npCatId) return;
    try {
      const prod = await api.createProducto({ isbn: npIsbn, descripcion: npDesc, costo_base: parseFloat(npCosto) || 0, categoria_id: Number(npCatId) });
      setProductos([...productos, prod]);
      notify(`✅ Producto "${npDesc}" creado`);
      setNpIsbn(''); setNpDesc(''); setNpCosto(''); setNpCatId(''); setMProducto(false);
    } catch { notify('❌ Error al crear producto'); }
  };

  const actualizarCosto = async () => {
    const costo = parseFloat(ecCosto);
    if (!mEditCosto || isNaN(costo)) return;
    const prod = productos.find(p => p.id === mEditCosto);
    if (!prod) return;
    try {
      await api.updateProducto(mEditCosto, { isbn: prod.isbn, descripcion: prod.descripcion, costo_base: costo, categoria_id: prod.categoria_id });
      setProductos(productos.map(p => p.id === mEditCosto ? { ...p, costo_base: costo } : p));
      notify(`✅ Costo actualizado`);
      setEcCosto(''); setMEditCosto(null);
    } catch { notify('❌ Error al actualizar'); }
  };

  return (
    <div className="p-8">
      <Notification message={notif} onClose={() => setNotif(null)} />
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm?.fn()} message={confirm?.msg} />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Buscador de Precios</h2>
        <div className="flex gap-3">
          <button onClick={() => { setNpIsbn(''); setNpDesc(''); setNpCosto(''); setNpCatId(''); setMProducto(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus size={18} /> Nuevo Producto
          </button>
          <button onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium">
            <Settings size={18} /> Categorías y %
          </button>
        </div>
      </div>

      {/* Categories Panel */}
      {showCategories && (
        <div className="mb-8 p-5 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-purple-800 text-lg">Categorías y Márgenes</h3>
            <button onClick={() => { setNcNombre(''); setNcMargen(''); setMCategoria(true); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              <Plus size={14} /> Nueva Categoría
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  {editCatName === cat.id ? (
                    <input autoFocus value={editCatNameVal} onChange={e => setEditCatNameVal(e.target.value)}
                      onBlur={() => { setCategorias(categorias.map(c => c.id === cat.id ? { ...c, nombre: editCatNameVal } : c)); setEditCatName(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditCatName(null); }}
                      className="font-medium text-gray-700 border-b-2 border-purple-500 outline-none bg-transparent flex-1" />
                  ) : (
                    <span className="font-medium text-gray-700">{cat.nombre}</span>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => { setEditCatNameVal(cat.nombre); setEditCatName(cat.id); }} className="text-gray-400 hover:text-purple-600 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => setConfirm({ msg: `¿Eliminar categoría "${cat.nombre}"? Los productos quedarán sin categoría.`, fn: () => setCategorias(categorias.filter(c => c.id !== cat.id)) })}
                      className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMargin === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input autoFocus type="number" value={editMarginVal} onChange={e => setEditMarginVal(e.target.value)}
                        onBlur={() => { setCategorias(categorias.map(c => c.id === cat.id ? { ...c, margen_porcentaje: parseFloat(editMarginVal) || 0 } : c)); setEditMargin(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditMargin(null); }}
                        className="w-16 px-2 py-1 border-2 border-purple-400 rounded text-right font-bold outline-none" />
                      <span className="font-bold text-purple-600">%</span>
                    </div>
                  ) : (
                    <button onClick={() => { setEditMarginVal(String(cat.margen_porcentaje)); setEditMargin(cat.id); }}
                      className="font-bold text-xl text-purple-600 hover:text-purple-800 cursor-pointer">{cat.margen_porcentaje}%</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 italic">* Modificar el % actualiza los precios al instante.</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-8 shadow-sm">
        <Search className="absolute left-5 top-5 text-gray-400" size={28} />
        <input type="text" placeholder="Pistolear ISBN o escribir descripción del producto..."
          className="w-full pl-16 pr-6 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 border-b"><tr>
            <th className="p-5 font-semibold">ISBN / Código</th>
            <th className="p-5 font-semibold">Descripción</th>
            <th className="p-5 font-semibold">Categoría</th>
            <th className="p-5 font-semibold text-right">Costo</th>
            <th className="p-5 font-semibold text-right">Precio Público</th>
            <th className="p-5 font-semibold text-center">Acciones</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="p-5 text-gray-500 font-mono text-sm">{p.isbn || '—'}</td>
                <td className="p-5 font-medium text-gray-800 text-lg">{p.descripcion}</td>
                <td className="p-5 text-sm"><span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">{p.categoria_nombre}</span></td>
                <td className="p-5 text-right text-gray-500">{fmt(p.costo_base)}</td>
                <td className="p-5 text-right font-bold text-2xl text-green-600">{fmt(p.precio_publico)}</td>
                <td className="p-5 text-center">
                  <div className="flex gap-2 justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEcCosto(String(p.costo_base)); setMEditCosto(p.id); }}
                      className="text-sm px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm">Editar Costo</button>
                    <button onClick={() => setConfirm({ msg: `¿Eliminar "${p.descripcion}"?`, fn: () => setProductos(productos.filter(x => x.id !== p.id)) })}
                      className="text-sm px-3 py-1.5 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 shadow-sm">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center text-gray-400 text-lg">
                {searchTerm ? `No hay resultados para "${searchTerm}"` : 'No hay productos. Creá uno con el botón de arriba.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Nueva Categoría */}
      <Modal open={mCategoria} onClose={() => setMCategoria(false)} title="Nueva Categoría">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nombre *</label>
            <input value={ncNombre} onChange={e => setNcNombre(e.target.value)} placeholder="Ej. Papelería" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500" /></div>
          <div><label className="block text-sm font-semibold text-gray-600 mb-1">Margen de ganancia (%)</label>
            <input type="number" value={ncMargen} onChange={e => setNcMargen(e.target.value)} placeholder="45" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-purple-500" /></div>
          <button onClick={crearCategoria} disabled={!ncNombre}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear Categoría</button>
        </div>
      </Modal>

      {/* MODAL: Nuevo Producto */}
      <Modal open={mProducto} onClose={() => setMProducto(false)} title="Nuevo Producto">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-600 mb-1">Categoría *</label>
            <select value={npCatId} onChange={e => setNpCatId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500">
              <option value="">-- Seleccionar --</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.margen_porcentaje}%)</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-600 mb-1">Descripción *</label>
            <input value={npDesc} onChange={e => setNpDesc(e.target.value)} placeholder="Nombre del producto" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-600 mb-1">ISBN / Código</label>
              <input value={npIsbn} onChange={e => setNpIsbn(e.target.value)} placeholder="Opcional" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm font-semibold text-gray-600 mb-1">Costo base ($)</label>
              <input type="number" value={npCosto} onChange={e => setNpCosto(e.target.value)} placeholder="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
          </div>
          {npCatId && npCosto && (
            <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-sm">
              <span className="text-gray-600">Precio público: </span>
              <span className="font-bold text-green-600 text-lg">
                {fmt(Math.ceil((parseFloat(npCosto) || 0) * (1 + (categorias.find(c => c.id === Number(npCatId))?.margen_porcentaje || 0) / 100)))}
              </span>
            </div>
          )}
          <button onClick={crearProducto} disabled={!npDesc || !npCatId}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear Producto</button>
        </div>
      </Modal>

      {/* MODAL: Editar Costo */}
      <Modal open={!!mEditCosto} onClose={() => setMEditCosto(null)} title="Editar Costo Base">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nuevo costo base ($)</label>
            <input type="number" value={ecCosto} onChange={e => setEcCosto(e.target.value)} placeholder="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <button onClick={actualizarCosto} disabled={!ecCosto || isNaN(ecCosto)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Guardar</button>
        </div>
      </Modal>
    </div>
  );
}
