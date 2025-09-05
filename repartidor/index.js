let repartidorLogueado = null;
let ordenesDisponibles = [];
let ordenesAceptadas = [];

const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const ordenesDisponiblesDiv = document.getElementById('ordenes-disponibles');
const ordenesAceptadasDiv = document.getElementById('ordenes-aceptadas');
const logoutBtn = document.getElementById('logout-btn');
const ordenModal = document.getElementById('orden-modal');
const ordenDetalleDiv = document.getElementById('orden-detalle');
const aceptarOrdenBtn = document.getElementById('aceptar-orden-btn');
const closeModalBtn = document.getElementById('close-modal');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const nombre = document.getElementById('rep-nombre').value;
    const password = document.getElementById('rep-password').value;
    if (!nombre || !password) {
        alert('Completa todos los campos');
        return;
    }
    repartidorLogueado = { nombre: nombre };
    mostrarDashboard();
});

function mostrarDashboard() {
    loginContainer.style.display = 'none';
    dashboard.style.display = 'block';
    cargarOrdenesDisponibles();
    cargarOrdenesAceptadas();
}

logoutBtn.addEventListener('click', function() {
    repartidorLogueado = null;
    dashboard.style.display = 'none';
    loginContainer.style.display = 'block';
    loginForm.reset();
});

function cargarOrdenesDisponibles() {
    fetch('http://localhost:3000/api/ordenes?estado=pendiente')
        .then(res => res.json())
        .then(datos => {
            ordenesDisponibles = datos.ordenes || [];
            mostrarOrdenesDisponibles();
        })
        .catch(() => {
            ordenesDisponiblesDiv.innerHTML = '<p>Error al cargar órdenes.</p>';
        });
}

function mostrarOrdenesDisponibles() {
    if (ordenesDisponibles.length === 0) {
        ordenesDisponiblesDiv.innerHTML = '<p>No hay órdenes disponibles.</p>';
        return;
    }
    let html = '<ul>';
    ordenesDisponibles.forEach((orden, idx) => {
        html += `<li>
            <strong>Orden #${idx + 1}</strong> - Total: $${orden.total}
            <button onclick="verDetalleOrden(${orden.id})">Ver detalles</button>
        </li>`;
    });
    html += '</ul>';
    ordenesDisponiblesDiv.innerHTML = html;
}

window.verDetalleOrden = function(ordenId) {
    const orden = ordenesDisponibles.find(o => o.id === ordenId);
    if (!orden) return;
    ordenDetalleDiv.innerHTML = `
        <p><strong>Fecha:</strong> ${new Date(orden.fecha).toLocaleString()}</p>
        <p><strong>Total:</strong> $${orden.total}</p>
        <p><strong>Productos:</strong> ${orden.productos.map(p => p.nombre).join(', ')}</p>
    `;
    aceptarOrdenBtn.setAttribute('data-id', ordenId);
    ordenModal.style.display = 'block';
};

closeModalBtn.addEventListener('click', function() {
    ordenModal.style.display = 'none';
});

aceptarOrdenBtn.addEventListener('click', function() {
    const ordenId = parseInt(aceptarOrdenBtn.getAttribute('data-id'));
    fetch(`http://localhost:3000/api/ordenes/${ordenId}/aceptar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repartidor: repartidorLogueado.nombre })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.success) {
            alert('¡Orden aceptada!');
            ordenModal.style.display = 'none';
            cargarOrdenesDisponibles();
            cargarOrdenesAceptadas();
        } else {
            alert('No se pudo aceptar la orden');
        }
    })
    .catch(() => alert('Error al aceptar la orden'));
});

function cargarOrdenesAceptadas() {
    fetch(`http://localhost:3000/api/ordenes?repartidor=${repartidorLogueado.nombre}`)
        .then(res => res.json())
        .then(datos => {
            ordenesAceptadas = datos.ordenes || [];
            mostrarOrdenesAceptadas();
        })
        .catch(() => {
            ordenesAceptadasDiv.innerHTML = '<p>Error al cargar órdenes aceptadas.</p>';
        });
}

function mostrarOrdenesAceptadas() {
    if (ordenesAceptadas.length === 0) {
        ordenesAceptadasDiv.innerHTML = '<p>No has aceptado ninguna orden.</p>';
        return;
    }
    let html = '<ul>';
    ordenesAceptadas.forEach((orden, idx) => {
        html += `<li>
            <strong>Orden #${idx + 1}</strong> - Total: $${orden.total}
            <p>Productos: ${orden.productos.map(p => p.nombre).join(', ')}</p>
        </li>`;
    });
    html += '</ul>';
    ordenesAceptadasDiv.innerHTML = html;
}