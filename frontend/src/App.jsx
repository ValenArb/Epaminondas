import React, { useState } from 'react';
import {
  Search, Plus, Book, FileText, Users, Calculator,
  Settings, MessageCircle, Check, Clock, Package, Edit2, ArrowLeft, BookOpen
} from 'lucide-react';

// --- BASE DE DATOS INICIAL (MOCK DATA) ---
const initialCategories = [
  { id: 1, name: 'Librería Escolar', margin: 45 },
  { id: 2, name: 'Golosinas', margin: 30 },
  { id: 3, name: 'Regalería', margin: 60 },
  { id: 4, name: 'Fotocopias', margin: 100 },
];

const initialProducts = [
  { id: 1, isbn: '978987456123', description: 'Cuaderno Rivadavia Tapa Dura 50h', baseCost: 1500, categoryId: 1 },
  { id: 2, isbn: '779123456789', description: 'Lapicera Bic Azul', baseCost: 200, categoryId: 1 },
  { id: 3, isbn: '779987654321', description: 'Alfajor Jorgito Chocolate', baseCost: 350, categoryId: 2 },
  { id: 4, isbn: '978111222333', description: 'Taza de Cerámica Día de la Madre', baseCost: 4000, categoryId: 3 },
];

const initialClients = [
  {
    id: 1, name: 'María (Mamá de Juan)', phone: '1123456789', balance: 1200,
    transactions: [{ id: 1, date: '2023-10-24', description: '2 cartulinas y plasticola', amount: 1200, type: 'cargo' }]
  },
  {
    id: 2, name: 'Prof. Carlos (Geografía)', phone: '1198765432', balance: -500,
    transactions: [
      { id: 1, date: '2023-10-20', description: 'Resmas', amount: 5000, type: 'cargo' },
      { id: 2, date: '2023-10-22', description: 'Abono en efectivo', amount: 5500, type: 'pago' }
    ]
  },
];

const initialPhotocopies = [
  { id: 1, requester: 'Prof. Gómez', material: 'Módulo Historia 3er Año (20 copias)', status: 'pendiente' },
  { id: 2, requester: 'Martina (Alumna)', material: 'Apunte Biología', status: 'listo' },
  { id: 3, requester: 'Colegio San José', material: 'Exámenes de Matemática', status: 'entregado' }
];

const initialBookOrders = [
  { id: 1, title: 'Matemática en Acción 5', customer: 'Laura', phone: '1122334455', deposit: 5000, status: 'faltante' },
  { id: 2, title: 'Manual Estrada 4', customer: 'Pedro', phone: '1199887766', deposit: 0, status: 'en_local' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('precios');

  // Estados Globales (Base de Datos en Memoria)
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [clients, setClients] = useState(initialClients);
  const [photocopies, setPhotocopies] = useState(initialPhotocopies);
  const [bookOrders, setBookOrders] = useState(initialBookOrders);

  // Utilidad para formatear moneda
  const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  // ==========================================
  // MÓDULO A: PRECIOS Y BUSCADOR
  // ==========================================
  const PricesView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Motor de búsqueda: Case-insensitive, busca en ISBN y Descripción
    const filteredProducts = products.filter(p =>
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.isbn.includes(searchTerm)
    );

    // Lógica del Precio Final: Costo + Margen (Redondeado hacia arriba para evitar centavos)
    const getFinalPrice = (product) => {
      const category = categories.find(c => c.id === product.categoryId);
      const margin = category ? category.margin : 0;
      const finalPrice = product.baseCost * (1 + margin / 100);
      return Math.ceil(finalPrice); // Redondeo comercial
    };

    const handleUpdateCost = (id) => {
      const newCost = prompt("Ingresá el nuevo costo base (sin el % de ganancia):");
      if (newCost && !isNaN(newCost)) {
        setProducts(products.map(p => p.id === id ? { ...p, baseCost: parseFloat(newCost) } : p));
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

        {/* Panel de Categorías (Oculto por defecto) */}
        {showCategoryModal && (
          <div className="mb-8 p-5 bg-white rounded-xl shadow-md border-l-4 border-purple-500">
            <h3 className="font-bold mb-4 text-purple-800 text-lg">Porcentajes de Ganancia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-purple-600">{cat.margin}%</span>
                    <button
                      onClick={() => {
                        const newMargin = prompt(`Nuevo porcentaje para ${cat.name}:`, cat.margin);
                        if (newMargin && !isNaN(newMargin)) {
                          setCategories(categories.map(c => c.id === cat.id ? { ...c, margin: parseFloat(newMargin) } : c));
                        }
                      }}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                      title="Editar Porcentaje"
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

        {/* Barra de Búsqueda Principal */}
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
              {filteredProducts.map(product => {
                const cat = categories.find(c => c.id === product.categoryId);
                return (
                  <tr key={product.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-5 text-gray-500 font-mono text-sm">{product.isbn}</td>
                    <td className="p-5 font-medium text-gray-800 text-lg">{product.description}</td>
                    <td className="p-5 text-sm text-gray-500">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{cat ? cat.name : 'N/A'}</span>
                    </td>
                    <td className="p-5 text-right font-bold text-2xl text-green-600">
                      {formatMoney(getFinalPrice(product))}
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
                );
              })}
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
  };

  // ==========================================
  // MÓDULO B: FIADOS (CUENTAS CORRIENTES)
  // ==========================================
  const FiadosView = () => {
    const [selectedClient, setSelectedClient] = useState(null);

    const handleAddTransaction = (type) => {
      let desc = 'Abono en efectivo';
      if (type === 'cargo') {
        desc = prompt('¿Qué se llevó el cliente? (Detalle corto):');
        if (!desc) return;
      }

      const amountStr = prompt(type === 'cargo' ? 'Monto total a sumar al fiado:' : 'Monto que entregó (abono):');
      if (!amountStr || isNaN(amountStr)) {
        if (amountStr) alert("Monto inválido. Ingrese solo números.");
        return;
      }

      const amount = parseFloat(amountStr);
      const newTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString('es-AR'),
        description: desc,
        amount: amount,
        type: type
      };

      const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
          // Lógica Matemática: Si es cargo Sube la deuda, si es pago Baja la deuda.
          const newBalance = type === 'cargo' ? c.balance + amount : c.balance - amount;
          return { ...c, balance: newBalance, transactions: [newTransaction, ...c.transactions] };
        }
        return c;
      });

      setClients(updatedClients);
      setSelectedClient(updatedClients.find(c => c.id === selectedClient.id));
    };

    // PANTALLA 2: Perfil del Cliente
    if (selectedClient) {
      const isDebit = selectedClient.balance > 0;

      return (
        <div className="p-8">
          <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft size={20} /> Volver al Directorio
          </button>

          <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedClient.name}</h2>
              <p className="text-gray-500 text-lg flex items-center gap-2">
                <Users size={18} /> {selectedClient.phone}
              </p>
            </div>
            <div className="text-right bg-gray-50 px-8 py-4 rounded-xl border">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">
                {isDebit ? 'DEUDA TOTAL' : 'SALDO A FAVOR'}
              </p>
              <p className={`text-5xl font-bold ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                {formatMoney(Math.abs(selectedClient.balance))}
              </p>
            </div>
          </div>

          <div className="flex gap-6 mb-10">
            <button
              onClick={() => handleAddTransaction('cargo')}
              className="flex-1 bg-red-50 text-red-600 border border-red-200 py-6 rounded-2xl font-bold text-xl hover:bg-red-100 hover:shadow-md transition-all flex justify-center items-center gap-3"
            >
              <Plus size={28} /> Anotar Fiado (Se llevó)
            </button>
            <button
              onClick={() => handleAddTransaction('pago')}
              className="flex-1 bg-green-50 text-green-600 border border-green-200 py-6 rounded-2xl font-bold text-xl hover:bg-green-100 hover:shadow-md transition-all flex justify-center items-center gap-3"
            >
              <Calculator size={28} /> Registrar Pago (Abonó)
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-700 mb-4 px-2">Historial de Movimientos</h3>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5 font-semibold text-gray-600">Fecha</th>
                  <th className="p-5 font-semibold text-gray-600">Detalle</th>
                  <th className="p-5 font-semibold text-right text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedClient.transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="p-5 font-medium text-gray-800">{t.description}</td>
                    <td className={`p-5 text-right font-bold text-lg ${t.type === 'cargo' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'cargo' ? '+ ' : '- '}{formatMoney(t.amount)}
                    </td>
                  </tr>
                ))}
                {selectedClient.transactions.length === 0 && (
                  <tr><td colSpan="3" className="p-10 text-center text-gray-400">Sin historial de movimientos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // PANTALLA 1: Directorio
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Libreta de Fiados</h2>
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
            <Plus size={20} /> Nuevo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map(client => {
            const isDebit = client.balance > 0;
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{client.name}</h3>
                  </div>
                  <p className="text-gray-500 mb-6 flex items-center gap-2 text-sm">
                    <Users size={14} /> {client.phone}
                  </p>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500 font-medium uppercase">{isDebit ? 'Deuda' : 'A favor'}</span>
                  <span className={`text-2xl font-black tracking-tight ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                    {formatMoney(Math.abs(client.balance))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // MÓDULO C: FOTOCOPIAS (TABLERO KANBAN)
  // ==========================================
  const PhotocopiesView = () => {
    // Máquina de Estados
    const updateStatus = (id, newStatus) => {
      setPhotocopies(photocopies.map(p => p.id === id ? { ...p, status: newStatus } : p));
    };

    const handleNew = () => {
      const requester = prompt("¿Quién solicita/retira el trabajo?");
      if (!requester) return;
      const material = prompt("Descripción del material (Ej. Módulo 3er Año):");
      if (!material) return;
      setPhotocopies([...photocopies, { id: Date.now(), requester, material, status: 'pendiente' }]);
    };

    const Column = ({ title, status, icon: Icon, colorClass, bgClass }) => {
      const tasks = photocopies.filter(p => p.status === status);
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
              <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <p className="font-bold text-gray-800 text-lg mb-2 leading-tight">{job.material}</p>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-4">
                  <Users size={14} /> Para: {job.requester}
                </p>

                <div className="pt-3 border-t border-gray-50">
                  {status === 'pendiente' && (
                    <button
                      onClick={() => updateStatus(job.id, 'listo')}
                      className="w-full bg-blue-50 text-blue-700 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                    >
                      ¡Terminado! (Pasar a mostrador)
                    </button>
                  )}
                  {status === 'listo' && (
                    <button
                      onClick={() => updateStatus(job.id, 'entregado')}
                      className="w-full bg-green-50 text-green-700 py-2.5 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                    >
                      Marcar como Entregado
                    </button>
                  )}
                  {status === 'entregado' && (
                    <div className="w-full flex justify-between items-center text-gray-400 text-sm py-1 font-medium">
                      <span>✓ Trabajo Finalizado</span>
                      <button
                        onClick={() => setPhotocopies(photocopies.filter(p => p.id !== job.id))}
                        className="hover:text-red-500 px-2"
                        title="Archivar/Eliminar"
                      >
                        Archivar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-medium">
                No hay trabajos aquí
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Tablero de Fotocopias</h2>
          <button onClick={handleNew} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
            <Plus size={20} /> Nuevo Trabajo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          <Column title="Pendientes de Hacer" status="pendiente" icon={Clock} colorClass="border-orange-400" bgClass="bg-orange-50/50" />
          <Column title="Listos (En mostrador)" status="listo" icon={Package} colorClass="border-blue-400" bgClass="bg-blue-50/50" />
          <Column title="Entregados" status="entregado" icon={Check} colorClass="border-green-400" bgClass="bg-green-50/50" />
        </div>
      </div>
    );
  };

  // ==========================================
  // MÓDULO D: ENCARGOS DE LIBROS
  // ==========================================
  const BooksView = () => {
    // Generador dinámico de URL para WhatsApp
    const handleWhatsApp = (phone, title) => {
      // Limpia el número (elimina espacios y guiones)
      const cleanPhone = phone.replace(/\D/g, '');
      const msg = encodeURIComponent(`¡Hola! Te aviso de la librería que ya llegó el libro que encargaste: "${title}". Podés pasar a retirarlo cuando quieras.`);
      window.open(`https://wa.me/549${cleanPhone}?text=${msg}`, '_blank');
    };

    const updateOrderStatus = (id, newStatus) => {
      setBookOrders(bookOrders.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    const statusConfig = {
      faltante: { label: 'Falta pedir', style: 'bg-red-100 text-red-800 font-bold' },
      pedido: { label: 'Pedido (Espera)', style: 'bg-yellow-100 text-yellow-800 font-bold' },
      en_local: { label: 'En local (Avisar)', style: 'bg-blue-100 text-blue-800 font-bold border border-blue-200' },
      entregado: { label: 'Entregado', style: 'bg-gray-100 text-gray-600 font-medium' }
    };

    const handleNewOrder = () => {
      const title = prompt("Título o ISBN del libro:");
      if (!title) return;
      const customer = prompt("Nombre de quien encarga:");
      if (!customer) return;
      const phone = prompt("Teléfono (Para avisarle por WhatsApp):");
      const deposit = prompt("¿Dejó seña? (Ingresar monto, o 0 si no dejó):", "0");

      setBookOrders([...bookOrders, {
        id: Date.now(), title, customer, phone: phone || '', deposit: parseFloat(deposit) || 0, status: 'faltante'
      }]);
    };

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Encargos Escolares</h2>
          <button onClick={handleNewOrder} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
            <Plus size={20} /> Nuevo Encargo
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-5 font-semibold text-gray-600">Libro / Material</th>
                <th className="p-5 font-semibold text-gray-600">Cliente y Teléfono</th>
                <th className="p-5 font-semibold text-gray-600">Seña / Adelanto</th>
                <th className="p-5 font-semibold text-gray-600">Estado del Pedido</th>
                <th className="p-5 font-semibold text-center text-gray-600">Avisar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 font-bold text-gray-800 text-lg">{order.title}</td>
                  <td className="p-5">
                    <p className="font-bold text-gray-800">{order.customer}</p>
                    <p className="text-sm text-gray-500 font-mono mt-1 flex items-center gap-1">
                      <MessageCircle size={12} /> {order.phone}
                    </p>
                  </td>
                  <td className="p-5">
                    {order.deposit > 0 ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold">
                        {formatMoney(order.deposit)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium italic">Sin seña</span>
                    )}
                  </td>
                  <td className="p-5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-sm rounded-xl px-4 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${statusConfig[order.status].style}`}
                    >
                      {Object.keys(statusConfig).map(key => (
                        <option key={key} value={key} className="bg-white text-gray-800 font-medium">{statusConfig[key].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-5 text-center">
                    {/* Renderizado Condicional del Botón Mágico */}
                    {order.status === 'en_local' ? (
                      <button
                        onClick={() => handleWhatsApp(order.phone, order.title)}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] shadow-sm transition-all font-bold text-sm"
                      >
                        <MessageCircle size={18} /> Avisar
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================
  // NAVEGACIÓN Y LAYOUT PRINCIPAL
  // ==========================================
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-blue-200">

      {/* Sidebar: Menú de Navegación (20%) */}
      <div className="w-72 bg-[#0F172A] text-white flex flex-col shadow-xl z-10">
        <div className="p-8 border-b border-gray-800/50">
          <h1 className="text-2xl font-black flex items-center gap-3 tracking-tight">
            <BookOpen className="text-blue-500" size={32} /> Mi Librería
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('precios')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeTab === 'precios' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Search size={22} /> Precios
          </button>

          <button
            onClick={() => setActiveTab('fiados')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeTab === 'fiados' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={22} /> Libreta (Fiados)
          </button>

          <button
            onClick={() => setActiveTab('fotocopias')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeTab === 'fotocopias' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText size={22} /> Fotocopias
          </button>

          <button
            onClick={() => setActiveTab('libros')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
              ${activeTab === 'libros' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Book size={22} /> Encargos Libros
          </button>
        </nav>

        <div className="p-6 text-slate-500 text-sm font-medium border-t border-gray-800/50">
          Sistema de Gestión MVP
        </div>
      </div>

      {/* Área de Trabajo Principal (80%) */}
      <div className="flex-1 overflow-auto bg-[#F8FAFC]">
        {activeTab === 'precios' && <PricesView />}
        {activeTab === 'fiados' && <FiadosView />}
        {activeTab === 'fotocopias' && <PhotocopiesView />}
        {activeTab === 'libros' && <BooksView />}
      </div>

    </div>
  );
}
