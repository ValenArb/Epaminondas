import { useState } from 'react';
import { Users, Plus, Package, Clock, Check } from 'lucide-react';

const MOCK_FOTOCOPIAS = [
    { id: 1, solicitante: 'Prof. Gómez', material: 'Módulo Historia 3er Año (20 copias)', estado: 'pendiente' },
    { id: 2, solicitante: 'Martina (Alumna)', material: 'Apunte Biología', estado: 'listo' },
    { id: 3, solicitante: 'Colegio San José', material: 'Exámenes de Matemática', estado: 'entregado' }
];

export default function Fotocopias() {
    const [fotocopias, setFotocopias] = useState(MOCK_FOTOCOPIAS);

    const updateStatus = (id, newStatus) => {
        setFotocopias(fotocopias.map(p => p.id === id ? { ...p, estado: newStatus } : p));
    };

    const handleNew = () => {
        const solicitante = prompt("¿Quién solicita/retira el trabajo?");
        if (!solicitante) return;
        const material = prompt("Descripción del material (Ej. Módulo 3er Año):");
        if (!material) return;
        setFotocopias([...fotocopias, { id: Date.now(), solicitante, material, estado: 'pendiente' }]);
    };

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
                        <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="font-bold text-gray-800 text-lg mb-2 leading-tight">{job.material}</p>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-4">
                                <Users size={14} /> Para: {job.solicitante}
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
                                            onClick={() => setFotocopias(fotocopias.filter(p => p.id !== job.id))}
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
}
