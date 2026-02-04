import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Upload, FileText, Download, AlertCircle, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import Papa from 'papaparse';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, totalValue: 0 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/1`);
            setProducts(response.data);
            calculateStats(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const calculateStats = (items) => {
        const statsObj = items.reduce((acc, curr) => ({
            totalItems: acc.totalItems + 1,
            lowStock: acc.lowStock + (curr.stock <= curr.min_stock ? 1 : 0),
            totalValue: acc.totalValue + (curr.cost * curr.stock)
        }), { totalItems: 0, lowStock: 0, totalValue: 0 });
        setStats(statsObj);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const productsToProcess = results.data.map(row => ({
                    name: row.Nombre || row.name,
                    isbn: row.ISBN || row.isbn || null,
                    internal_code: row.Codigo || row.internal_code || null,
                    cost: parseFloat(row.Costo || row.cost || 0),
                    price: parseFloat(row.Precio || row.price || 0),
                    stock: parseFloat(row.Stock || row.stock || 0),
                    min_stock: parseFloat(row.Minimo || row.min_stock || 0),
                    branch_id: 1 // Default
                }));

                try {
                    // Send batch to backend (simplified as single requests or new batch endpoint)
                    for (const prod of productsToProcess) {
                        await axios.post(`${API_BASE_URL}/products`, prod);
                    }
                    alert('Importación completada');
                    fetchProducts();
                    setShowUploadModal(false);
                } catch (err) {
                    alert('Error al importar productos. Verifique el formato.');
                }
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.isbn && p.isbn.includes(search)) ||
        (p.internal_code && p.internal_code.includes(search))
    );

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Package size={32} color="var(--primary)" /> Inventario y Stock
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glass-button" style={{ background: 'var(--glass-highlight)' }} onClick={() => setShowUploadModal(true)}>
                        <Upload size={20} /> Importar CSV
                    </button>
                    <button className="glass-button">
                        <Plus size={20} /> Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                <div className="glass-panel card">
                    <div style={{ color: 'var(--text-muted)' }}>Total Artículos</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalItems}</div>
                </div>
                <div className="glass-panel card">
                    <div style={{ color: 'var(--accent-error)' }}>Stock Bajo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.lowStock}</div>
                </div>
                <div className="glass-panel card">
                    <div style={{ color: 'var(--accent-success)' }}>Valor del Inventario</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>${stats.totalValue.toLocaleString()}</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search color="var(--text-muted)" />
                <input
                    type="text"
                    className="glass-input"
                    placeholder="Buscar por nombre, ISBN o código interno..."
                    style={{ flex: 1, border: 'none', background: 'transparent' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--glass-highlight)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px' }}>Producto</th>
                            <th style={{ padding: '16px' }}>Código/ISBN</th>
                            <th style={{ padding: '16px' }}>Costo</th>
                            <th style={{ padding: '16px' }}>Venta</th>
                            <th style={{ padding: '16px' }}>Stock</th>
                            <th style={{ padding: '16px' }}>Estado</th>
                            <th style={{ padding: '16px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px' }}>{p.name}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.isbn || p.internal_code || '-'}</div>
                                </td>
                                <td style={{ padding: '16px' }}>${p.cost.toFixed(2)}</td>
                                <td style={{ padding: '16px', fontWeight: '600' }}>${p.price.toFixed(2)}</td>
                                <td style={{ padding: '16px' }}>{p.stock}</td>
                                <td style={{ padding: '16px' }}>
                                    <span className={`status-badge ${p.stock <= p.min_stock ? 'status-offline' : 'status-online'}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                        {p.stock <= p.min_stock ? 'BAJO STOCK' : 'OK'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit size={18} /></button>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-error)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showUploadModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '32px', textAlign: 'center' }}>
                        <FileText size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                        <h2>Carga Masiva de Productos</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Selecciona un archivo CSV para importar tus productos automáticamente.</p>

                        <div style={{ border: '2px dashed var(--glass-border)', padding: '40px', borderRadius: '12px', marginBottom: '24px' }}>
                            <input type="file" accept=".csv" onChange={handleFileUpload} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowUploadModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
