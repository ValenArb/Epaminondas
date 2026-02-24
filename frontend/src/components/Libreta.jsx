import { useState } from 'react';
import { Users, Plus, Calculator, ArrowLeft } from 'lucide-react';

const MOCK_CLIENTES = [
    {
        id: 1, nombre: 'María (Mamá de Juan)', telefono: '1123456789', saldo_total: 1200,
        transacciones: [{ id: 1, fecha: '2023-10-24', descripcion: '2 cartulinas y plasticola', monto: 1200, tipo: 'cargo' }]
    },
    {
        id: 2, nombre: 'Prof. Carlos (Geografía)', telefono: '1198765432', saldo_total: -500,
        transacciones: [
            { id: 1, fecha: '2023-10-20', descripcion: 'Resmas', monto: 5000, tipo: 'cargo' },
            { id: 2, fecha: '2023-10-22', descripcion: 'Abono en efectivo', monto: 5500, tipo: 'pago' }
        ]
    },
];

export default function Libreta() {
    const [clientes, setClientes] = useState(MOCK_CLIENTES);
    const [selectedClient, setSelectedClient] = useState(null);

    const formatMoney = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

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
            fecha: new Date().toLocaleDateString('es-AR'),
            descripcion: desc,
            monto: amount,
            tipo: type
        };

        const updatedClients = clientes.map(c => {
            if (c.id === selectedClient.id) {
                const newBalance = type === 'cargo' ? c.saldo_total + amount : c.saldo_total - amount;
                return { ...c, saldo_total: newBalance, transacciones: [newTransaction, ...c.transacciones] };
            }
            return c;
        });

        setClientes(updatedClients);
        setSelectedClient(updatedClients.find(c => c.id === selectedClient.id));
    };

    if (selectedClient) {
        const isDebit = selectedClient.saldo_total > 0;

        return (
            <div className="p-8">
                <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition-colors font-medium">
                    <ArrowLeft size={20} /> Volver al Directorio
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedClient.nombre}</h2>
                        <p className="text-gray-500 text-lg flex items-center gap-2">
                            <Users size={18} /> {selectedClient.telefono}
                        </p>
                    </div>
                    <div className="text-right bg-gray-50 px-8 py-4 rounded-xl border">
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">
                            {isDebit ? 'DEUDA TOTAL' : 'SALDO A FAVOR'}
                        </p>
                        <p className={`text-5xl font-bold ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                            {formatMoney(Math.abs(selectedClient.saldo_total))}
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
                            {selectedClient.transacciones.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5 text-gray-500 whitespace-nowrap">{t.fecha}</td>
                                    <td className="p-5 font-medium text-gray-800">{t.descripcion}</td>
                                    <td className={`p-5 text-right font-bold text-lg ${t.tipo === 'cargo' ? 'text-red-500' : 'text-green-500'}`}>
                                        {t.tipo === 'cargo' ? '+ ' : '- '}{formatMoney(t.monto)}
                                    </td>
                                </tr>
                            ))}
                            {selectedClient.transacciones.length === 0 && (
                                <tr><td colSpan="3" className="p-10 text-center text-gray-400">Sin historial de movimientos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Libreta de Fiados</h2>
                <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-all">
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clientes.map(client => {
                    const isDebit = client.saldo_total > 0;
                    return (
                        <div
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{client.nombre}</h3>
                                </div>
                                <p className="text-gray-500 mb-6 flex items-center gap-2 text-sm">
                                    <Users size={14} /> {client.telefono}
                                </p>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500 font-medium uppercase">{isDebit ? 'Deuda' : 'A favor'}</span>
                                <span className={`text-2xl font-black tracking-tight ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatMoney(Math.abs(client.saldo_total))}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
