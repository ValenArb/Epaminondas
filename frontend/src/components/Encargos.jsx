import { useState } from 'react';

const MOCK_ENCARGOS = [
    { id: 1, titulo_isbn: 'El Principito - Edición Especial', nombre_cliente: 'Ana Martínez', telefono: '5491123456789', monto_senia: 2000, estado_pedido: 'pendiente' },
    { id: 2, titulo_isbn: 'Fahrenheit 451', nombre_cliente: 'Pedro Sánchez', telefono: '5491198765432', monto_senia: 0, estado_pedido: 'en_local' },
];

export default function Encargos() {
    const [encargos, setEncargos] = useState(MOCK_ENCARGOS);

    const cambiarEstado = (id, nuevoEstado) => {
        setEncargos(prev => prev.map(e => e.id === id ? { ...e, estado_pedido: nuevoEstado } : e));
    };

    const getWhatsAppLink = (encargo) => {
        const numeroLimpio = encargo.telefono.replace(/\D/g, '');
        const mensaje = encodeURIComponent(`¡Hola ${encargo.nombre_cliente}! Te aviso de la librería que ya llegó el libro que encargaste: ${encargo.titulo_isbn}.`);
        return `https://wa.me/${numeroLimpio}?text=${mensaje}`;
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Encargos de Libros</h2>
                <button className="btn-primary">+ Nuevo Encargo</button>
            </div>

            <div className="glass-card">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Libro</th>
                            <th>Cliente</th>
                            <th>Seña</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {encargos.map(encargo => (
                            <tr key={encargo.id}>
                                <td style={{ fontWeight: 500 }}>{encargo.titulo_isbn}</td>
                                <td>
                                    <div>{encargo.nombre_cliente}</div>
                                    <small style={{ color: 'var(--text-secondary)' }}>{encargo.telefono}</small>
                                </td>
                                <td style={{ color: encargo.monto_senia > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                    ${encargo.monto_senia}
                                </td>
                                <td>
                                    <select
                                        className="input-base"
                                        style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                                        value={encargo.estado_pedido}
                                        onChange={(e) => cambiarEstado(encargo.id, e.target.value)}
                                    >
                                        <option value="pendiente">Pendiente (Buscando)</option>
                                        <option value="en_local">En Local (Avisar)</option>
                                        <option value="entregado">Entregado</option>
                                    </select>
                                </td>
                                <td>
                                    {encargo.estado_pedido === 'en_local' && encargo.telefono ? (
                                        <a
                                            href={getWhatsAppLink(encargo)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="badge badge-success"
                                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white' }}
                                        >
                                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                            </svg>
                                            Avisar por WhatsApp
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
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
