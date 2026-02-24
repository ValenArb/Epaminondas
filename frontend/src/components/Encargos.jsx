import { useState, useMemo } from 'react';
import { Plus, MessageCircle, Settings, Package, BookOpen, Trash2, ChevronDown, ChevronRight, Edit2, Archive } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_GRADOS = [
    {
        id: 1, nombre: '1er Grado',
        libros: [
            { id: 101, titulo: 'Matemática en Acción 1', isbn: '', editorial: 'Estrada' },
            { id: 102, titulo: 'Naturales 1', isbn: '', editorial: 'Santillana' },
            { id: 103, titulo: 'Sociales 1', isbn: '', editorial: 'Kapelusz' },
        ]
    },
    {
        id: 2, nombre: '2do Grado',
        libros: [
            { id: 201, titulo: 'Matemática en Acción 2', isbn: '', editorial: 'Estrada' },
            { id: 202, titulo: 'Manual Estrada 2', isbn: '', editorial: 'Estrada' },
        ]
    },
    {
        id: 3, nombre: '3er Grado',
        libros: [
            { id: 301, titulo: 'Ciencias Naturales 3', isbn: '', editorial: 'Aique' },
        ]
    },
];

const MOCK_ENCARGOS = [
    { id: 1, titulo: 'Matemática en Acción 1', cliente: 'Laura', telefono: '1122334455', sena: 5000, estado: 'faltante', fecha: '2024-02-01' },
    { id: 2, titulo: 'Manual Estrada 2', cliente: 'Pedro', telefono: '1199887766', sena: 0, estado: 'en_local', fecha: '2024-02-05' },
    { id: 3, titulo: 'Matemática en Acción 1', cliente: 'Carlos', telefono: '1155667788', sena: 2000, estado: 'faltante', fecha: '2024-02-10' },
];

const MOCK_STOCK = [
    { id: 1, titulo: 'Naturales 1', tipo: 'nuevo', cantidad: 3 },
    { id: 2, titulo: 'Manual Estrada 2', tipo: 'usado', cantidad: 1 },
];

export default function Encargos() {
    const [activeTab, setActiveTab] = useState('pedidos');
    const [grados, setGrados] = useState(MOCK_GRADOS);
    const [encargos, setEncargos] = useState(MOCK_ENCARGOS);
    const [stock, setStock] = useState(MOCK_STOCK);

    // Modal state for new order
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [selectedGrado, setSelectedGrado] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [orderClient, setOrderClient] = useState('');
    const [orderPhone, setOrderPhone] = useState('');
    const [orderDeposit, setOrderDeposit] = useState('0');

    // Toast/notification for auto-assignment
    const [notification, setNotification] = useState(null);

    const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    // Get all unique book titles from the catalog
    const allCatalogTitles = useMemo(() => {
        const titles = new Set();
        grados.forEach(g => g.libros.forEach(l => titles.add(l.titulo)));
        return [...titles].sort();
    }, [grados]);

    const handleWhatsApp = (phone, title) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const msg = encodeURIComponent(`¡Hola! Te aviso de la librería que ya llegó el libro que encargaste: "${title}". Podés pasar a retirarlo cuando quieras.`);
        window.open(`https://wa.me/549${cleanPhone}?text=${msg}`, '_blank');
    };

    const updateOrderStatus = (id, newStatus) => {
        setEncargos(encargos.map(b => b.id === id ? { ...b, estado: newStatus } : b));
    };

    const statusConfig = {
        faltante: { label: 'Falta pedir', style: 'bg-red-100 text-red-800 font-bold' },
        pedido: { label: 'Pedido (Espera)', style: 'bg-yellow-100 text-yellow-800 font-bold' },
        en_local: { label: 'En local (Avisar)', style: 'bg-blue-100 text-blue-800 font-bold border border-blue-200' },
        entregado: { label: 'Entregado', style: 'bg-gray-100 text-gray-600 font-medium' }
    };

    // ==========================================
    // NEW ORDER WITH GRADE SELECTOR
    // ==========================================
    const handleCreateOrders = () => {
        if (!orderClient || selectedBooks.length === 0) {
            alert('Completá el nombre del cliente y seleccioná al menos un libro.');
            return;
        }
        const newOrders = selectedBooks.map(titulo => ({
            id: Date.now() + Math.random(),
            titulo,
            cliente: orderClient,
            telefono: orderPhone,
            sena: parseFloat(orderDeposit) || 0,
            estado: 'faltante',
            fecha: new Date().toISOString().split('T')[0]
        }));
        setEncargos([...encargos, ...newOrders]);
        showNotification(`✅ Se crearon ${newOrders.length} encargo(s) para ${orderClient}`);
        // Reset
        setShowNewOrder(false);
        setSelectedGrado(null);
        setSelectedBooks([]);
        setOrderClient('');
        setOrderPhone('');
        setOrderDeposit('0');
    };

    const handleManualOrder = () => {
        const titulo = prompt("Título o ISBN del libro:");
        if (!titulo) return;
        const cliente = prompt("Nombre de quien encarga:");
        if (!cliente) return;
        const telefono = prompt("Teléfono (Para avisarle por WhatsApp):");
        const deposit = prompt("¿Dejó seña? (Ingresar monto, o 0 si no dejó):", "0");
        setEncargos([...encargos, {
            id: Date.now(), titulo, cliente, telefono: telefono || '', sena: parseFloat(deposit) || 0, estado: 'faltante', fecha: new Date().toISOString().split('T')[0]
        }]);
    };

    // ==========================================
    // STOCK INTAKE WITH AUTO-ASSIGNMENT
    // ==========================================
    const handleIngresoStock = () => {
        const titulo = prompt("Título del libro que llegó:");
        if (!titulo) return;
        const cantidadStr = prompt("¿Cuántas unidades llegaron?", "1");
        const cantidad = parseInt(cantidadStr);
        if (isNaN(cantidad) || cantidad <= 0) return;
        const tipo = prompt("¿Tipo? Escribí 'nuevo' o 'usado':", "nuevo").toLowerCase();
        if (tipo !== 'nuevo' && tipo !== 'usado') {
            alert("Tipo inválido. Usá 'nuevo' o 'usado'.");
            return;
        }

        let remaining = cantidad;
        let assigned = 0;
        const updatedEncargos = [...encargos];

        // Sort by date (oldest first), then auto-assign
        const pendingIndexes = updatedEncargos
            .map((e, i) => ({ ...e, _idx: i }))
            .filter(e => e.titulo.toLowerCase() === titulo.toLowerCase() && e.estado === 'faltante')
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (const pending of pendingIndexes) {
            if (remaining <= 0) break;
            updatedEncargos[pending._idx] = { ...updatedEncargos[pending._idx], estado: 'en_local' };
            remaining--;
            assigned++;
        }

        setEncargos(updatedEncargos);

        // Add remaining to stock
        if (remaining > 0) {
            const existingIdx = stock.findIndex(s => s.titulo.toLowerCase() === titulo.toLowerCase() && s.tipo === tipo);
            if (existingIdx >= 0) {
                const updatedStock = [...stock];
                updatedStock[existingIdx] = { ...updatedStock[existingIdx], cantidad: updatedStock[existingIdx].cantidad + remaining };
                setStock(updatedStock);
            } else {
                setStock([...stock, { id: Date.now(), titulo, tipo, cantidad: remaining }]);
            }
        }

        let msg = `📦 Ingresadas ${cantidad} unidades de "${titulo}" (${tipo}).`;
        if (assigned > 0) msg += `\n🔔 Se asignaron automáticamente ${assigned} a pedidos pendientes.`;
        if (remaining > 0) msg += `\n📚 ${remaining} quedaron en stock.`;
        showNotification(msg);
    };

    // ==========================================
    // TAB: PEDIDOS
    // ==========================================
    const PedidosTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    <button onClick={() => setShowNewOrder(true)} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                        <Plus size={20} /> Nuevo Encargo (por Grado)
                    </button>
                    <button onClick={handleManualOrder} className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium shadow-sm transition-all">
                        <Edit2 size={18} /> Encargo Manual
                    </button>
                </div>
            </div>

            {/* MODAL: New Order by Grade */}
            {showNewOrder && (
                <div className="mb-8 bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xl font-bold text-gray-800">Nuevo Encargo por Grado</h3>
                        <button onClick={() => setShowNewOrder(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Grade & Book Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Seleccionar Grado</label>
                            <select
                                value={selectedGrado || ''}
                                onChange={(e) => { setSelectedGrado(Number(e.target.value) || null); setSelectedBooks([]); }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                                <option value="">-- Elegir grado --</option>
                                {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                            </select>

                            {selectedGrado && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Libros disponibles:</p>
                                    {grados.find(g => g.id === selectedGrado)?.libros.map(libro => (
                                        <label key={libro.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedBooks.includes(libro.titulo) ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedBooks.includes(libro.titulo)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedBooks([...selectedBooks, libro.titulo]);
                                                    else setSelectedBooks(selectedBooks.filter(t => t !== libro.titulo));
                                                }}
                                                className="w-5 h-5 rounded text-blue-600"
                                            />
                                            <div>
                                                <span className="font-medium text-gray-800">{libro.titulo}</span>
                                                {libro.editorial && <span className="text-sm text-gray-500 ml-2">({libro.editorial})</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Client Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre del cliente *</label>
                                <input type="text" value={orderClient} onChange={e => setOrderClient(e.target.value)} placeholder="Ej. María (mamá de Juan)"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Teléfono (WhatsApp)</label>
                                <input type="text" value={orderPhone} onChange={e => setOrderPhone(e.target.value)} placeholder="1123456789"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Seña / Adelanto ($)</label>
                                <input type="number" value={orderDeposit} onChange={e => setOrderDeposit(e.target.value)} placeholder="0"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>

                            {selectedBooks.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <p className="text-sm font-bold text-blue-800 mb-2">Resumen ({selectedBooks.length} libros):</p>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        {selectedBooks.map((t, i) => <li key={i}>• {t}</li>)}
                                    </ul>
                                </div>
                            )}

                            <button onClick={handleCreateOrders}
                                disabled={!orderClient || selectedBooks.length === 0}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm">
                                Crear {selectedBooks.length} Encargo(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-5 font-semibold text-gray-600">Libro / Material</th>
                            <th className="p-5 font-semibold text-gray-600">Cliente y Teléfono</th>
                            <th className="p-5 font-semibold text-gray-600">Seña</th>
                            <th className="p-5 font-semibold text-gray-600">Estado</th>
                            <th className="p-5 font-semibold text-center text-gray-600">Avisar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {encargos.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-5">
                                    <p className="font-bold text-gray-800 text-lg">{order.titulo}</p>
                                    <p className="text-xs text-gray-400 mt-1">{order.fecha}</p>
                                </td>
                                <td className="p-5">
                                    <p className="font-bold text-gray-800">{order.cliente}</p>
                                    <p className="text-sm text-gray-500 font-mono mt-1 flex items-center gap-1">
                                        <MessageCircle size={12} /> {order.telefono}
                                    </p>
                                </td>
                                <td className="p-5">
                                    {order.sena > 0 ? (
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold">{formatMoney(order.sena)}</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-medium italic">Sin seña</span>
                                    )}
                                </td>
                                <td className="p-5">
                                    <select value={order.estado} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className={`text-sm rounded-xl px-4 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${statusConfig[order.estado].style}`}>
                                        {Object.keys(statusConfig).map(key => (
                                            <option key={key} value={key} className="bg-white text-gray-800 font-medium">{statusConfig[key].label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-5 text-center">
                                    {order.estado === 'en_local' ? (
                                        <button onClick={() => handleWhatsApp(order.telefono, order.titulo)}
                                            className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] shadow-sm transition-all font-bold text-sm">
                                            <MessageCircle size={18} /> Avisar
                                        </button>
                                    ) : (<span className="text-gray-300">-</span>)}
                                </td>
                            </tr>
                        ))}
                        {encargos.length === 0 && (
                            <tr><td colSpan="5" className="p-12 text-center text-gray-400 text-lg">No hay encargos registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ==========================================
    // TAB: CATÁLOGO POR GRADO
    // ==========================================
    const CatalogoTab = () => {
        const [expandedGrado, setExpandedGrado] = useState(null);

        const handleAddGrado = () => {
            const nombre = prompt("Nombre del nuevo grado (ej. '4to Grado', 'Sala de 5'):");
            if (!nombre) return;
            setGrados([...grados, { id: Date.now(), nombre, libros: [] }]);
        };

        const handleDeleteGrado = (id) => {
            if (!confirm('¿Eliminar este grado y todos sus libros?')) return;
            setGrados(grados.filter(g => g.id !== id));
        };

        const handleRenameGrado = (id) => {
            const grado = grados.find(g => g.id === id);
            const nombre = prompt("Nuevo nombre:", grado.nombre);
            if (!nombre) return;
            setGrados(grados.map(g => g.id === id ? { ...g, nombre } : g));
        };

        const handleAddLibro = (gradoId) => {
            const titulo = prompt("Título del libro:");
            if (!titulo) return;
            const editorial = prompt("Editorial (opcional):", "") || '';
            setGrados(grados.map(g => g.id === gradoId
                ? { ...g, libros: [...g.libros, { id: Date.now(), titulo, isbn: '', editorial }] }
                : g
            ));
        };

        const handleDeleteLibro = (gradoId, libroId) => {
            setGrados(grados.map(g => g.id === gradoId
                ? { ...g, libros: g.libros.filter(l => l.id !== libroId) }
                : g
            ));
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500">Configurá los libros que corresponden a cada grado. Se usan en el selector de "Nuevo Encargo".</p>
                    <button onClick={handleAddGrado} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                        <Plus size={20} /> Nuevo Grado
                    </button>
                </div>

                <div className="space-y-4">
                    {grados.map(grado => (
                        <div key={grado.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div
                                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedGrado(expandedGrado === grado.id ? null : grado.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedGrado === grado.id ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                    <h3 className="text-xl font-bold text-gray-800">{grado.nombre}</h3>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{grado.libros.length} libros</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleRenameGrado(grado.id); }}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Renombrar">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGrado(grado.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar grado">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {expandedGrado === grado.id && (
                                <div className="border-t bg-gray-50/50 p-5">
                                    <div className="space-y-2 mb-4">
                                        {grado.libros.map(libro => (
                                            <div key={libro.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border">
                                                <div>
                                                    <span className="font-medium text-gray-800">{libro.titulo}</span>
                                                    {libro.editorial && <span className="text-sm text-gray-500 ml-2">— {libro.editorial}</span>}
                                                </div>
                                                <button onClick={() => handleDeleteLibro(grado.id, libro.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {grado.libros.length === 0 && (
                                            <p className="text-gray-400 text-center py-4">No hay libros asignados a este grado.</p>
                                        )}
                                    </div>
                                    <button onClick={() => handleAddLibro(grado.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors text-sm">
                                        <Plus size={16} /> Agregar Libro
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {grados.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-lg">
                            No hay grados configurados. Creá uno para empezar.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB: STOCK DE LIBROS
    // ==========================================
    const StockTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">Libros disponibles en el local. Al ingresar stock, se asignan automáticamente a pedidos pendientes.</p>
                <button onClick={handleIngresoStock} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all">
                    <Package size={20} /> Ingresar Libros
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-5 font-semibold text-gray-600">Título</th>
                            <th className="p-5 font-semibold text-gray-600">Tipo</th>
                            <th className="p-5 font-semibold text-gray-600 text-center">Cantidad</th>
                            <th className="p-5 font-semibold text-gray-600 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stock.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-5 font-bold text-gray-800 text-lg">{item.titulo}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.tipo === 'nuevo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {item.tipo === 'nuevo' ? '📗 Nuevo' : '📙 Usado'}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="text-2xl font-black text-gray-800">{item.cantidad}</span>
                                </td>
                                <td className="p-5 text-center">
                                    <button onClick={() => {
                                        if (item.cantidad <= 1) {
                                            setStock(stock.filter(s => s.id !== item.id));
                                        } else {
                                            setStock(stock.map(s => s.id === item.id ? { ...s, cantidad: s.cantidad - 1 } : s));
                                        }
                                    }}
                                        className="text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors">
                                        -1 Unidad
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {stock.length === 0 && (
                            <tr><td colSpan="4" className="p-12 text-center text-gray-400 text-lg">No hay libros en stock.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ==========================================
    // MAIN RENDER
    // ==========================================
    const tabs = [
        { key: 'pedidos', label: 'Pedidos', icon: BookOpen },
        { key: 'catalogo', label: 'Catálogo por Grado', icon: Settings },
        { key: 'stock', label: 'Stock de Libros', icon: Package },
    ];

    return (
        <div className="p-8">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-6 right-6 z-50 bg-white border-2 border-green-300 shadow-2xl rounded-2xl px-6 py-4 max-w-md animate-bounce">
                    <p className="text-gray-800 font-medium whitespace-pre-line">{notification}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Encargos Escolares</h2>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm
              ${activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'pedidos' && <PedidosTab />}
            {activeTab === 'catalogo' && <CatalogoTab />}
            {activeTab === 'stock' && <StockTab />}
        </div>
    );
}
