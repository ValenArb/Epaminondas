import { useState } from 'react';
import { Users, Plus, Package, Clock, Check, Settings, ChevronDown, ChevronRight, Edit2, Trash2, Printer, DollarSign } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_ANIOS = [
    {
        id: 1, nombre: '1er Año',
        materiales: [
            { id: 101, titulo: 'Módulo Matemática 1', descripcion: '80 páginas', precio: 2500 },
            { id: 102, titulo: 'Apunte Historia 1', descripcion: '40 páginas', precio: 1200 },
        ]
    },
    {
        id: 2, nombre: '3er Año',
        materiales: [
            { id: 201, titulo: 'Módulo Historia 3er Año', descripcion: '60 páginas', precio: 1800 },
            { id: 202, titulo: 'Apunte Biología 3', descripcion: '30 páginas', precio: 900 },
            { id: 203, titulo: 'Módulo Geografía 3', descripcion: '45 páginas', precio: 1500 },
        ]
    },
];

const MOCK_FOTOCOPIAS = [
    { id: 1, solicitante: 'Prof. Gómez', material: 'Módulo Historia 3er Año', cantidad: 20, precio: 1800, pagado: 0, estadoPago: 'nada', estado: 'pendiente', fecha: '2024-02-01' },
    { id: 2, solicitante: 'Martina (Alumna)', material: 'Apunte Biología 3', cantidad: 1, precio: 900, pagado: 900, estadoPago: 'total', estado: 'listo', fecha: '2024-02-03' },
    { id: 3, solicitante: 'Colegio San José', material: 'Exámenes de Matemática', cantidad: 30, precio: 4500, pagado: 4500, estadoPago: 'total', estado: 'entregado', fecha: '2024-01-28' }
];

const PAGO_CONFIG = {
    total: { label: 'Pagó Total', style: 'bg-green-100 text-green-800' },
    parcial: { label: 'Pagó Parcial', style: 'bg-yellow-100 text-yellow-800' },
    nada: { label: 'No Pagó', style: 'bg-red-100 text-red-800' },
};

export default function Fotocopias() {
    const [activeTab, setActiveTab] = useState('tablero');
    const [anios, setAnios] = useState(MOCK_ANIOS);
    const [fotocopias, setFotocopias] = useState(MOCK_FOTOCOPIAS);

    const [showNewOrder, setShowNewOrder] = useState(false);
    const [selectedAnio, setSelectedAnio] = useState(null);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [orderRequester, setOrderRequester] = useState('');
    const [orderQuantity, setOrderQuantity] = useState('1');

    const [notification, setNotification] = useState(null);

    const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    const getPriceForMaterial = (titulo) => {
        for (const a of anios) {
            const mat = a.materiales.find(m => m.titulo === titulo);
            if (mat) return mat.precio;
        }
        return 0;
    };

    const updateStatus = (id, newStatus) => {
        setFotocopias(fotocopias.map(p => p.id === id ? { ...p, estado: newStatus } : p));
    };

    const updatePaymentStatus = (id, newPago) => {
        setFotocopias(fotocopias.map(order => {
            if (order.id !== id) return order;
            if (newPago === 'total') {
                return { ...order, estadoPago: 'total', pagado: order.precio };
            } else if (newPago === 'nada') {
                return { ...order, estadoPago: 'nada', pagado: 0 };
            } else {
                const montoStr = prompt(`Monto pagado parcialmente (de ${formatMoney(order.precio)}):`, String(order.pagado));
                if (!montoStr || isNaN(montoStr)) return order;
                return { ...order, estadoPago: 'parcial', pagado: parseFloat(montoStr) };
            }
        }));
    };

    // ==========================================
    // NEW ORDER WITH YEAR SELECTOR
    // ==========================================
    const handleCreateOrders = () => {
        if (!orderRequester || selectedMaterials.length === 0) {
            alert('Completá el nombre del solicitante y seleccioná al menos un material.');
            return;
        }
        const cantidad = parseInt(orderQuantity) || 1;
        const newOrders = selectedMaterials.map(material => {
            const precio = getPriceForMaterial(material) * cantidad;
            return {
                id: Date.now() + Math.random(),
                solicitante: orderRequester,
                material,
                cantidad,
                precio,
                pagado: 0,
                estadoPago: 'nada',
                estado: 'pendiente',
                fecha: new Date().toISOString().split('T')[0]
            };
        });
        setFotocopias([...fotocopias, ...newOrders]);
        showNotification(`✅ Se crearon ${newOrders.length} trabajo(s) para ${orderRequester}`);
        setShowNewOrder(false);
        setSelectedAnio(null);
        setSelectedMaterials([]);
        setOrderRequester('');
        setOrderQuantity('1');
    };

    const handleManualNew = () => {
        const solicitante = prompt("¿Quién solicita/retira el trabajo?");
        if (!solicitante) return;
        const material = prompt("Descripción del material (Ej. Módulo 3er Año):");
        if (!material) return;
        const cantidadStr = prompt("¿Cuántas copias?", "1");
        const cantidad = parseInt(cantidadStr) || 1;
        const precioStr = prompt("Precio total:", "0");
        const precio = parseFloat(precioStr) || 0;
        setFotocopias([...fotocopias, { id: Date.now(), solicitante, material, cantidad, precio, pagado: 0, estadoPago: 'nada', estado: 'pendiente', fecha: new Date().toISOString().split('T')[0] }]);
    };

    // ==========================================
    // INGRESO DE MATERIALES CON AUTO-ASIGNACIÓN
    // ==========================================
    const handleIngresoMaterial = () => {
        const material = prompt("¿Qué material se imprimió? (Nombre exacto):");
        if (!material) return;
        const cantidadStr = prompt("¿Cuántas copias se imprimieron?", "1");
        const cantidad = parseInt(cantidadStr);
        if (isNaN(cantidad) || cantidad <= 0) return;

        let remaining = cantidad;
        let assigned = 0;
        const updated = [...fotocopias];

        const pendingIndexes = updated
            .map((f, i) => ({ ...f, _idx: i }))
            .filter(f => f.material.toLowerCase() === material.toLowerCase() && f.estado === 'pendiente')
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (const pending of pendingIndexes) {
            if (remaining <= 0) break;
            if (remaining >= pending.cantidad) {
                updated[pending._idx] = { ...updated[pending._idx], estado: 'listo' };
                remaining -= pending.cantidad;
                assigned++;
            } else {
                updated[pending._idx] = { ...updated[pending._idx], cantidad: pending.cantidad - remaining };
                remaining = 0;
            }
        }

        setFotocopias(updated);

        let msg = `🖨️ Imprimidas ${cantidad} copias de "${material}".`;
        if (assigned > 0) msg += `\n🔔 Se asignaron automáticamente ${assigned} pedido(s) como "Listo".`;
        if (remaining > 0) msg += `\n📄 ${remaining} copias sin pedido pendiente.`;
        showNotification(msg);
    };

    // ==========================================
    // TAB: TABLERO KANBAN
    // ==========================================
    const Column = ({ title, status, icon: Icon, colorClass, bgClass }) => {
        const tasks = fotocopias.filter(p => p.estado === status);
        return (
            <div className={`rounded-2xl p-5 border-t-8 ${colorClass} ${bgClass} flex flex-col h-full shadow-sm`}>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        <Icon size={20} className="text-gray-600" /> {title}
                    </h3>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-500 shadow-sm">{tasks.length}</span>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {tasks.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="font-bold text-gray-800 text-lg mb-1 leading-tight">{job.material}</p>
                            {job.cantidad > 1 && <p className="text-xs text-blue-600 font-bold mb-1">{job.cantidad} copias</p>}
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-2">
                                <Users size={14} /> {job.solicitante}
                            </p>

                            {/* Price & Payment */}
                            {job.precio > 0 && (
                                <div className="bg-gray-50 rounded-lg p-2 mb-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Precio:</span>
                                        <span className="font-bold text-green-600">{formatMoney(job.precio)}</span>
                                    </div>
                                    {job.estadoPago !== 'total' && job.precio > 0 && (
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-500">Debe:</span>
                                            <span className="font-bold text-red-500">{formatMoney(job.precio - job.pagado)}</span>
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <select value={job.estadoPago} onChange={(e) => updatePaymentStatus(job.id, e.target.value)}
                                            className={`w-full text-xs rounded-lg px-2 py-1.5 cursor-pointer outline-none font-bold ${PAGO_CONFIG[job.estadoPago].style}`}>
                                            {Object.entries(PAGO_CONFIG).map(([key, cfg]) => (
                                                <option key={key} value={key} className="bg-white text-gray-800">{cfg.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 mb-3">{job.fecha}</p>

                            <div className="pt-3 border-t border-gray-50">
                                {status === 'pendiente' && (
                                    <button onClick={() => updateStatus(job.id, 'listo')}
                                        className="w-full bg-blue-50 text-blue-700 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                        ¡Terminado! (Pasar a mostrador)
                                    </button>
                                )}
                                {status === 'listo' && (
                                    <button onClick={() => updateStatus(job.id, 'entregado')}
                                        className="w-full bg-green-50 text-green-700 py-2.5 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                        Marcar como Entregado
                                    </button>
                                )}
                                {status === 'entregado' && (
                                    <div className="w-full flex justify-between items-center text-gray-400 text-sm py-1 font-medium">
                                        <span>✓ Finalizado</span>
                                        <button onClick={() => setFotocopias(fotocopias.filter(p => p.id !== job.id))}
                                            className="hover:text-red-500 px-2">Archivar</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="text-center py-10 text-gray-400 font-medium">No hay trabajos aquí</div>
                    )}
                </div>
            </div>
        );
    };

    const selectedAnioData = anios.find(a => a.id === selectedAnio);

    const TableroTab = () => (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    <button onClick={() => setShowNewOrder(true)} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                        <Plus size={20} /> Nuevo Trabajo (por Año)
                    </button>
                    <button onClick={handleManualNew} className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium shadow-sm transition-all">
                        <Edit2 size={18} /> Trabajo Manual
                    </button>
                    <button onClick={handleIngresoMaterial} className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all">
                        <Printer size={18} /> Registrar Impresión
                    </button>
                </div>
            </div>

            {/* MODAL: New order by year */}
            {showNewOrder && (
                <div className="mb-8 bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xl font-bold text-gray-800">Nuevo Trabajo por Año</h3>
                        <button onClick={() => setShowNewOrder(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Seleccionar Año</label>
                            <select value={selectedAnio || ''} onChange={(e) => { setSelectedAnio(Number(e.target.value) || null); setSelectedMaterials([]); }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                                <option value="">-- Elegir año --</option>
                                {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>

                            {selectedAnio && selectedAnioData && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Materiales disponibles:</p>
                                    {selectedAnioData.materiales.map(mat => (
                                        <label key={mat.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMaterials.includes(mat.titulo) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={selectedMaterials.includes(mat.titulo)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedMaterials([...selectedMaterials, mat.titulo]);
                                                        else setSelectedMaterials(selectedMaterials.filter(t => t !== mat.titulo));
                                                    }}
                                                    className="w-5 h-5 rounded text-blue-600" />
                                                <div>
                                                    <span className="font-medium text-gray-800">{mat.titulo}</span>
                                                    {mat.descripcion && <span className="text-sm text-gray-500 ml-2">({mat.descripcion})</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600 text-sm whitespace-nowrap">{formatMoney(mat.precio)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Solicitante *</label>
                                <input type="text" value={orderRequester} onChange={e => setOrderRequester(e.target.value)} placeholder="Ej. Prof. Gómez"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Cantidad de copias</label>
                                <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} min="1"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>

                            {selectedMaterials.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <p className="text-sm font-bold text-blue-800 mb-2">Resumen ({selectedMaterials.length} material/es):</p>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        {selectedMaterials.map((t, i) => (
                                            <li key={i} className="flex justify-between">
                                                <span>• {t} (×{orderQuantity})</span>
                                                <span className="font-bold">{formatMoney(getPriceForMaterial(t) * (parseInt(orderQuantity) || 1))}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between font-bold text-blue-900">
                                        <span>Total:</span>
                                        <span className="text-lg">{formatMoney(selectedMaterials.reduce((s, t) => s + getPriceForMaterial(t) * (parseInt(orderQuantity) || 1), 0))}</span>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleCreateOrders}
                                disabled={!orderRequester || selectedMaterials.length === 0}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm">
                                Crear {selectedMaterials.length} Trabajo(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                <Column title="Pendientes de Hacer" status="pendiente" icon={Clock} colorClass="border-orange-400" bgClass="bg-orange-50/50" />
                <Column title="Listos (En mostrador)" status="listo" icon={Package} colorClass="border-blue-400" bgClass="bg-blue-50/50" />
                <Column title="Entregados" status="entregado" icon={Check} colorClass="border-green-400" bgClass="bg-green-50/50" />
            </div>
        </div>
    );

    // ==========================================
    // TAB: CATÁLOGO POR AÑO
    // ==========================================
    const CatalogoTab = () => {
        const [expandedAnio, setExpandedAnio] = useState(null);

        const handleAddAnio = () => {
            const nombre = prompt("Nombre del año/grado (ej. '3er Año', 'Nivel Inicial'):");
            if (!nombre) return;
            setAnios([...anios, { id: Date.now(), nombre, materiales: [] }]);
        };

        const handleDeleteAnio = (id) => {
            if (!confirm('¿Eliminar este año y todos sus materiales?')) return;
            setAnios(anios.filter(a => a.id !== id));
        };

        const handleRenameAnio = (id) => {
            const anio = anios.find(a => a.id === id);
            const nombre = prompt("Nuevo nombre:", anio.nombre);
            if (!nombre) return;
            setAnios(anios.map(a => a.id === id ? { ...a, nombre } : a));
        };

        const handleAddMaterial = (anioId) => {
            const titulo = prompt("Título del material:");
            if (!titulo) return;
            const descripcion = prompt("Descripción breve (ej. '80 páginas'):", "") || '';
            const precioStr = prompt("Precio por unidad:", "0");
            const precio = parseFloat(precioStr) || 0;
            setAnios(anios.map(a => a.id === anioId
                ? { ...a, materiales: [...a.materiales, { id: Date.now(), titulo, descripcion, precio }] }
                : a
            ));
        };

        const handleEditPrecio = (anioId, matId) => {
            const anio = anios.find(a => a.id === anioId);
            const mat = anio.materiales.find(m => m.id === matId);
            const precioStr = prompt(`Nuevo precio para "${mat.titulo}":`, String(mat.precio));
            if (!precioStr || isNaN(precioStr)) return;
            setAnios(anios.map(a => a.id === anioId
                ? { ...a, materiales: a.materiales.map(m => m.id === matId ? { ...m, precio: parseFloat(precioStr) } : m) }
                : a
            ));
        };

        const handleDeleteMaterial = (anioId, matId) => {
            setAnios(anios.map(a => a.id === anioId
                ? { ...a, materiales: a.materiales.filter(m => m.id !== matId) }
                : a
            ));
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500">Configurá los materiales de fotocopias por año con sus precios.</p>
                    <button onClick={handleAddAnio} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                        <Plus size={20} /> Nuevo Año
                    </button>
                </div>

                <div className="space-y-4">
                    {anios.map(anio => {
                        const totalAnio = anio.materiales.reduce((s, m) => s + m.precio, 0);
                        return (
                            <div key={anio.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                                <div className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedAnio(expandedAnio === anio.id ? null : anio.id)}>
                                    <div className="flex items-center gap-3">
                                        {expandedAnio === anio.id ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                        <h3 className="text-xl font-bold text-gray-800">{anio.nombre}</h3>
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">{anio.materiales.length} materiales</span>
                                        {totalAnio > 0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">{formatMoney(totalAnio)}</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleRenameAnio(anio.id); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAnio(anio.id); }}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {expandedAnio === anio.id && (
                                    <div className="border-t bg-gray-50/50 p-5">
                                        <div className="space-y-2 mb-4">
                                            {anio.materiales.map(mat => (
                                                <div key={mat.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border">
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-800">{mat.titulo}</span>
                                                        {mat.descripcion && <span className="text-sm text-gray-500 ml-2">— {mat.descripcion}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => handleEditPrecio(anio.id, mat.id)}
                                                            className="font-bold text-green-600 hover:text-green-800 transition-colors flex items-center gap-1">
                                                            <DollarSign size={14} /> {formatMoney(mat.precio)}
                                                        </button>
                                                        <button onClick={() => handleDeleteMaterial(anio.id, mat.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {anio.materiales.length === 0 && (
                                                <p className="text-gray-400 text-center py-4">No hay materiales en este año.</p>
                                            )}
                                        </div>
                                        <button onClick={() => handleAddMaterial(anio.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium transition-colors text-sm">
                                            <Plus size={16} /> Agregar Material
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {anios.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-lg">No hay años configurados. Creá uno para empezar.</div>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // MAIN RENDER
    // ==========================================
    const tabs = [
        { key: 'tablero', label: 'Tablero', icon: Clock },
        { key: 'catalogo', label: 'Catálogo por Año', icon: Settings },
    ];

    return (
        <div className="p-8 h-full flex flex-col">
            {notification && (
                <div className="fixed top-6 right-6 z-50 bg-white border-2 border-green-300 shadow-2xl rounded-2xl px-6 py-4 max-w-md animate-bounce">
                    <p className="text-gray-800 font-medium whitespace-pre-line">{notification}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Tablero de Fotocopias</h2>
            </div>

            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm
              ${activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'tablero' && <TableroTab />}
            {activeTab === 'catalogo' && <CatalogoTab />}
        </div>
    );
}
