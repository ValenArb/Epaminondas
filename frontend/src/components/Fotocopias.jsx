import { useState } from 'react';

// Mock data
const MOCK_TRABAJOS = [
    { id: 1, solicitante: 'Escuela Nro 5', descripcion_material: '50 copias Examen Matemática', telefono: '5491112345678', estado_actual: 'pendiente' },
    { id: 2, solicitante: 'María profe', descripcion_material: 'Apuntes Historia 3er Año', telefono: '', estado_actual: 'listo' },
    { id: 3, solicitante: 'Juan (Facu)', descripcion_material: 'Resumen Biología', telefono: '5491187654321', estado_actual: 'entregado' },
];

export default function Fotocopias() {
    const [trabajos, setTrabajos] = useState(MOCK_TRABAJOS);

    const moveTrabajo = (id, nuevoEstado) => {
        setTrabajos(prev => prev.map(t => t.id === id ? { ...t, estado_actual: nuevoEstado } : t));
    };

    const columnas = [
        { id: 'pendiente', titulo: 'Pendiente de Hacer', color: 'var(--warning)', bg: 'var(--warning-bg)' },
        { id: 'listo', titulo: 'Listo / Esperando', color: 'var(--accent-primary)', bg: 'rgba(59, 130, 246, 0.1)' },
        { id: 'entregado', titulo: 'Entregados', color: 'var(--success)', bg: 'var(--success-bg)' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Tablero de Fotocopias</h2>
                <button className="btn-primary">+ Nuevo Trabajo</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', minHeight: '600px' }}>
                {columnas.map(col => (
                    <div key={col.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(30,41,59,0.5)' }}>
                        <h3 style={{ borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            {col.titulo} ({trabajos.filter(t => t.estado_actual === col.id).length})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            {trabajos.filter(t => t.estado_actual === col.id).map(trabajo => (
                                <div key={trabajo.id} className="glass-card" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderLeft: `4px solid ${col.color}` }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{trabajo.solicitante}</h4>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{trabajo.descripcion_material}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                        {col.id !== 'pendiente' ? (
                                            <button onClick={() => moveTrabajo(trabajo.id, 'pendiente')} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>← Pendiente</button>
                                        ) : <span />}

                                        {col.id === 'pendiente' && (
                                            <button onClick={() => moveTrabajo(trabajo.id, 'listo')} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Marcar Listo →</button>
                                        )}

                                        {col.id === 'listo' && (
                                            <button onClick={() => moveTrabajo(trabajo.id, 'entregado')} style={{ color: 'var(--success)', fontWeight: 600 }}>Entregar →</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
