import { useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';

const MOCK_ENCARGOS = [
    { id: 1, titulo: 'Matemática en Acción 5', cliente: 'Laura', telefono: '1122334455', sena: 5000, estado: 'faltante' },
    { id: 2, titulo: 'Manual Estrada 4', cliente: 'Pedro', telefono: '1199887766', sena: 0, estado: 'en_local' },
];

export default function Encargos() {
    const [encargos, setEncargos] = useState(MOCK_ENCARGOS);

    const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

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

    const handleNewOrder = () => {
        const titulo = prompt("Título o ISBN del libro:");
        if (!titulo) return;
        const cliente = prompt("Nombre de quien encarga:");
        if (!cliente) return;
        const telefono = prompt("Teléfono (Para avisarle por WhatsApp):");
        const deposit = prompt("¿Dejó seña? (Ingresar monto, o 0 si no dejó):", "0");

        setEncargos([...encargos, {
            id: Date.now(), titulo, cliente, telefono: telefono || '', sena: parseFloat(deposit) || 0, estado: 'faltante'
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
                        {encargos.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-5 font-bold text-gray-800 text-lg">{order.titulo}</td>
                                <td className="p-5">
                                    <p className="font-bold text-gray-800">{order.cliente}</p>
                                    <p className="text-sm text-gray-500 font-mono mt-1 flex items-center gap-1">
                                        <MessageCircle size={12} /> {order.telefono}
                                    </p>
                                </td>
                                <td className="p-5">
                                    {order.sena > 0 ? (
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold">
                                            {formatMoney(order.sena)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-medium italic">Sin seña</span>
                                    )}
                                </td>
                                <td className="p-5">
                                    <select
                                        value={order.estado}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className={`text-sm rounded-xl px-4 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${statusConfig[order.estado].style}`}
                                    >
                                        {Object.keys(statusConfig).map(key => (
                                            <option key={key} value={key} className="bg-white text-gray-800 font-medium">{statusConfig[key].label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-5 text-center">
                                    {order.estado === 'en_local' ? (
                                        <button
                                            onClick={() => handleWhatsApp(order.telefono, order.titulo)}
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
}
