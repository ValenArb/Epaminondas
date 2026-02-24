import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, MessageCircle, Settings, Package, BookOpen, Trash2, ChevronDown, ChevronRight, Edit2, DollarSign, AlertTriangle, CheckCircle2, Clock, ShoppingCart, X, Search, Loader2 } from 'lucide-react';
import { Modal, ConfirmDialog, Notification } from './Modal';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const uid = () => Date.now() + Math.random();
const today = () => new Date().toISOString().split('T')[0];

// === BOOK SELECTOR (extracted to avoid re-render focus loss) ===
function BookSelector({ grados, selGrado, setSelGrado, selBooks, setSelBooks, manual, setManual, knownTitles }) {
    const [isbnSearch, setIsbnSearch] = useState('');
    const [isbnLoading, setIsbnLoading] = useState(false);
    const [isbnResult, setIsbnResult] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = useMemo(() => {
        if (!manual.titulo || manual.titulo.length < 2) return [];
        const term = manual.titulo.toLowerCase();
        return knownTitles.filter(t => t.toLowerCase().includes(term)).slice(0, 5);
    }, [manual.titulo, knownTitles]);

    const searchISBN = async (isbn) => {
        if (!isbn || isbn.length < 10) return;
        setIsbnLoading(true);
        setIsbnResult(null);
        const clean = isbn.replace(/[^0-9X]/gi, '');
        try {
            // 1) Google Books with isbn: prefix
            const g1 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`);
            const g1d = await g1.json();
            if (g1d.items?.length > 0) {
                const info = g1d.items[0].volumeInfo;
                setIsbnResult({ titulo: info.title, autor: info.authors?.join(', ') || '', editorial: info.publisher || '' });
                setIsbnLoading(false); return;
            }
            // 2) Google Books plain search (catches some that isbn: misses)
            const g2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${clean}`);
            const g2d = await g2.json();
            if (g2d.items?.length > 0) {
                const info = g2d.items[0].volumeInfo;
                const isbns = info.industryIdentifiers?.map(i => i.identifier) || [];
                if (isbns.some(i => i.includes(clean) || clean.includes(i))) {
                    setIsbnResult({ titulo: info.title, autor: info.authors?.join(', ') || '', editorial: info.publisher || '' });
                    setIsbnLoading(false); return;
                }
            }
            // 3) Open Library search API (more reliable than direct /isbn/ endpoint)
            const olRes = await fetch(`https://openlibrary.org/search.json?isbn=${clean}&limit=1`);
            if (olRes.ok) {
                const olData = await olRes.json();
                if (olData.docs?.length > 0) {
                    const doc = olData.docs[0];
                    setIsbnResult({ titulo: doc.title, autor: doc.author_name?.join(', ') || '', editorial: doc.publisher?.[0] || '' });
                    setIsbnLoading(false); return;
                }
            }
            setIsbnResult({ error: true, isbn: clean });
        } catch {
            setIsbnResult({ error: true, isbn: clean });
        }
        setIsbnLoading(false);
    };

    const applyIsbnResult = () => {
        if (isbnResult && !isbnResult.error) {
            setManual({ ...manual, titulo: isbnResult.titulo });
            setIsbnResult(null);
            setIsbnSearch('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Seleccionar Grado</label>
            <select value={selGrado || ''} onChange={e => {
                const newGrado = Number(e.target.value) || null;
                // Only clear catalog books, keep manually added (suelto) ones
                const catalogTitles = new Set();
                grados.forEach(g => g.libros.forEach(l => catalogTitles.add(l.titulo)));
                setSelBooks(selBooks.filter(b => !catalogTitles.has(b.titulo)));
                setSelGrado(newGrado);
            }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 outline-none">
                <option value="">-- Elegir grado --</option>
                {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            {selGrado && grados.find(g => g.id === selGrado)?.libros.map(l => (
                <label key={l.id} className={`flex items-center justify-between gap-3 p-3 mt-2 rounded-xl border cursor-pointer transition-all ${selBooks.some(b => b.titulo === l.titulo) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selBooks.some(b => b.titulo === l.titulo)}
                            onChange={e => { if (e.target.checked) setSelBooks([...selBooks, { titulo: l.titulo, precio: l.precio }]); else setSelBooks(selBooks.filter(b => b.titulo !== l.titulo)); }}
                            className="w-5 h-5 rounded text-blue-600" />
                        <span className="font-medium text-gray-800">{l.titulo}</span>
                    </div>
                    <span className="font-bold text-green-600 text-sm">{fmt(l.precio)}</span>
                </label>
            ))}

            {/* ISBN Search */}
            <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-600 mb-2">Buscar por ISBN:</p>
                <div className="flex gap-2 mb-3">
                    <input placeholder="978..." value={isbnSearch} onChange={e => setIsbnSearch(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') searchISBN(isbnSearch); }}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                    <button onClick={() => searchISBN(isbnSearch)} disabled={isbnLoading || isbnSearch.length < 10}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:bg-gray-300 hover:bg-purple-700 flex items-center gap-1">
                        {isbnLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Buscar
                    </button>
                </div>
                {isbnResult && !isbnResult.error && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-green-800">{isbnResult.titulo}</p>
                            <p className="text-xs text-green-600">{isbnResult.autor} {isbnResult.editorial && `— ${isbnResult.editorial}`}</p>
                        </div>
                        <button onClick={applyIsbnResult} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Usar</button>
                    </div>
                )}
                {isbnResult?.error && (
                    <div className="text-sm text-red-500 mb-3">
                        No se encontró en Google/OpenLibrary.
                        <a href={`https://www.google.com/search?q=isbn+${isbnResult.isbn}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-purple-600 underline hover:text-purple-800">Buscar en Google</a>
                        <span className="mx-1">|</span>
                        <a href={`https://www.casassaylorenzo.com/Papel/${isbnResult.isbn}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-800">Casassa y Lorenzo</a>
                        <p className="mt-1 text-gray-500">Podés escribir el título manualmente abajo.</p>
                    </div>
                )}
            </div>

            {/* Manual book with autocomplete */}
            <div className="mt-3">
                <p className="text-sm font-semibold text-gray-600 mb-2">Agregar libro suelto:</p>
                <div className="relative">
                    <input placeholder="Título del libro" value={manual.titulo}
                        onChange={e => { setManual({ ...manual, titulo: e.target.value }); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <button key={i} type="button" className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-gray-800 border-b last:border-0"
                                    onMouseDown={() => { setManual({ ...manual, titulo: s }); setShowSuggestions(false); }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-2 mt-2">
                    <input placeholder="Precio" type="number" value={manual.precio}
                        onChange={e => setManual({ ...manual, precio: e.target.value })}
                        className="w-28 px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                    <button onClick={() => { if (manual.titulo) { setSelBooks([...selBooks, { titulo: manual.titulo, precio: parseFloat(manual.precio) || 0 }]); setManual({ titulo: '', precio: '' }); } }}
                        disabled={!manual.titulo} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:bg-gray-300 hover:bg-blue-700 flex items-center justify-center gap-1">
                        <Plus size={14} /> Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}

const INIT_GRADOS = [
    {
        id: 1, nombre: '1er Grado', libros: [
            { id: 101, titulo: 'Matemática en Acción 1', editorial: 'Estrada', precio: 8500 },
            { id: 102, titulo: 'Naturales 1', editorial: 'Santillana', precio: 7200 },
            { id: 103, titulo: 'Sociales 1', editorial: 'Kapelusz', precio: 7800 },
        ]
    },
    {
        id: 2, nombre: '2do Grado', libros: [
            { id: 201, titulo: 'Matemática en Acción 2', editorial: 'Estrada', precio: 8500 },
            { id: 202, titulo: 'Manual Estrada 2', editorial: 'Estrada', precio: 12000 },
        ]
    },
    {
        id: 3, nombre: '3er Grado', libros: [
            { id: 301, titulo: 'Ciencias Naturales 3', editorial: 'Aique', precio: 9500 },
        ]
    },
];

const INIT_PEDIDOS = [
    {
        id: 1, cliente: 'Laura', telefono: '1122334455', fecha: '2024-02-01',
        libros: [
            { id: 1, titulo: 'Matemática en Acción 1', precio: 8500, estado: 'faltante' },
            { id: 2, titulo: 'Naturales 1', precio: 7200, estado: 'en_local' },
        ],
        pagos: [{ id: 1, monto: 5000, fecha: '2024-02-01', nota: 'Seña inicial' }]
    },
    {
        id: 2, cliente: 'Pedro', telefono: '1199887766', fecha: '2024-02-05',
        libros: [{ id: 3, titulo: 'Manual Estrada 2', precio: 12000, estado: 'en_local' }],
        pagos: []
    },
    {
        id: 3, cliente: 'Carlos', telefono: '1155667788', fecha: '2024-02-10',
        libros: [
            { id: 4, titulo: 'Matemática en Acción 1', precio: 8500, estado: 'faltante' },
            { id: 5, titulo: 'Sociales 1', precio: 7800, estado: 'pedido' },
            { id: 6, titulo: 'Naturales 1', precio: 7200, estado: 'faltante' },
        ],
        pagos: [
            { id: 2, monto: 2000, fecha: '2024-02-10', nota: 'Seña' },
            { id: 3, monto: 8000, fecha: '2024-02-15', nota: 'Pago parcial' },
        ]
    },
];

const INIT_STOCK = [
    { id: 1, titulo: 'Naturales 1', tipo: 'nuevo', cantidad: 3 },
    { id: 2, titulo: 'Manual Estrada 2', tipo: 'usado', cantidad: 1 },
];

const ESTADO_LIBRO = {
    faltante: { label: 'Falta pedir', cls: 'bg-red-100 text-red-700' },
    pedido: { label: 'Pedido', cls: 'bg-yellow-100 text-yellow-700' },
    en_local: { label: 'En local', cls: 'bg-blue-100 text-blue-700' },
    entregado: { label: 'Entregado', cls: 'bg-green-100 text-green-700' },
};

function calcPedido(p) {
    const totalPrecio = p.libros.reduce((s, l) => s + l.precio, 0);
    const totalPagado = p.pagos.reduce((s, pa) => s + pa.monto, 0);
    const enLocal = p.libros.filter(l => l.estado === 'en_local');
    const reservados = p.libros.filter(l => l.estado === 'faltante' || l.estado === 'pedido');
    const costoRetiro = enLocal.reduce((s, l) => s + l.precio, 0);
    const costoReserva = reservados.reduce((s, l) => s + l.precio * 0.5, 0);
    const minRetiro = costoRetiro + costoReserva;
    return { totalPrecio, totalPagado, deuda: totalPrecio - totalPagado, enLocal: enLocal.length, reservados: reservados.length, entregados: p.libros.filter(l => l.estado === 'entregado').length, costoRetiro, costoReserva, minRetiro, puedeRetirar: totalPagado >= minRetiro, faltaRetiro: Math.max(0, minRetiro - totalPagado) };
}

export default function Encargos() {
    const [tab, setTab] = useState('pedidos');
    const [grados, setGrados] = useState(INIT_GRADOS);
    const [pedidos, setPedidos] = useState(INIT_PEDIDOS);
    const [stock, setStock] = useState(INIT_STOCK);
    const [expanded, setExpanded] = useState(null);
    const [notif, setNotif] = useState(null);

    // Modal states
    const [mNuevo, setMNuevo] = useState(false);
    const [mAgregar, setMAgregar] = useState(null); // pedidoId
    const [mPago, setMPago] = useState(null); // pedidoId
    const [mStock, setMStock] = useState(false);
    const [mGrado, setMGrado] = useState(false);
    const [mLibroCat, setMLibroCat] = useState(null); // gradoId
    const [confirm, setConfirm] = useState(null);

    // Nuevo Pedido form
    const [npGrado, setNpGrado] = useState(null);
    const [npBooks, setNpBooks] = useState([]); // [{titulo,precio}]
    const [npClient, setNpClient] = useState('');
    const [npPhone, setNpPhone] = useState('');
    const [npSena, setNpSena] = useState('');
    const [npManual, setNpManual] = useState({ titulo: '', precio: '' });

    // Agregar Libros form
    const [alGrado, setAlGrado] = useState(null);
    const [alBooks, setAlBooks] = useState([]);
    const [alManual, setAlManual] = useState({ titulo: '', precio: '' });

    // Registrar Pago form
    const [rpMonto, setRpMonto] = useState('');
    const [rpNota, setRpNota] = useState('');

    // Ingreso Stock form
    const [isTitulo, setIsTitulo] = useState('');
    const [isCant, setIsCant] = useState('1');
    const [isTipo, setIsTipo] = useState('nuevo');

    // Catalogo forms
    const [ngNombre, setNgNombre] = useState('');
    const [alcTitulo, setAlcTitulo] = useState('');
    const [alcEdit, setAlcEdit] = useState('');
    const [alcPrecio, setAlcPrecio] = useState('');
    const [editPrice, setEditPrice] = useState(null);
    const [editPriceVal, setEditPriceVal] = useState('');
    const [editGradoName, setEditGradoName] = useState(null);
    const [editGradoVal, setEditGradoVal] = useState('');
    const [expandedGrado, setExpandedGrado] = useState(null);

    const notify = (m) => { setNotif(m); setTimeout(() => setNotif(null), 5000); };

    // Aggregate books across all orders for Kanban
    const bookKanban = useMemo(() => {
        const agg = {};
        pedidos.forEach(p => p.libros.forEach(l => {
            if (l.estado === 'entregado') return;
            const key = `${l.titulo}|${l.estado}`;
            if (!agg[key]) agg[key] = { titulo: l.titulo, estado: l.estado, cantidad: 0, clientes: [] };
            agg[key].cantidad++;
            if (!agg[key].clientes.includes(p.cliente)) agg[key].clientes.push(p.cliente);
        }));
        return Object.values(agg);
    }, [pedidos]);

    const getPrecio = (titulo) => {
        for (const g of grados) { const l = g.libros.find(b => b.titulo === titulo); if (l) return l.precio; }
        return 0;
    };

    // Reset helpers
    const resetNuevo = () => { setNpGrado(null); setNpBooks([]); setNpClient(''); setNpPhone(''); setNpSena(''); setNpManual({ titulo: '', precio: '' }); };
    const resetAgregar = () => { setAlGrado(null); setAlBooks([]); setAlManual({ titulo: '', precio: '' }); };

    // === HANDLERS ===
    const crearPedido = () => {
        if (!npClient || npBooks.length === 0) return;
        const sena = parseFloat(npSena) || 0;
        const p = {
            id: uid(), cliente: npClient, telefono: npPhone, fecha: today(),
            libros: npBooks.map(b => ({ id: uid(), titulo: b.titulo, precio: b.precio, estado: 'faltante' })),
            pagos: sena > 0 ? [{ id: uid(), monto: sena, fecha: today(), nota: 'Seña inicial' }] : []
        };
        setPedidos([...pedidos, p]);
        notify(`✅ Pedido creado para ${npClient} — ${npBooks.length} libro(s)`);
        resetNuevo(); setMNuevo(false);
    };

    const agregarLibros = () => {
        if (!mAgregar || alBooks.length === 0) return;
        setPedidos(pedidos.map(p => p.id === mAgregar
            ? { ...p, libros: [...p.libros, ...alBooks.map(b => ({ id: uid(), titulo: b.titulo, precio: b.precio, estado: 'faltante' }))] }
            : p
        ));
        const ped = pedidos.find(p => p.id === mAgregar);
        notify(`✅ ${alBooks.length} libro(s) agregados al pedido de ${ped?.cliente}`);
        resetAgregar(); setMAgregar(null);
    };

    const registrarPago = () => {
        const monto = parseFloat(rpMonto);
        if (!mPago || !monto || monto <= 0) return;
        setPedidos(pedidos.map(p => p.id === mPago
            ? { ...p, pagos: [...p.pagos, { id: uid(), monto, fecha: today(), nota: rpNota || 'Pago' }] }
            : p
        ));
        notify(`💰 Pago de ${fmt(monto)} registrado`);
        setRpMonto(''); setRpNota(''); setMPago(null);
    };

    const updateLibroEstado = (pedidoId, libroId, nuevoEstado) => {
        setPedidos(pedidos.map(p => p.id === pedidoId
            ? { ...p, libros: p.libros.map(l => l.id === libroId ? { ...l, estado: nuevoEstado } : l) }
            : p
        ));
    };

    const ingresarStock = () => {
        if (!isTitulo || !parseInt(isCant)) return;
        const cantidad = parseInt(isCant);
        let remaining = cantidad, assigned = 0;
        const up = pedidos.map(p => {
            const newLibros = p.libros.map(l => {
                if (remaining > 0 && l.titulo.toLowerCase() === isTitulo.toLowerCase() && l.estado === 'faltante') {
                    remaining--; assigned++;
                    return { ...l, estado: 'en_local' };
                }
                return l;
            });
            return { ...p, libros: newLibros };
        });
        setPedidos(up);
        if (remaining > 0) {
            const ei = stock.findIndex(s => s.titulo.toLowerCase() === isTitulo.toLowerCase() && s.tipo === isTipo);
            if (ei >= 0) setStock(stock.map((s, i) => i === ei ? { ...s, cantidad: s.cantidad + remaining } : s));
            else setStock([...stock, { id: uid(), titulo: isTitulo, tipo: isTipo, cantidad: remaining }]);
        }
        let msg = `📦 ${cantidad} unid. de "${isTitulo}" (${isTipo})`;
        if (assigned > 0) msg += `\n🔔 ${assigned} asignadas a pedidos pendientes`;
        if (remaining > 0) msg += `\n📚 ${remaining} quedaron en stock`;
        notify(msg);
        setIsTitulo(''); setIsCant('1'); setIsTipo('nuevo'); setMStock(false);
    };

    const handleWhatsApp = (phone, libros) => {
        const clean = phone.replace(/\D/g, '');
        const titles = libros.filter(l => l.estado === 'en_local').map(l => `"${l.titulo}"`).join(', ');
        const msg = encodeURIComponent(`¡Hola! Te aviso de la librería que ya llegaron: ${titles}. Podés pasar a retirar.`);
        window.open(`https://wa.me/549${clean}?text=${msg}`, '_blank');
    };

    // === TAB: GESTIÓN DE LIBROS (Kanban) ===
    const GestionLibrosTab = () => {
        const columns = [
            { key: 'faltante', title: 'Faltan Pedir', borderCls: 'border-red-400', bgCls: 'bg-red-50/50', badgeCls: 'bg-red-100 text-red-700', icon: '🔴' },
            { key: 'pedido', title: 'Pedidos (esperan)', borderCls: 'border-yellow-400', bgCls: 'bg-yellow-50/50', badgeCls: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
            { key: 'en_local', title: 'En Local (avisar)', borderCls: 'border-blue-400', bgCls: 'bg-blue-50/50', badgeCls: 'bg-blue-100 text-blue-700', icon: '🔵' },
        ];
        return (
            <div>
                <div className="flex gap-3 mb-6">
                    <button onClick={() => setMStock(true)} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all">
                        <Package size={18} /> Ingresar Libros
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {columns.map(col => {
                        const items = bookKanban.filter(b => b.estado === col.key);
                        const totalUnits = items.reduce((s, b) => s + b.cantidad, 0);
                        return (
                            <div key={col.key} className={`rounded-2xl p-5 border-t-8 ${col.borderCls} ${col.bgCls} shadow-sm flex flex-col`}>
                                <div className="flex justify-between items-center mb-5 px-1">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">{col.icon} {col.title}</h3>
                                    <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-500 shadow-sm">{totalUnits}</span>
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                    {items.map((b, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-gray-800">{b.titulo}</p>
                                                <span className={`text-sm px-2.5 py-1 rounded-full font-black ${col.badgeCls}`}>×{b.cantidad}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {b.clientes.map((c, j) => (
                                                    <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && <p className="text-center py-10 text-gray-400 font-medium">Vacío</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // === TAB: PEDIDOS ===
    const PedidosTab = () => (
        <div>
            <div className="flex gap-3 mb-6">
                <button onClick={() => { resetNuevo(); setMNuevo(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                    <Plus size={20} /> Nuevo Pedido
                </button>
                <button onClick={() => setMStock(true)} className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all">
                    <Package size={18} /> Ingresar Libros
                </button>
            </div>

            {/* Orders Table */}
            <div className="space-y-3">
                {pedidos.map(p => {
                    const c = calcPedido(p);
                    const isExp = expanded === p.id;
                    return (
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(isExp ? null : p.id)}>
                                {isExp ? <ChevronDown size={18} className="text-gray-400 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-lg">{p.cliente}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-2"><MessageCircle size={11} /> {p.telefono} · {p.fecha}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    {p.libros.map(l => (
                                        <span key={l.id} className={`text-xs px-2 py-0.5 rounded-full font-bold ${ESTADO_LIBRO[l.estado].cls}`}>
                                            {l.titulo.length > 20 ? l.titulo.slice(0, 18) + '…' : l.titulo}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="font-bold text-green-600">{fmt(c.totalPrecio)}</p>
                                    {c.deuda > 0 ? <p className="text-xs text-red-500 font-bold">Debe: {fmt(c.deuda)}</p> : <p className="text-xs text-green-600 font-bold">✓ Pago completo</p>}
                                </div>
                            </div>

                            {isExp && (
                                <div className="border-t bg-gray-50/50 p-5">
                                    {/* Libros */}
                                    <p className="text-sm font-bold text-gray-600 mb-3">Libros del pedido:</p>
                                    <div className="space-y-2 mb-5">
                                        {p.libros.map(l => (
                                            <div key={l.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border">
                                                <div>
                                                    <span className="font-medium text-gray-800">{l.titulo}</span>
                                                    <span className="ml-2 text-green-600 font-bold text-sm">{fmt(l.precio)}</span>
                                                </div>
                                                <select value={l.estado} onChange={(e) => updateLibroEstado(p.id, l.id, e.target.value)}
                                                    className={`text-xs rounded-lg px-3 py-1.5 font-bold cursor-pointer outline-none ${ESTADO_LIBRO[l.estado].cls}`}>
                                                    {Object.entries(ESTADO_LIBRO).map(([k, v]) => <option key={k} value={k} className="bg-white text-gray-800">{v.label}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Retiro info */}
                                    {c.enLocal > 0 && (
                                        <div className={`p-4 rounded-xl mb-5 border ${c.puedeRetirar ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                            <p className="font-bold text-sm mb-1">{c.puedeRetirar ? '✅ Puede retirar' : '⚠️ No puede retirar aún'}</p>
                                            <p className="text-xs text-gray-600">
                                                {c.enLocal} libro(s) listos ({fmt(c.costoRetiro)}) + {c.reservados} reserv. al 50% ({fmt(c.costoReserva)}) = Mínimo {fmt(c.minRetiro)}
                                            </p>
                                            <p className="text-xs text-gray-600">Pagado: {fmt(c.totalPagado)}{!c.puedeRetirar && ` — Falta: ${fmt(c.faltaRetiro)}`}</p>
                                        </div>
                                    )}

                                    {/* Pagos */}
                                    <p className="text-sm font-bold text-gray-600 mb-2">Historial de pagos:</p>
                                    {p.pagos.length > 0 ? (
                                        <div className="space-y-1 mb-4">
                                            {p.pagos.map(pa => (
                                                <div key={pa.id} className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg border">
                                                    <span className="text-gray-700">{pa.nota} — {pa.fecha}</span>
                                                    <span className="font-bold text-green-600">{fmt(pa.monto)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-gray-400 mb-4 italic">Sin pagos registrados</p>}

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap pt-3 border-t">
                                        <button onClick={() => { resetAgregar(); setMAgregar(p.id); }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
                                            <Plus size={14} /> Agregar Libros
                                        </button>
                                        <button onClick={() => { setRpMonto(''); setRpNota(''); setMPago(p.id); }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors">
                                            <DollarSign size={14} /> Registrar Pago
                                        </button>
                                        {c.enLocal > 0 && (
                                            <button onClick={() => handleWhatsApp(p.telefono, p.libros)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366]/10 text-[#128C7E] rounded-lg hover:bg-[#25D366]/20 font-medium text-sm transition-colors">
                                                <MessageCircle size={14} /> Avisar por WhatsApp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {pedidos.length === 0 && <p className="text-center py-12 text-gray-400 text-lg">No hay pedidos. Creá uno con el botón de arriba.</p>}
            </div>
        </div>
    );

    // === TAB: CATÁLOGO ===
    const CatalogoTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">Configurá los libros por grado con sus precios.</p>
                <button onClick={() => { setNgNombre(''); setMGrado(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                    <Plus size={20} /> Nuevo Grado
                </button>
            </div>
            <div className="space-y-4">
                {grados.map(g => {
                    const total = g.libros.reduce((s, l) => s + l.precio, 0);
                    const isExp = expandedGrado === g.id;
                    return (
                        <div key={g.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedGrado(isExp ? null : g.id)}>
                                <div className="flex items-center gap-3">
                                    {isExp ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                                    {editGradoName === g.id ? (
                                        <input autoFocus value={editGradoVal} onChange={e => setEditGradoVal(e.target.value)}
                                            onBlur={() => { setGrados(grados.map(x => x.id === g.id ? { ...x, nombre: editGradoVal } : x)); setEditGradoName(null); }}
                                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditGradoName(null); }}
                                            onClick={e => e.stopPropagation()}
                                            className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 outline-none bg-transparent px-1" />
                                    ) : <h3 className="text-xl font-bold text-gray-800">{g.nombre}</h3>}
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{g.libros.length} libros</span>
                                    {total > 0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">{fmt(total)}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={e => { e.stopPropagation(); setEditGradoVal(g.nombre); setEditGradoName(g.id); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={e => { e.stopPropagation(); setConfirm({ msg: `¿Eliminar "${g.nombre}" y todos sus libros?`, fn: () => setGrados(grados.filter(x => x.id !== g.id)) }); }} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            {isExp && (
                                <div className="border-t bg-gray-50/50 p-5">
                                    <div className="space-y-2 mb-4">
                                        {g.libros.map(l => (
                                            <div key={l.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border">
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-800">{l.titulo}</span>
                                                    {l.editorial && <span className="text-sm text-gray-500 ml-2">— {l.editorial}</span>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {editPrice?.gradoId === g.id && editPrice?.libroId === l.id ? (
                                                        <input autoFocus type="number" value={editPriceVal} onChange={e => setEditPriceVal(e.target.value)}
                                                            onBlur={() => { setGrados(grados.map(x => x.id === g.id ? { ...x, libros: x.libros.map(b => b.id === l.id ? { ...b, precio: parseFloat(editPriceVal) || 0 } : b) } : x)); setEditPrice(null); }}
                                                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditPrice(null); }}
                                                            className="w-28 px-2 py-1 border-2 border-blue-400 rounded-lg text-right font-bold outline-none" />
                                                    ) : (
                                                        <button onClick={() => { setEditPrice({ gradoId: g.id, libroId: l.id }); setEditPriceVal(String(l.precio)); }}
                                                            className="font-bold text-green-600 hover:text-green-800 transition-colors flex items-center gap-1">
                                                            <DollarSign size={14} />{fmt(l.precio)}
                                                        </button>
                                                    )}
                                                    <button onClick={() => setConfirm({ msg: `¿Eliminar "${l.titulo}"?`, fn: () => setGrados(grados.map(x => x.id === g.id ? { ...x, libros: x.libros.filter(b => b.id !== l.id) } : x)) })}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {g.libros.length === 0 && <p className="text-gray-400 text-center py-4">No hay libros.</p>}
                                    </div>
                                    <button onClick={() => { setAlcTitulo(''); setAlcEdit(''); setAlcPrecio(''); setMLibroCat(g.id); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors text-sm">
                                        <Plus size={16} /> Agregar Libro
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {grados.length === 0 && <p className="text-center py-12 text-gray-400 text-lg">No hay grados.</p>}
            </div>
        </div>
    );

    // === TAB: STOCK ===
    const StockTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">Al ingresar stock, se asignan automáticamente a pedidos pendientes.</p>
                <button onClick={() => setMStock(true)} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all"><Package size={20} /> Ingresar Libros</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr>
                        <th className="p-5 font-semibold text-gray-600">Título</th>
                        <th className="p-5 font-semibold text-gray-600">Tipo</th>
                        <th className="p-5 font-semibold text-gray-600 text-center">Cantidad</th>
                        <th className="p-5 font-semibold text-gray-600 text-center">Acciones</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {stock.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50"><td className="p-5 font-bold text-gray-800">{s.titulo}</td>
                                <td className="p-5"><span className={`px-3 py-1 rounded-full text-sm font-bold ${s.tipo === 'nuevo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{s.tipo === 'nuevo' ? '📗 Nuevo' : '📙 Usado'}</span></td>
                                <td className="p-5 text-center"><span className="text-2xl font-black">{s.cantidad}</span></td>
                                <td className="p-5 text-center">
                                    <button onClick={() => setStock(stock.map(x => x.id === s.id ? { ...x, cantidad: Math.max(0, x.cantidad - 1) } : x))}
                                        disabled={s.cantidad === 0} className="text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium disabled:opacity-40 disabled:cursor-not-allowed">-1</button>
                                </td>
                            </tr>
                        ))}
                        {stock.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-400 text-lg">No hay libros en stock.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Collect all known book titles for autocomplete
    const knownTitles = useMemo(() => {
        const set = new Set();
        grados.forEach(g => g.libros.forEach(l => set.add(l.titulo)));
        stock.forEach(s => set.add(s.titulo));
        pedidos.forEach(p => p.libros.forEach(l => set.add(l.titulo)));
        return Array.from(set);
    }, [grados, stock, pedidos]);

    // === TABS ===
    const tabs = [
        { key: 'pedidos', label: 'Pedidos', icon: BookOpen },
        { key: 'gestion', label: 'Gestión de Libros', icon: ShoppingCart },
        { key: 'catalogo', label: 'Catálogo por Grado', icon: Settings },
        { key: 'stock', label: 'Stock de Libros', icon: Package },
    ];

    const pedidoPago = mPago ? pedidos.find(p => p.id === mPago) : null;
    const pedidoAgregar = mAgregar ? pedidos.find(p => p.id === mAgregar) : null;

    return (
        <div className="p-8">
            <Notification message={notif} onClose={() => setNotif(null)} />
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm?.fn()} message={confirm?.msg} />

            <h2 className="text-3xl font-bold text-gray-800 mb-6">Encargos Escolares</h2>
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'gestion' && <GestionLibrosTab />}
            {tab === 'pedidos' && <PedidosTab />}
            {tab === 'catalogo' && <CatalogoTab />}
            {tab === 'stock' && <StockTab />}

            {/* MODAL: Nuevo Pedido */}
            <Modal open={mNuevo} onClose={() => setMNuevo(false)} title="Nuevo Pedido" wide>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BookSelector grados={grados} knownTitles={knownTitles} selGrado={npGrado} setSelGrado={setNpGrado} selBooks={npBooks} setSelBooks={setNpBooks} manual={npManual} setManual={setNpManual} />
                    <div className="space-y-4">
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Cliente *</label>
                            <input value={npClient} onChange={e => setNpClient(e.target.value)} placeholder="Ej. María" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono (WhatsApp)</label>
                            <input value={npPhone} onChange={e => setNpPhone(e.target.value)} placeholder="1123456789" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Seña / Adelanto ($)</label>
                            <input type="number" value={npSena} onChange={e => setNpSena(e.target.value)} placeholder="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        {npBooks.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <p className="text-sm font-bold text-blue-800 mb-2">Resumen:</p>
                                {npBooks.map((b, i) => <div key={i} className="flex justify-between text-sm text-blue-700"><span>• {b.titulo}</span><span className="font-bold">{fmt(b.precio)}</span></div>)}
                                <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold text-blue-900">
                                    <span>Total:</span><span>{fmt(npBooks.reduce((s, b) => s + b.precio, 0))}</span>
                                </div>
                            </div>
                        )}
                        <button onClick={crearPedido} disabled={!npClient || npBooks.length === 0}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
                            Crear Pedido ({npBooks.length} libros)
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: Agregar Libros a pedido existente */}
            <Modal open={!!mAgregar} onClose={() => setMAgregar(null)} title={`Agregar Libros — ${pedidoAgregar?.cliente}`} wide>
                <BookSelector grados={grados} knownTitles={knownTitles} selGrado={alGrado} setSelGrado={setAlGrado} selBooks={alBooks} setSelBooks={setAlBooks} manual={alManual} setManual={setAlManual} />
                {alBooks.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-4">
                        {alBooks.map((b, i) => <div key={i} className="flex justify-between text-sm text-blue-700"><span>• {b.titulo}</span><span className="font-bold">{fmt(b.precio)}</span></div>)}
                        <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold text-blue-900"><span>Subtotal:</span><span>{fmt(alBooks.reduce((s, b) => s + b.precio, 0))}</span></div>
                    </div>
                )}
                <button onClick={agregarLibros} disabled={alBooks.length === 0} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
                    Agregar {alBooks.length} Libro(s)
                </button>
            </Modal>

            {/* MODAL: Registrar Pago */}
            <Modal open={!!mPago} onClose={() => setMPago(null)} title={`Registrar Pago — ${pedidoPago?.cliente}`}>
                {pedidoPago && (() => {
                    const c = calcPedido(pedidoPago); return (
                        <div>
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Total pedido:</span><span className="font-bold">{fmt(c.totalPrecio)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Total pagado:</span><span className="font-bold text-green-600">{fmt(c.totalPagado)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Deuda:</span><span className="font-bold text-red-600">{fmt(c.deuda)}</span></div>
                            </div>
                            {pedidoPago.pagos.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Historial:</p>
                                    {pedidoPago.pagos.map(pa => <div key={pa.id} className="flex justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg mb-1"><span>{pa.nota} — {pa.fecha}</span><span className="font-bold text-green-600">{fmt(pa.monto)}</span></div>)}
                                </div>
                            )}
                            <div className="space-y-3">
                                <div><label className="block text-sm font-semibold text-gray-600 mb-1">Monto *</label>
                                    <input type="number" value={rpMonto} onChange={e => setRpMonto(e.target.value)} placeholder="10000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nota</label>
                                    <input value={rpNota} onChange={e => setRpNota(e.target.value)} placeholder="Ej. Pago efectivo" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                                <button onClick={registrarPago} disabled={!rpMonto || parseFloat(rpMonto) <= 0}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Registrar Pago</button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* MODAL: Ingresar Stock */}
            <Modal open={mStock} onClose={() => setMStock(false)} title="Ingresar Libros al Stock">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Título del libro</label>
                        <input value={isTitulo} onChange={e => setIsTitulo(e.target.value)} placeholder="Ej. Matemática en Acción 1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Cantidad</label>
                        <input type="number" value={isCant} onChange={e => setIsCant(e.target.value)} min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-2">Tipo</label>
                        <div className="flex gap-4">
                            {['nuevo', 'usado'].map(t => (
                                <label key={t} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-medium transition-all ${isTipo === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="tipo" checked={isTipo === t} onChange={() => setIsTipo(t)} className="hidden" />
                                    {t === 'nuevo' ? '📗 Nuevo' : '📙 Usado'}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button onClick={ingresarStock} disabled={!isTitulo || !parseInt(isCant)}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Ingresar</button>
                </div>
            </Modal>

            {/* MODAL: Nuevo Grado */}
            <Modal open={mGrado} onClose={() => setMGrado(false)} title="Nuevo Grado">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del grado</label>
                        <input value={ngNombre} onChange={e => setNgNombre(e.target.value)} placeholder="Ej. 4to Grado" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <button onClick={() => { if (ngNombre) { setGrados([...grados, { id: uid(), nombre: ngNombre, libros: [] }]); setMGrado(false); } }}
                        disabled={!ngNombre} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear Grado</button>
                </div>
            </Modal>

            {/* MODAL: Agregar Libro al Catálogo */}
            <Modal open={!!mLibroCat} onClose={() => setMLibroCat(null)} title="Agregar Libro al Catálogo">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Título *</label>
                        <input value={alcTitulo} onChange={e => setAlcTitulo(e.target.value)} placeholder="Nombre del libro" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Editorial</label>
                        <input value={alcEdit} onChange={e => setAlcEdit(e.target.value)} placeholder="Opcional" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Precio</label>
                        <input type="number" value={alcPrecio} onChange={e => setAlcPrecio(e.target.value)} placeholder="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <button onClick={() => { if (alcTitulo) { setGrados(grados.map(g => g.id === mLibroCat ? { ...g, libros: [...g.libros, { id: uid(), titulo: alcTitulo, editorial: alcEdit, precio: parseFloat(alcPrecio) || 0 }] } : g)); setMLibroCat(null); } }}
                        disabled={!alcTitulo} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Agregar Libro</button>
                </div>
            </Modal>
        </div>
    );
}
