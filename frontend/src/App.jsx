import { useState, useEffect } from 'react';
import './index.css';

const API_BASE = "http://localhost:8000/api/v1";

function App() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Epaminondas</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('inventory')} className={`btn ${activeTab === 'inventory' ? 'btn-primary' : ''}`}>Inventario</button>
          <button onClick={() => setActiveTab('ledger')} className={`btn ${activeTab === 'ledger' ? 'btn-primary' : ''}`}>Fiados</button>
          <button onClick={() => setActiveTab('photocopy')} className={`btn ${activeTab === 'photocopy' ? 'btn-primary' : ''}`}>Fotocopias</button>
          <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`}>Encargos</button>
        </nav>
      </header>

      <main>
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'ledger' && <LedgerModule />}
        {activeTab === 'photocopy' && <PhotocopyModule />}
        {activeTab === 'orders' && <OrdersModule />}
      </main>
    </div>
  );
}

function InventoryModule() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length > 2) {
      fetch(`${API_BASE}/inventory/products/search?query=${query}`)
        .then(res => res.json())
        .then(data => setResults(data));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div>
      <input
        autoFocus
        type="text"
        className="search-input"
        placeholder="Buscar por ISBN o Descripción..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {results.map(product => (
          <div key={product.id} className="card">
            <h3>{product.descripcion}</h3>
            <p><strong>ISBN:</strong> {product.isbn}</p>
            <p style={{ color: 'var(--success-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
              ${product.precio_final}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LedgerModule() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/ledger/clients`)
      .then(res => res.json())
      .then(data => setClients(data));
  }, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
      {clients.map(client => (
        <div key={client.id} className="card" style={{ borderLeft: `6px solid ${client.saldo_total > 0 ? 'var(--danger-color)' : 'var(--success-color)'}` }}>
          <h3>{client.nombre}</h3>
          <p style={{ color: client.saldo_total > 0 ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 'bold' }}>
            {client.saldo_total > 0 ? `Debe: $${client.saldo_total}` : 'Al día'}
          </p>
        </div>
      ))}
    </div>
  );
}

function PhotocopyModule() {
  const [jobs, setJobs] = useState([]);
  const states = ['pendiente', 'listo', 'entregado'];

  useEffect(() => {
    fetch(`${API_BASE}/photocopies/`)
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  const updateStatus = (id, status) => {
    fetch(`${API_BASE}/photocopies/${id}/status?status=${status}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(updated => setJobs(jobs.map(j => j.id === id ? updated : j)));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {states.map(state => (
        <div key={state} className="kanban-col">
          <h2 style={{ textTransform: 'capitalize' }}>{state}</h2>
          {jobs.filter(j => j.estado_actual === state).map(job => (
            <div key={job.id} className="card" style={{ marginBottom: '1rem' }}>
              <h4>{job.solicitante}</h4>
              <p>{job.descripcion_material}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {state !== 'pendiente' && <button onClick={() => updateStatus(job.id, states[states.indexOf(state) - 1])} className="btn">←</button>}
                {state !== 'entregado' && <button onClick={() => updateStatus(job.id, states[states.indexOf(state) + 1])} className="btn">→</button>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function OrdersModule() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/orders/`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div className="card">
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th>Libro/ISBN</th>
            <th>Cliente</th>
            <th>Seña</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{order.titulo_isbn}</td>
              <td>{order.nombre_cliente}</td>
              <td>${order.monto_senia}</td>
              <td>{order.estado_pedido}</td>
              <td>
                {order.whatsapp_url && (
                  <a href={order.whatsapp_url} target="_blank" rel="noreferrer" className="btn btn-success" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
                    WhatsApp
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
