import React from 'react';
import { TrendingUp, Package, AlertTriangle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
    { name: 'Lun', ventas: 4000, ganancia: 2400 },
    { name: 'Mar', ventas: 3000, ganancia: 1398 },
    { name: 'Mie', ventas: 2000, ganancia: 9800 },
    { name: 'Jue', ventas: 2780, ganancia: 3908 },
    { name: 'Vie', ventas: 1890, ganancia: 4800 },
    { name: 'Sab', ventas: 2390, ganancia: 3800 },
    { name: 'Dom', ventas: 3490, ganancia: 4300 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{value}</div>
            </div>
            <div style={{ background: `${color}22`, padding: '12px', borderRadius: '12px' }}>
                <Icon color={color} size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '24px' }}>Panel de Control</h1>

            <div className="dashboard-grid">
                <StatCard title="Ventas del Día" value="$45,230" icon={TrendingUp} color="#6366f1" />
                <StatCard title="Productos en Stock" value="1,240" icon={Package} color="#10b981" />
                <StatCard title="Alertas de Stock" value="12" icon={AlertTriangle} color="#ef4444" />
                <StatCard title="Clientes Activos" value="84" icon={Users} color="#f59e0b" />
            </div>

            <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                <div className="glass-panel card" style={{ minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Ventas Semanales</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{ background: '#1e1b4b', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="ventas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel card" style={{ minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Evolución de Márgenes</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{ background: '#1e1b4b', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="ganancia" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
