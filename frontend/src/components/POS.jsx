import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, CreditCard, X, Plus, Minus, Send } from 'lucide-react';
import { db } from '../db/localDb';
import { useLiveQuery } from 'dexie-react-hook';

const POS = () => {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchCustomers();
        searchInputRef.current?.focus();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/customers/1');
            setCustomers(response.data);
        } catch (err) {
            console.error('Offline or error: could not fetch customers');
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQty = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(0.1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleFinishSale = async () => {
        if (cart.length === 0) return;
        if (paymentMethod === 'CREDIT' && !selectedCustomer) {
            alert('Seleccione un cliente para pagar al fiado');
            return;
        }

        const sale = {
            id: crypto.randomUUID(),
            external_id: Date.now(),
            customer_id: selectedCustomer?.id || null,
            items: cart,
            total,
            paymentMethod,
            timestamp: new Date(),
            status: 'pending'
        };

        try {
            await db.sales.add(sale);
            setCart([]);
            setSelectedCustomer(null);
            alert('Venta registrada. El saldo del cliente se actualizará al sincronizar.');
        } catch (err) {
            console.error('Error saving sale:', err);
        }
    };

    return (
        <div className="pos-container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: '100vh', gap: '1px', background: 'var(--glass-border)' }}>
            {/* Search and Products Section */}
            <div className="main-section" style={{ padding: '24px', background: 'var(--bg-gradient)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div className="search-bar glass-panel card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="glass-input"
                            style={{ flex: 1, border: 'none', background: 'transparent' }}
                            placeholder="Escanear código o buscar producto (F1)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery) {
                                    // Mock search for now
                                    addToCart({ id: Date.now(), name: searchQuery, price: 100 });
                                }
                            }}
                        />
                    </div>

                    <div className="customer-select glass-panel card" style={{ width: '250px', padding: '0 12px', display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                        <User size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                        <select
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                            onChange={(e) => setSelectedCustomer(customers.find(c => c.id == e.target.value))}
                            value={selectedCustomer?.id || ''}
                        >
                            <option value="" style={{ background: '#1e1b4b' }}>Consumidor Final</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id} style={{ background: '#1e1b4b' }}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                    {/* Quick access products would go here */}
                </div>
            </div>

            {/* Cart and Sidebar */}
            <div className="sidebar" style={{ background: 'var(-- glass)', backdropFilter: 'blur(20px)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingCart /> Carrito
                    </h2>
                    <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.map(item => (
                            <div key={item.id} className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${item.price} x {item.qty}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => updateQty(item.id, -1)} className="glass-button" style={{ padding: '4px' }}><Minus size={14} /></button>
                                    <button onClick={() => updateQty(item.id, 1)} className="glass-button" style={{ padding: '4px' }}><Plus size={14} /></button>
                                    <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--accent-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cart-footer glass-panel card" style={{ marginTop: '24px', background: 'var(--glass-highlight)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700' }}>
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <button
                            className="glass-button"
                            onClick={() => setPaymentMethod('CASH')}
                            style={{ padding: '8px', fontSize: '0.8rem', background: paymentMethod === 'CASH' ? 'var(--primary)' : 'rgba(255,255,255,0.05)' }}
                        >Efectivo</button>
                        <button
                            className="glass-button"
                            onClick={() => setPaymentMethod('CARD')}
                            style={{ padding: '8px', fontSize: '0.8rem', background: paymentMethod === 'CARD' ? 'var(--primary)' : 'rgba(255,255,255,0.05)' }}
                        >Tarjeta</button>
                        <button
                            className="glass-button"
                            onClick={() => setPaymentMethod('CREDIT')}
                            style={{ padding: '8px', fontSize: '0.8rem', background: paymentMethod === 'CREDIT' ? 'var(--accent-warning)' : 'rgba(255,255,255,0.05)', color: paymentMethod === 'CREDIT' ? 'black' : 'white' }}
                        >Fiado</button>
                    </div>

                    <button
                        className="glass-button"
                        style={{ marginTop: '16px', width: '100%', background: 'var(--accent-success)', fontSize: '1.1rem' }}
                        onClick={handleFinishSale}
                    >
                        Finalizar Venta (F10)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
