import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Customers from './components/Customers';
import './styles/index.css';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            textDecoration: 'none',
            color: active ? 'white' : 'var(--text-muted)',
            background: active ? 'var(--glass-highlight)' : 'transparent',
            borderRadius: '8px',
            transition: 'all 0.2s'
        }}
    >
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

const App = () => {
    const [activePath, setActivePath] = useState(window.location.pathname);

    return (
        <Router>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <aside className="glass-panel" style={{ width: '260px', borderRadius: '0', borderLeft: 'none', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '0 16px 24px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                        EPAMINONDAS
                    </div>

                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={activePath === '/'} />
                    <SidebarItem to="/pos" icon={ShoppingCart} label="Ventas (POS)" active={activePath === '/pos'} />
                    <SidebarItem to="/inventory" icon={Package} label="Inventario" active={activePath === '/inventory'} />
                    <SidebarItem to="/customers" icon={Users} label="Clientes (Fiado)" active={activePath === '/customers'} />
                    <SidebarItem to="/settings" icon={Settings} label="Configuración" active={activePath === '/settings'} />

                    <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--accent-error)', cursor: 'pointer' }}>
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/inventory" element={<div>Módulo de Inventario (Próximamente)</div>} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/settings" element={<div>Configuración (Próximamente)</div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
