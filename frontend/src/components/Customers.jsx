import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, DollarSign, History, Phone, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const CustomerCard = ({ customer, onAction }) => (
    <div className="glass-panel card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
                <h3 style={{ margin: 0 }}>{customer.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> {customer.phone || 'Sin teléfono'}
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ color: customer.current_balance > 0 ? 'var(--accent-error)' : 'var(--accent-success)', fontSize: '1.2rem', fontWeight: '700' }}>
                    ${customer.current_balance.toFixed(2)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Saldo Pendiente</div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
                className="glass-button"
                style={{ padding: '8px', fontSize: '0.85rem', background: 'var(--glass-highlight)' }}
                onClick={() => onAction('payment', customer)}
            >
                Registrar Pago
            </button>
            <button
                className="glass-button"
                style={{ padding: '8px', fontSize: '0.85rem', background: 'var(--primary)' }}
                onClick={() => onAction('history', customer)}
            >
                Ver Historial
            </button>
        </div>
    </div>
);

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', credit_limit: 0 });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/customers/1`);
            setCustomers(response.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const handleCreateCustomer = async () => {
        try {
            await axios.post(`${API_BASE_URL}/customers`, { ...newCustomer, branch_id: 1 });
            setShowModal(false);
            fetchCustomers();
        } catch (err) {
            alert('Error al crear cliente');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={32} color="var(--primary)" /> Gestión de Clientes
                </h1>
                <button className="glass-button" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search color="var(--text-muted)" />
                <input
                    type="text"
                    className="glass-input"
                    placeholder="Buscar por nombre o teléfono..."
                    style={{ flex: 1, border: 'none', background: 'transparent' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="dashboard-grid">
                {filteredCustomers.map(c => (
                    <CustomerCard key={c.id} customer={c} onAction={(type, cust) => console.log(type, cust)} />
                ))}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2>Nuevo Cliente</h2>
                        <input
                            className="glass-input"
                            placeholder="Nombre Completo"
                            value={newCustomer.name}
                            onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                        <input
                            className="glass-input"
                            placeholder="Teléfono"
                            value={newCustomer.phone}
                            onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                        <input
                            type="number"
                            className="glass-input"
                            placeholder="Límite de Crédito ($)"
                            value={newCustomer.credit_limit}
                            onChange={e => setNewCustomer({ ...newCustomer, credit_limit: parseFloat(e.target.value) })}
                        />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button className="glass-button" style={{ flex: 1, background: 'var(--accent-success)' }} onClick={handleCreateCustomer}>Crear</button>
                            <button className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
