import { useState } from 'react';

// Mock data
const MOCK_CLIENTES = [
    { id: 1, nombre: 'Juan Pérez', telefono: '5491123456789', saldo_total: 1500 }, // debe 1500
    { id: 2, nombre: 'María Gómez', telefono: '5491198765432', saldo_total: -500 }, // le sobran 500
    { id: 3, nombre: 'Carlos López', telefono: '', saldo_total: 0 },
];

const MOCK_TRANSACCIONES = {
    1: [
        { id: 101, fecha: '2023-10-25', detalle: 'Cuaderno y biromes', tipo_operacion: 'cargo', monto: 2000 },
        { id: 102, fecha: '2023-10-26', detalle: 'Pago a cuenta', tipo_operacion: 'abono', monto: 500 },
    ],
    2: [
        { id: 103, fecha: '2023-10-20', detalle: 'Fotocopias', tipo_operacion: 'cargo', monto: 500 },
        { id: 104, fecha: '2023-10-21', detalle: 'Pago adelantado', tipo_operacion: 'abono', monto: 1000 },
    ]
};

export default function Libreta() {
    const [clientes, setClientes] = useState(MOCK_CLIENTES);
    const [transacciones, setTransacciones] = useState(MOCK_TRANSACCIONES);
    const [selectedCliente, setSelectedCliente] = useState(null);

    // Form para transacciones
    const [montoForm, setMontoForm] = useState('');
    const [detalleForm, setDetalleForm] = useState('');

    const handleTransaction = (tipo) => {
        const monto = parseFloat(montoForm);
        if (isNaN(monto) || monto <= 0 || !detalleForm) return alert('Ingrese monto y detalle válidos');

        // Update local state for mock UI
        const nuevaTx = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            detalle: detalleForm,
            tipo_operacion: tipo,
            monto: monto
        };

        setTransacciones(prev => ({
            ...prev,
            [selectedCliente.id]: [nuevaTx, ...(prev[selectedCliente.id] || [])]
        }));

        setClientes(prev => prev.map(c => {
            if (c.id === selectedCliente.id) {
                const nuevoSaldo = tipo === 'cargo' ? c.saldo_total + monto : c.saldo_total - monto;
                setSelectedCliente({ ...c, saldo_total: nuevoSaldo });
                return { ...c, saldo_total: nuevoSaldo };
            }
            return c;
        }));

        setMontoForm('');
        setDetalleForm('');
    };

    if (selectedCliente) {
        const isDebt = selectedCliente.saldo_total > 0;
        const isCredit = selectedCliente.saldo_total < 0;

        return (
            <div className="animate-fade-in glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => setSelectedCliente(null)} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: 600 }}>
                    ← Volver al Directorio
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0 }}>{selectedCliente.nombre}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{selectedCliente.telefono || 'Sin teléfono'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Saldo Actual</p>
                        <h3 style={{
                            fontSize: '2.5rem',
                            margin: 0,
                            color: isDebt ? 'var(--danger)' : isCredit ? 'var(--success)' : 'var(--text-primary)'
                        }}>
                            {isCredit ? '-' : ''}${Math.abs(selectedCliente.saldo_total).toLocaleString('es-AR')}
                        </h3>
                        <span className={`badge ${isDebt ? 'badge-danger' : isCredit ? 'badge-success' : ''}`}>
                            {isDebt ? 'Debe' : isCredit ? 'A Favor' : 'Al Día'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3>Nueva Transacción</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                className="input-base"
                                placeholder="Detalle (ej. Fotocopias)"
                                value={detalleForm}
                                onChange={e => setDetalleForm(e.target.value)}
                            />
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                                <input
                                    type="number"
                                    className="input-base"
                                    placeholder="Monto"
                                    style={{ paddingLeft: '2rem' }}
                                    value={montoForm}
                                    onChange={e => setMontoForm(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleTransaction('cargo')}
                                    style={{ flex: 1, padding: '1.5rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '1.2rem', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    DEJA A DEBER (+)
                                </button>
                                <button
                                    onClick={() => handleTransaction('abono')}
                                    style={{ flex: 1, padding: '1.5rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '1.2rem', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    PAGA DEUDA (-)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3>Historial ({transacciones[selectedCliente.id]?.length || 0})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {(transacciones[selectedCliente.id] || []).map(tx => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{tx.detalle}</p>
                                        <small style={{ color: 'var(--text-secondary)' }}>{tx.fecha}</small>
                                    </div>
                                    <div style={{ fontWeight: 600, color: tx.tipo_operacion === 'cargo' ? 'var(--danger)' : 'var(--success)' }}>
                                        {tx.tipo_operacion === 'cargo' ? '+' : '-'}${tx.monto}
                                    </div>
                                </div>
                            ))}
                            {(!transacciones[selectedCliente.id] || transacciones[selectedCliente.id].length === 0) && (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No hay transacciones</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Directorio de Clientes (Fiados)</h2>
                <button className="btn-primary">+ Nuevo Cliente</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {clientes.map(c => {
                    const isDebt = c.saldo_total > 0;
                    const isCredit = c.saldo_total < 0;
                    return (
                        <div
                            key={c.id}
                            className="glass-card"
                            style={{ cursor: 'pointer', borderTop: `4px solid ${isDebt ? 'var(--danger)' : isCredit ? 'var(--success)' : 'transparent'}` }}
                            onClick={() => setSelectedCliente(c)}
                        >
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{c.nombre}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{c.telefono || 'Sin contacto'}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span className={`badge ${isDebt ? 'badge-danger' : isCredit ? 'badge-success' : ''}`}>
                                    {isDebt ? 'Debe' : isCredit ? 'Saldo a favor' : 'Al día'}
                                </span>
                                <span style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: isDebt ? 'var(--danger)' : isCredit ? 'var(--success)' : 'var(--text-primary)'
                                }}>
                                    ${Math.abs(c.saldo_total).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
