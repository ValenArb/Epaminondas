const BASE = import.meta.env.VITE_API_URL || '/api';

const json = async (r) => { 
    if (r.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}`); 
    return r.json(); 
};

const getHdr = () => {
    const token = localStorage.getItem("token");
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const api = {
    login: (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        return fetch(`${BASE}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        }).then(json);
    },

    // === BUSCADOR ===
    getCategorias: () => fetch(`${BASE}/categorias/`, { headers: getHdr() }).then(json),
    createCategoria: (d) => fetch(`${BASE}/categorias/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateCategoria: (id, d) => fetch(`${BASE}/categorias/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteCategoria: (id) => fetch(`${BASE}/categorias/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),

    getProductos: (search = '') => fetch(`${BASE}/productos/?search=${encodeURIComponent(search)}`, { headers: getHdr() }).then(json),
    createProducto: (d) => fetch(`${BASE}/productos/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateProducto: (id, d) => fetch(`${BASE}/productos/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteProducto: (id) => fetch(`${BASE}/productos/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),

    // === ENCARGOS — Catálogo ===
    getGrados: () => fetch(`${BASE}/grados/`, { headers: getHdr() }).then(json),
    createGrado: (d) => fetch(`${BASE}/grados/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateGrado: (id, d) => fetch(`${BASE}/grados/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteGrado: (id) => fetch(`${BASE}/grados/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),
    addLibroCatalogo: (gradoId, d) => fetch(`${BASE}/grados/${gradoId}/libros/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateLibroCatalogo: (id, d) => fetch(`${BASE}/libros-catalogo/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteLibroCatalogo: (id) => fetch(`${BASE}/libros-catalogo/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),

    // === ENCARGOS — Pedidos ===
    getPedidos: () => fetch(`${BASE}/pedidos/`, { headers: getHdr() }).then(json),
    getPedidosArchivados: () => fetch(`${BASE}/pedidos/archivados/`, { headers: getHdr() }).then(json),
    createPedido: (d) => fetch(`${BASE}/pedidos/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deletePedido: (id) => fetch(`${BASE}/pedidos/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),
    addLibroPedido: (pedidoId, d) => fetch(`${BASE}/pedidos/${pedidoId}/libros/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateLibroEstado: (id, estado) => fetch(`${BASE}/libros-pedido/${id}/estado?estado=${estado}`, { method: 'PUT', headers: getHdr() }).then(json),
    addPagoPedido: (pedidoId, d) => fetch(`${BASE}/pedidos/${pedidoId}/pagos/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),

    // === ENCARGOS — Stock ===
    getStock: () => fetch(`${BASE}/stock/`, { headers: getHdr() }).then(json),
    createStock: (d) => fetch(`${BASE}/stock/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateStock: (id, d) => fetch(`${BASE}/stock/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    marcarComoPedido: (titulo) => fetch(`${BASE}/stock/marcar-pedido/`, { method: 'POST', headers: getHdr(), body: JSON.stringify({ titulo }) }).then(json),
    marcarComoLocal: (titulo) => fetch(`${BASE}/stock/marcar-local/`, { method: 'POST', headers: getHdr(), body: JSON.stringify({ titulo }) }).then(json),
    ingresarStock: (d) => fetch(`${BASE}/stock/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),

    // === FOTOCOPIAS ===
    getAnios: () => fetch(`${BASE}/anios-fotocopia/`, { headers: getHdr() }).then(json),
    createAnio: (d) => fetch(`${BASE}/anios-fotocopia/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateAnio: (id, d) => fetch(`${BASE}/anios-fotocopia/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteAnio: (id) => fetch(`${BASE}/anios-fotocopia/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),
    addMaterial: (anioId, d) => fetch(`${BASE}/anios-fotocopia/${anioId}/materiales/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateMaterial: (id, d) => fetch(`${BASE}/materiales-catalogo/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteMaterial: (id) => fetch(`${BASE}/materiales-catalogo/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),

    getTrabajos: () => fetch(`${BASE}/trabajos-fotocopia/`, { headers: getHdr() }).then(json),
    createTrabajo: (d) => fetch(`${BASE}/trabajos-fotocopia/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateTrabajoEstado: (id, estado) => fetch(`${BASE}/trabajos-fotocopia/${id}/estado?estado=${estado}`, { method: 'PUT', headers: getHdr() }).then(json),
    deleteTrabajo: (id) => fetch(`${BASE}/trabajos-fotocopia/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),
    addPagoFotocopia: (trabajoId, d) => fetch(`${BASE}/trabajos-fotocopia/${trabajoId}/pagos/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),

    // === LIBRETA ===
    getClientes: () => fetch(`${BASE}/clientes/`, { headers: getHdr() }).then(json),
    createCliente: (d) => fetch(`${BASE}/clientes/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    updateCliente: (id, d) => fetch(`${BASE}/clientes/${id}`, { method: 'PUT', headers: getHdr(), body: JSON.stringify(d) }).then(json),
    deleteCliente: (id) => fetch(`${BASE}/clientes/${id}`, { method: 'DELETE', headers: getHdr() }).then(json),
    addTransaccion: (clienteId, d) => fetch(`${BASE}/clientes/${clienteId}/transacciones/`, { method: 'POST', headers: getHdr(), body: JSON.stringify(d) }).then(json),
};

export default api;
