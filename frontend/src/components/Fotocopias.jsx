import { useState, useMemo } from 'react';
import { Users, Plus, Package, Clock, Check, Settings, ChevronDown, ChevronRight, Edit2, Trash2, Printer, DollarSign } from 'lucide-react';
import { Modal, ConfirmDialog, Notification } from './Modal';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const uid = () => Date.now() + Math.random();
const today = () => new Date().toISOString().split('T')[0];

const INIT_ANIOS = [
    {
        id: 1, nombre: '1er Año', materiales: [
            { id: 101, titulo: 'Módulo Matemática 1', descripcion: '80 páginas', precio: 2500 },
            { id: 102, titulo: 'Apunte Historia 1', descripcion: '40 páginas', precio: 1200 },
        ]
    },
    {
        id: 2, nombre: '3er Año', materiales: [
            { id: 201, titulo: 'Módulo Historia 3er Año', descripcion: '60 páginas', precio: 1800 },
            { id: 202, titulo: 'Apunte Biología 3', descripcion: '30 páginas', precio: 900 },
            { id: 203, titulo: 'Módulo Geografía 3', descripcion: '45 páginas', precio: 1500 },
        ]
    },
];

const INIT_FOTOS = [
    { id: 1, solicitante: 'Prof. Gómez', material: 'Módulo Historia 3er Año', cantidad: 20, precio: 1800, pagos: [], estado: 'pendiente', fecha: '2024-02-01' },
    { id: 2, solicitante: 'Martina (Alumna)', material: 'Apunte Biología 3', cantidad: 1, precio: 900, pagos: [{ id: 1, monto: 900, fecha: '2024-02-03', nota: 'Pagó todo' }], estado: 'listo', fecha: '2024-02-03' },
    { id: 3, solicitante: 'Colegio San José', material: 'Exámenes de Matemática', cantidad: 30, precio: 4500, pagos: [{ id: 2, monto: 4500, fecha: '2024-01-28', nota: 'Pago completo' }], estado: 'entregado', fecha: '2024-01-28' },
];

export default function Fotocopias() {
    const [tab, setTab] = useState('tablero');
    const [anios, setAnios] = useState(INIT_ANIOS);
    const [fotos, setFotos] = useState(INIT_FOTOS);
    const [notif, setNotif] = useState(null);

    // Modal states
    const [mNuevo, setMNuevo] = useState(false);
    const [mManual, setMManual] = useState(false);
    const [mImpresion, setMImpresion] = useState(false);
    const [mPago, setMPago] = useState(null);
    const [mAnio, setMAnio] = useState(false);
    const [mMaterial, setMMaterial] = useState(null); // anioId
    const [confirm, setConfirm] = useState(null);

    // Nuevo Trabajo form
    const [ntAnio, setNtAnio] = useState(null);
    const [ntMats, setNtMats] = useState([]);
    const [ntSolicitante, setNtSolicitante] = useState('');
    const [ntCantidad, setNtCantidad] = useState('1');

    // Manual form
    const [mmSolicitante, setMmSolicitante] = useState('');
    const [mmMaterial, setMmMaterial] = useState('');
    const [mmCantidad, setMmCantidad] = useState('1');
    const [mmPrecio, setMmPrecio] = useState('');

    // Impresion form
    const [impMaterial, setImpMaterial] = useState('');
    const [impCantidad, setImpCantidad] = useState('1');

    // Pago form
    const [rpMonto, setRpMonto] = useState('');
    const [rpNota, setRpNota] = useState('');

    // Catalogo forms
    const [naNombre, setNaNombre] = useState('');
    const [nmTitulo, setNmTitulo] = useState('');
    const [nmDesc, setNmDesc] = useState('');
    const [nmPrecio, setNmPrecio] = useState('');
    const [expandedAnio, setExpandedAnio] = useState(null);
    const [editPrice, setEditPrice] = useState(null);
    const [editPriceVal, setEditPriceVal] = useState('');
    const [editAnioName, setEditAnioName] = useState(null);
    const [editAnioVal, setEditAnioVal] = useState('');

    const notify = (m) => { setNotif(m); setTimeout(() => setNotif(null), 5000); };

    const getPrecio = (titulo) => { for (const a of anios) { const m = a.materiales.find(x => x.titulo === titulo); if (m) return m.precio; } return 0; };
    const totalPagado = (f) => f.pagos.reduce((s, p) => s + p.monto, 0);

    // Handlers
    const crearTrabajos = () => {
        if (!ntSolicitante || ntMats.length === 0) return;
        const cant = parseInt(ntCantidad) || 1;
        const nuevos = ntMats.map(m => ({
            id: uid(), solicitante: ntSolicitante, material: m.titulo, cantidad: cant, precio: m.precio * cant, pagos: [], estado: 'pendiente', fecha: today()
        }));
        setFotos([...fotos, ...nuevos]);
        notify(`✅ ${nuevos.length} trabajo(s) creados para ${ntSolicitante}`);
        setNtAnio(null); setNtMats([]); setNtSolicitante(''); setNtCantidad('1'); setMNuevo(false);
    };

    const crearManual = () => {
        if (!mmSolicitante || !mmMaterial) return;
        setFotos([...fotos, { id: uid(), solicitante: mmSolicitante, material: mmMaterial, cantidad: parseInt(mmCantidad) || 1, precio: parseFloat(mmPrecio) || 0, pagos: [], estado: 'pendiente', fecha: today() }]);
        notify(`✅ Trabajo creado para ${mmSolicitante}`);
        setMmSolicitante(''); setMmMaterial(''); setMmCantidad('1'); setMmPrecio(''); setMManual(false);
    };

    const registrarPago = () => {
        const monto = parseFloat(rpMonto);
        if (!mPago || !monto || monto <= 0) return;
        setFotos(fotos.map(f => f.id === mPago ? { ...f, pagos: [...f.pagos, { id: uid(), monto, fecha: today(), nota: rpNota || 'Pago' }] } : f));
        notify(`💰 Pago de ${fmt(monto)} registrado`);
        setRpMonto(''); setRpNota(''); setMPago(null);
    };

    const registrarImpresion = () => {
        if (!impMaterial || !parseInt(impCantidad)) return;
        const cantidad = parseInt(impCantidad);
        let remaining = cantidad, assigned = 0;
        const up = fotos.map(f => {
            if (remaining > 0 && f.material.toLowerCase() === impMaterial.toLowerCase() && f.estado === 'pendiente') {
                if (remaining >= f.cantidad) { remaining -= f.cantidad; assigned++; return { ...f, estado: 'listo' }; }
                else { const r = remaining; remaining = 0; return { ...f, cantidad: f.cantidad - r }; }
            }
            return f;
        });
        setFotos(up);
        let msg = `🖨️ ${cantidad} copias de "${impMaterial}"`;
        if (assigned > 0) msg += `\n🔔 ${assigned} pedido(s) → "Listo"`;
        notify(msg);
        setImpMaterial(''); setImpCantidad('1'); setMImpresion(false);
    };

    // Kanban Column
    const Column = ({ title, status, icon: Icon, colorClass, bgClass }) => {
        const tasks = fotos.filter(f => f.estado === status);
        return (
            <div className={`rounded-2xl p-5 border-t-8 ${colorClass} ${bgClass} flex flex-col h-full shadow-sm`}>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg"><Icon size={20} className="text-gray-600" /> {title}</h3>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-500 shadow-sm">{tasks.length}</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {tasks.map(job => {
                        const pagado = totalPagado(job);
                        const deuda = job.precio - pagado;
                        return (
                            <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                <p className="font-bold text-gray-800 text-lg mb-1">{job.material}</p>
                                {job.cantidad > 1 && <p className="text-xs text-blue-600 font-bold mb-1">{job.cantidad} copias</p>}
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-2"><Users size={14} /> {job.solicitante}</p>
                                {job.precio > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-2 mb-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Precio:</span><span className="font-bold text-green-600">{fmt(job.precio)}</span></div>
                                        {pagado > 0 && <div className="flex justify-between"><span className="text-gray-500">Pagado:</span><span className="font-bold text-green-600">{fmt(pagado)}</span></div>}
                                        {deuda > 0 && <div className="flex justify-between"><span className="text-gray-500">Debe:</span><span className="font-bold text-red-500">{fmt(deuda)}</span></div>}
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mb-3">{job.fecha}</p>
                                <div className="pt-3 border-t border-gray-50 space-y-2">
                                    <button onClick={() => { setRpMonto(''); setRpNota(''); setMPago(job.id); }}
                                        className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                                        <DollarSign size={14} /> Registrar Pago
                                    </button>
                                    {status === 'pendiente' && (
                                        <button onClick={() => setFotos(fotos.map(f => f.id === job.id ? { ...f, estado: 'listo' } : f))}
                                            className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">¡Terminado!</button>
                                    )}
                                    {status === 'listo' && (
                                        <button onClick={() => setFotos(fotos.map(f => f.id === job.id ? { ...f, estado: 'entregado' } : f))}
                                            className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">Entregado</button>
                                    )}
                                    {status === 'entregado' && (
                                        <p className="text-center text-gray-400 text-sm font-medium">✓ Finalizado</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {tasks.length === 0 && <p className="text-center py-10 text-gray-400 font-medium">Vacío</p>}
                </div>
            </div>
        );
    };

    const TableroTab = () => (
        <div className="flex flex-col h-full">
            <div className="flex gap-3 mb-6">
                <button onClick={() => { setNtAnio(null); setNtMats([]); setNtSolicitante(''); setNtCantidad('1'); setMNuevo(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm"><Plus size={20} /> Nuevo Trabajo (por Año)</button>
                <button onClick={() => { setMmSolicitante(''); setMmMaterial(''); setMmCantidad('1'); setMmPrecio(''); setMManual(true); }} className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium shadow-sm"><Edit2 size={18} /> Trabajo Manual</button>
                <button onClick={() => { setImpMaterial(''); setImpCantidad('1'); setMImpresion(true); }} className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm"><Printer size={18} /> Registrar Impresión</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                <Column title="Pendientes" status="pendiente" icon={Clock} colorClass="border-orange-400" bgClass="bg-orange-50/50" />
                <Column title="Listos" status="listo" icon={Package} colorClass="border-blue-400" bgClass="bg-blue-50/50" />
                <Column title="Entregados" status="entregado" icon={Check} colorClass="border-green-400" bgClass="bg-green-50/50" />
            </div>
        </div>
    );

    const CatalogoTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">Configurá los materiales por año con sus precios.</p>
                <button onClick={() => { setNaNombre(''); setMAnio(true); }} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm"><Plus size={20} /> Nuevo Año</button>
            </div>
            <div className="space-y-4">
                {anios.map(a => {
                    const total = a.materiales.reduce((s, m) => s + m.precio, 0);
                    const isExp = expandedAnio === a.id;
                    return (
                        <div key={a.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedAnio(isExp ? null : a.id)}>
                                <div className="flex items-center gap-3">
                                    {isExp ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                                    {editAnioName === a.id ? (
                                        <input autoFocus value={editAnioVal} onChange={e => setEditAnioVal(e.target.value)}
                                            onBlur={() => { setAnios(anios.map(x => x.id === a.id ? { ...x, nombre: editAnioVal } : x)); setEditAnioName(null); }}
                                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditAnioName(null); }}
                                            onClick={e => e.stopPropagation()} className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 outline-none bg-transparent px-1" />
                                    ) : <h3 className="text-xl font-bold text-gray-800">{a.nombre}</h3>}
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">{a.materiales.length}</span>
                                    {total > 0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">{fmt(total)}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={e => { e.stopPropagation(); setEditAnioVal(a.nombre); setEditAnioName(a.id); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                    <button onClick={e => { e.stopPropagation(); setConfirm({ msg: `¿Eliminar "${a.nombre}"?`, fn: () => setAnios(anios.filter(x => x.id !== a.id)) }); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            {isExp && (
                                <div className="border-t bg-gray-50/50 p-5">
                                    <div className="space-y-2 mb-4">
                                        {a.materiales.map(m => (
                                            <div key={m.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border">
                                                <div className="flex-1"><span className="font-medium text-gray-800">{m.titulo}</span>{m.descripcion && <span className="text-sm text-gray-500 ml-2">— {m.descripcion}</span>}</div>
                                                <div className="flex items-center gap-3">
                                                    {editPrice?.anioId === a.id && editPrice?.matId === m.id ? (
                                                        <input autoFocus type="number" value={editPriceVal} onChange={e => setEditPriceVal(e.target.value)}
                                                            onBlur={() => { setAnios(anios.map(x => x.id === a.id ? { ...x, materiales: x.materiales.map(y => y.id === m.id ? { ...y, precio: parseFloat(editPriceVal) || 0 } : y) } : x)); setEditPrice(null); }}
                                                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditPrice(null); }}
                                                            className="w-28 px-2 py-1 border-2 border-blue-400 rounded-lg text-right font-bold outline-none" />
                                                    ) : (
                                                        <button onClick={() => { setEditPrice({ anioId: a.id, matId: m.id }); setEditPriceVal(String(m.precio)); }}
                                                            className="font-bold text-green-600 hover:text-green-800 flex items-center gap-1"><DollarSign size={14} />{fmt(m.precio)}</button>
                                                    )}
                                                    <button onClick={() => setConfirm({ msg: `¿Eliminar "${m.titulo}"?`, fn: () => setAnios(anios.map(x => x.id === a.id ? { ...x, materiales: x.materiales.filter(y => y.id !== m.id) } : x)) })}
                                                        className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {a.materiales.length === 0 && <p className="text-gray-400 text-center py-4">No hay materiales.</p>}
                                    </div>
                                    <button onClick={() => { setNmTitulo(''); setNmDesc(''); setNmPrecio(''); setMMaterial(a.id); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium text-sm"><Plus size={16} /> Agregar Material</button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {anios.length === 0 && <p className="text-center py-12 text-gray-400 text-lg">No hay años.</p>}
            </div>
        </div>
    );

    const tabs = [
        { key: 'tablero', label: 'Tablero', icon: Clock },
        { key: 'catalogo', label: 'Catálogo por Año', icon: Settings },
    ];

    const fotoPago = mPago ? fotos.find(f => f.id === mPago) : null;
    const selectedAnioData = anios.find(a => a.id === ntAnio);

    return (
        <div className="p-8 h-full flex flex-col">
            <Notification message={notif} onClose={() => setNotif(null)} />
            <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm?.fn()} message={confirm?.msg} />

            <h2 className="text-3xl font-bold text-gray-800 mb-6">Tablero de Fotocopias</h2>
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'tablero' && <TableroTab />}
            {tab === 'catalogo' && <CatalogoTab />}

            {/* MODAL: Nuevo Trabajo por Año */}
            <Modal open={mNuevo} onClose={() => setMNuevo(false)} title="Nuevo Trabajo por Año" wide>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Seleccionar Año</label>
                        <select value={ntAnio || ''} onChange={e => { setNtAnio(Number(e.target.value) || null); setNtMats([]); }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg outline-none focus:border-blue-500">
                            <option value="">-- Elegir año --</option>
                            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                        {selectedAnioData?.materiales.map(m => (
                            <label key={m.id} className={`flex items-center justify-between gap-3 p-3 mt-2 rounded-xl border cursor-pointer transition-all ${ntMats.some(x => x.titulo === m.titulo) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={ntMats.some(x => x.titulo === m.titulo)}
                                        onChange={e => { if (e.target.checked) setNtMats([...ntMats, { titulo: m.titulo, precio: m.precio }]); else setNtMats(ntMats.filter(x => x.titulo !== m.titulo)); }}
                                        className="w-5 h-5 rounded text-blue-600" />
                                    <div><span className="font-medium text-gray-800">{m.titulo}</span>{m.descripcion && <span className="text-sm text-gray-500 ml-2">({m.descripcion})</span>}</div>
                                </div>
                                <span className="font-bold text-green-600 text-sm">{fmt(m.precio)}</span>
                            </label>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Solicitante *</label>
                            <input value={ntSolicitante} onChange={e => setNtSolicitante(e.target.value)} placeholder="Ej. Prof. Gómez" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Copias</label>
                            <input type="number" value={ntCantidad} onChange={e => setNtCantidad(e.target.value)} min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        {ntMats.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                {ntMats.map((m, i) => <div key={i} className="flex justify-between text-sm text-blue-700"><span>• {m.titulo} (×{ntCantidad})</span><span className="font-bold">{fmt(m.precio * (parseInt(ntCantidad) || 1))}</span></div>)}
                                <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold text-blue-900"><span>Total:</span><span>{fmt(ntMats.reduce((s, m) => s + m.precio * (parseInt(ntCantidad) || 1), 0))}</span></div>
                            </div>
                        )}
                        <button onClick={crearTrabajos} disabled={!ntSolicitante || ntMats.length === 0}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear {ntMats.length} Trabajo(s)</button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: Trabajo Manual */}
            <Modal open={mManual} onClose={() => setMManual(false)} title="Trabajo Manual">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Solicitante *</label>
                        <input value={mmSolicitante} onChange={e => setMmSolicitante(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Material *</label>
                        <input value={mmMaterial} onChange={e => setMmMaterial(e.target.value)} placeholder="Descripción" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Copias</label>
                            <input type="number" value={mmCantidad} onChange={e => setMmCantidad(e.target.value)} min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-sm font-semibold text-gray-600 mb-1">Precio total</label>
                            <input type="number" value={mmPrecio} onChange={e => setMmPrecio(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    </div>
                    <button onClick={crearManual} disabled={!mmSolicitante || !mmMaterial}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear Trabajo</button>
                </div>
            </Modal>

            {/* MODAL: Registrar Impresión */}
            <Modal open={mImpresion} onClose={() => setMImpresion(false)} title="Registrar Impresión">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Material imprimido</label>
                        <input value={impMaterial} onChange={e => setImpMaterial(e.target.value)} placeholder="Nombre exacto" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Copias impresas</label>
                        <input type="number" value={impCantidad} onChange={e => setImpCantidad(e.target.value)} min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <button onClick={registrarImpresion} disabled={!impMaterial || !parseInt(impCantidad)}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Registrar</button>
                </div>
            </Modal>

            {/* MODAL: Registrar Pago */}
            <Modal open={!!mPago} onClose={() => setMPago(null)} title={`Registrar Pago — ${fotoPago?.solicitante}`}>
                {fotoPago && (() => {
                    const pagado = totalPagado(fotoPago); const deuda = fotoPago.precio - pagado; return (
                        <div>
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Precio:</span><span className="font-bold">{fmt(fotoPago.precio)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Pagado:</span><span className="font-bold text-green-600">{fmt(pagado)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Debe:</span><span className="font-bold text-red-600">{fmt(deuda)}</span></div>
                            </div>
                            {fotoPago.pagos.length > 0 && fotoPago.pagos.map(pa => <div key={pa.id} className="flex justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg mb-1"><span>{pa.nota} — {pa.fecha}</span><span className="font-bold text-green-600">{fmt(pa.monto)}</span></div>)}
                            <div className="space-y-3 mt-4">
                                <div><label className="block text-sm font-semibold text-gray-600 mb-1">Monto *</label>
                                    <input type="number" value={rpMonto} onChange={e => setRpMonto(e.target.value)} placeholder="10000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nota</label>
                                    <input value={rpNota} onChange={e => setRpNota(e.target.value)} placeholder="Ej. Efectivo" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                                <button onClick={registrarPago} disabled={!rpMonto || parseFloat(rpMonto) <= 0}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Registrar Pago</button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* MODAL: Nuevo Año */}
            <Modal open={mAnio} onClose={() => setMAnio(false)} title="Nuevo Año">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Nombre</label>
                        <input value={naNombre} onChange={e => setNaNombre(e.target.value)} placeholder="Ej. 4to Año" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <button onClick={() => { if (naNombre) { setAnios([...anios, { id: uid(), nombre: naNombre, materiales: [] }]); setMAnio(false); } }}
                        disabled={!naNombre} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Crear Año</button>
                </div>
            </Modal>

            {/* MODAL: Agregar Material */}
            <Modal open={!!mMaterial} onClose={() => setMMaterial(null)} title="Agregar Material">
                <div className="space-y-4">
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Título *</label>
                        <input value={nmTitulo} onChange={e => setNmTitulo(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Descripción</label>
                        <input value={nmDesc} onChange={e => setNmDesc(e.target.value)} placeholder="Ej. 80 páginas" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-semibold text-gray-600 mb-1">Precio</label>
                        <input type="number" value={nmPrecio} onChange={e => setNmPrecio(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500" /></div>
                    <button onClick={() => { if (nmTitulo) { setAnios(anios.map(a => a.id === mMaterial ? { ...a, materiales: [...a.materiales, { id: uid(), titulo: nmTitulo, descripcion: nmDesc, precio: parseFloat(nmPrecio) || 0 }] } : a)); setMMaterial(null); } }}
                        disabled={!nmTitulo} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">Agregar</button>
                </div>
            </Modal>
        </div>
    );
}
