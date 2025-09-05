
var usuarioLogueado = null;
var listaTiendas = [];
var carrito = [];


var formularioLogin = document.getElementById('login-form');
var formularioRegistro = document.getElementById('register-form');
var contenedorLogin = document.getElementById('login-container');
var contenedorRegistro = document.getElementById('register-container');
var dashboard = document.getElementById('dashboard');
var nombreUsuarioDisplay = document.getElementById('user-name-display');
var emailUsuarioDisplay = document.getElementById('user-email-display');
var contenedorTiendas = document.getElementById('tiendas-container');
var modalProductos = document.getElementById('productos-modal');
var modalTitulo = document.getElementById('modal-tienda-nombre');
var contenedorProductos = document.getElementById('productos-container');

//cositos del carrito
var abrirCarritoBtn = document.getElementById('abrir-carrito-btn');
var carritoModal = document.getElementById('carrito-modal');
var carritoModalContenido = document.getElementById('carrito-modal-contenido');
var crearOrdenBtn = document.getElementById('crear-orden-btn');
var cerrarCarritoModalBtn = document.getElementById('cerrar-carrito-modal');
var ordenModal = document.getElementById('orden-modal');
var ordenModalContenido = document.getElementById('orden-modal-contenido');
var cerrarOrdenModalBtn = document.getElementById('cerrar-orden-modal');
var finalizarOrdenBtn = document.getElementById('finalizar-orden-btn');


document.addEventListener('DOMContentLoaded', function() {
    cargarTiendas();
    abrirCarritoBtn.style.display = 'none';
});

formularioLogin.addEventListener('submit', function(evento) {
    evento.preventDefault();
    var nombre = document.getElementById('user-name').value;
    var correo = document.getElementById('user-email').value;
    var contraseña = document.getElementById('user-password').value;
    if (!nombre || !correo || !contraseña) {
        alert('Por favor completa todos los campos');
        return;
    }
    hacerLogin(nombre, correo, contraseña);
});


formularioRegistro.addEventListener('submit', function(evento) {
    evento.preventDefault();
    var nombre = document.getElementById('reg-name').value;
    var correo = document.getElementById('reg-email').value;
    var contraseña = document.getElementById('reg-password').value;
    if (!nombre || !correo || !contraseña) {
        alert('Por favor completa todos los campos');
        return;
    }
    registrarUsuario(nombre, correo, contraseña);
});

function hacerLogin(nombre, correo, contraseña) {
    fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contraseña })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.success) {
            usuarioLogueado = datos.usuario;
            alert('¡Login exitoso! Bienvenido ' + datos.usuario.nombre);
            mostrarDashboard();
        } else {
            alert('Error: ' + datos.message);
        }
    })
    .catch(() => alert('Error al conectar con el servidor'));
}

function registrarUsuario(nombre, correo, contraseña) {
    fetch('http://localhost:3000/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contraseña })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.success) {
            alert('¡Usuario registrado exitosamente! Ahora puedes hacer login');
            formularioRegistro.reset();
            mostrarFormularioLogin();
        } else {
            alert('Error: ' + datos.message);
        }
    })
    .catch(() => alert('Error al conectar con el servidor'));
}


function mostrarDashboard() {
    contenedorLogin.style.display = 'none';
    contenedorRegistro.style.display = 'none';
    dashboard.style.display = 'block';
    nombreUsuarioDisplay.textContent = '👤 ' + usuarioLogueado.nombre;
    emailUsuarioDisplay.textContent = usuarioLogueado.correo;
    cargarTiendas();
    cargarOrdenes();
    abrirCarritoBtn.style.display = 'block';
}

function cargarTiendas() {
    fetch('http://localhost:3000/api/tiendas')
    .then(res => res.json())
    .then(datos => {
        if (datos.success) {
            listaTiendas = datos.tiendas;
            mostrarTiendas();
        }
    })
    .catch(() => alert('Error al cargar las tiendas'));
}

function mostrarTiendas() {
    if (listaTiendas.length === 0) {
        contenedorTiendas.innerHTML =
            '<div class="no-tiendas">' +
            '<h4> No hay tiendas disponibles</h4>' +
            '<p>Las tiendas aparecerán aquí cuando sean creadas desde la aplicación de tiendas.</p>' +
            '</div>';
        return;
    }
    var htmlTiendas = '<div class="tiendas-grid">';
    for (var i = 0; i < listaTiendas.length; i++) {
        var tienda = listaTiendas[i];
        htmlTiendas +=
            '<div class="tienda-card">' +
            '<div class="tienda-header">' +
            '<div class="tienda-categoria">' + obtenerEmojiCategoria(tienda.categoria) + ' ' + tienda.categoria + '</div>' +
            '</div>' +
            '<div class="tienda-nombre">' + tienda.nombre + '</div>' +
            '<div class="tienda-descripcion">' + tienda.descripcion + '</div>' +
            '<div class="tienda-info">' +
            '<div class="tienda-info-item">' +
            '<div class="tienda-info-label"> Dirección</div>' +
            '<div class="tienda-info-value">' + tienda.direccion + '</div>' +
            '</div>' +
            '<div class="tienda-info-item">' +
            '<div class="tienda-info-label"> Teléfono</div>' +
            '<div class="tienda-info-value">' + tienda.telefono + '</div>' +
            '</div>' +
            '</div>' +
            '<button onclick="verProductos(' + tienda.id + ')" class="ver-productos-btn"> Ver Productos (' + tienda.productos.length + ')</button>' +
            '</div>';
    }
    htmlTiendas += '</div>';
    contenedorTiendas.innerHTML = htmlTiendas;
}
    //lo cree porque queria poner emojis o iconos, pero lo deje asi solo si algo

    function obtenerEmojiCategoria(categoria) {
        var emojis = {
            'restaurante': '',
            'tienda': '',
            'farmacia': '',
            'ropa': '',
            'electronica': '',
            'hogar': '',
            'otros': ''
        };
        return emojis[categoria] || '';
    }

    function verProductos(tiendaId) {
        var tienda = listaTiendas.find(function (t) { return t.id === tiendaId; });
        if (!tienda) {
            alert('Tienda no encontrada');
            return;
        }
        modalTitulo.textContent = ' Productos de ' + tienda.nombre;
        mostrarProductosEnModal(tienda.productos);
        modalProductos.style.display = 'block';
    }

    
    function mostrarProductosEnModal(productos) {
        if (productos.length === 0) {
            contenedorProductos.innerHTML =
                '<p style="text-align: center; color: #718096; padding: 2rem;"> Esta tienda no tiene productos aún.</p>';
            return;
        }
        var htmlProductos = '<div class="productos-grid">';
        for (var i = 0; i < productos.length; i++) {
            var producto = productos[i];
            var imagenProducto = producto.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            htmlProductos +=
                '<div class="producto-card">' +
                '<img src="' + imagenProducto + '" alt="' + producto.nombre + '" class="producto-imagen">' +
                '<div class="producto-nombre">' + producto.nombre + '</div>' +
                '<div class="producto-precio">$' + producto.precio.toFixed(2) + '</div>' +
                '<div class="producto-descripcion">' + producto.descripcion + '</div>' +
                '<button onclick="agregarAlCarrito(' + producto.id + ',' + producto.precio + ',\'' + producto.nombre + '\',\'' + imagenProducto + '\')" class="agregar-carrito-btn">🛒 Agregar al carrito</button>' +
                '</div>';
        }
        htmlProductos += '</div>';
        contenedorProductos.innerHTML = htmlProductos;
    }


    function agregarAlCarrito(id, precio, nombre, imagen) {
        carrito.push({ id, precio, nombre, imagen });
        alert('Producto agregado al carrito');
    }


    abrirCarritoBtn.onclick = function () {
        mostrarCarritoEnModal();
        carritoModal.style.display = 'block';
    };
    cerrarCarritoModalBtn.onclick = function () {
        carritoModal.style.display = 'none';
    };

    // Abrir y cerrar el modal de orden
    crearOrdenBtn.onclick = function () {
        mostrarResumenOrden();
        carritoModal.style.display = 'none';
        ordenModal.style.display = 'block';
    };
    cerrarOrdenModalBtn.onclick = function () {
        ordenModal.style.display = 'none';
    };

    finalizarOrdenBtn.onclick = function () {
    
        var orden = {
            usuarioId: usuarioLogueado.id,
            productos: carrito,
            total: carrito.reduce((sum, p) => sum + p.precio, 0),
            fecha: new Date().toISOString()
        };

        fetch('http://localhost:3000/api/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orden)
        })
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    ordenModalContenido.innerHTML = '<p style="color:green;font-weight:bold;">¡Orden creada exitosamente!</p>';
                    carrito = [];
                    cargarOrdenes();
                    setTimeout(function () {
                        ordenModal.style.display = 'none';
                    }, 2000);
                } else {
                    ordenModalContenido.innerHTML = '<p style="color:red;">Error al crear la orden</p>';
                }
            })
            .catch(() => {
                ordenModalContenido.innerHTML = '<p style="color:red;">Error de conexión</p>';
            });
    };


    function mostrarCarritoEnModal() {
        if (carrito.length === 0) {
            carritoModalContenido.innerHTML = '<p>🛒 El carrito está vacío.</p>';
            crearOrdenBtn.style.display = 'none';
            return;
        }
        var html = '<ul>';
        var total = 0;
        carrito.forEach(function (p) {
            html += '<li><img src="' + p.imagen + '" style="width:40px;height:30px;"> ' + p.nombre + ' - $' + p.precio.toFixed(2) + '</li>';
            total += p.precio;
        });
        html += '</ul>';
        html += '<p><strong>Total: $' + total.toFixed(2) + '</strong></p>';
        carritoModalContenido.innerHTML = html;
        crearOrdenBtn.style.display = 'block';
    }

    function mostrarResumenOrden() {
        if (carrito.length === 0) {
            ordenModalContenido.innerHTML = '<p>🛒 El carrito está vacío.</p>';
            finalizarOrdenBtn.style.display = 'none';
            return;
        }
        var html = '<ul>';
        var total = 0;
        carrito.forEach(function (p) {
            html += '<li><img src="' + p.imagen + '" style="width:40px;height:30px;"> ' + p.nombre + ' - $' + p.precio.toFixed(2) + '</li>';
            total += p.precio;
        });
        html += '</ul>';
        html += '<p><strong>Total: $' + total.toFixed(2) + '</strong></p>';
        ordenModalContenido.innerHTML = html;
        finalizarOrdenBtn.style.display = 'block';
    }


    document.addEventListener('click', function (evento) {
        if (evento.target.id === 'logout-btn') cerrarSesion();
        if (evento.target.id === 'close-modal') modalProductos.style.display = 'none';
        if (evento.target.id === 'show-register') { evento.preventDefault(); mostrarFormularioRegistro(); }
        if (evento.target.id === 'show-login') { evento.preventDefault(); mostrarFormularioLogin(); }
    });

    modalProductos.addEventListener('click', function (evento) {
        if (evento.target === modalProductos) modalProductos.style.display = 'none';
    });


    function cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            usuarioLogueado = null;
            mostrarFormularioLogin();
            formularioLogin.reset();
            formularioRegistro.reset();
            alert('Sesión cerrada correctamente');
        }
    }

    function mostrarFormularioLogin() {
        contenedorRegistro.style.display = 'none';
        dashboard.style.display = 'none';
        contenedorLogin.style.display = 'flex';
    }


    function mostrarFormularioRegistro() {
        contenedorLogin.style.display = 'none';
        dashboard.style.display = 'none';
        contenedorRegistro.style.display = 'flex';
    }

    function cargarOrdenes() {
        fetch('http://localhost:3000/api/ordenes?usuarioId=' + usuarioLogueado.id)
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    mostrarOrdenes(datos.ordenes);
                }
            })
            .catch(() => alert('Error al cargar las órdenes'));
    }

    function mostrarOrdenes(ordenes) {
        var contenedor = document.getElementById('ordenes-container');
        if (!contenedor) return;
        if (!ordenes || ordenes.length === 0) {
            contenedor.innerHTML = '<p>No tienes órdenes creadas.</p>';
            return;
        }
        var html = '<h3>Mis Órdenes</h3><ul>';
        ordenes.forEach(function (orden) {
            html += '<li><strong>Fecha:</strong> ' + new Date(orden.fecha).toLocaleString() +
                '<br><strong>Total:</strong> $' + orden.total.toFixed(2) +
                '<br><strong>Productos:</strong> ' + orden.productos.map(p => p.nombre).join(', ') +
                '</li><hr>';
        });
        html += '</ul>';
        contenedor.innerHTML = html;
    }


