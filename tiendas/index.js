
var tiendaInfo = null;
var listaProductos = [];

var formularioLogin = document.getElementById('login-form');
var formularioProducto = document.getElementById('add-product-form');
var contenedorLogin = document.getElementById('login-container');
var pantallaPrincipal = document.getElementById('dashboard');
var tituloTienda = document.getElementById('store-title');
var infoTienda = document.getElementById('store-info');
var listaProductosHTML = document.getElementById('products-list');
var totalProductos = document.getElementById('total-products');
var totalPedidos = document.getElementById('total-orders');
var totalIngresos = document.getElementById('total-revenue');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada correctamente');
});

formularioLogin.addEventListener('submit', function(evento) {
    evento.preventDefault();
    console.log('Formulario de login enviado');
    
    var nombreTienda = document.getElementById('store-name').value;
    var categoriaTienda = document.getElementById('store-category').value;
    var descripcionTienda = document.getElementById('store-description').value;
    var direccionTienda = document.getElementById('store-address').value;
    var telefonoTienda = document.getElementById('store-phone').value;
    
    if (nombreTienda === '' || categoriaTienda === '' || direccionTienda === '' || telefonoTienda === '') {
        alert('Por favor llena todos los campos obligatorios');
        return; 
    }

    tiendaInfo = {
        id: Date.now(), 
        nombre: nombreTienda,
        categoria: categoriaTienda,
        descripcion: descripcionTienda,
        direccion: direccionTienda,
        telefono: telefonoTienda
    };
    
    console.log('Información de la tienda guardada:', tiendaInfo);
    

    enviarTiendaAlServidor(tiendaInfo);
    
    mostrarPantallaPrincipal();
});


formularioProducto.addEventListener('submit', function(evento) {
    evento.preventDefault();
    console.log('Formulario de producto enviado');
    
    var nombreProducto = document.getElementById('product-name').value;
    var precioProducto = document.getElementById('product-price').value;
    var imagenProducto = document.getElementById('product-image').value;
    var descripcionProducto = document.getElementById('product-description').value;
    
    if (nombreProducto === '' || precioProducto === '') {
        alert('Por favor llena el nombre y precio del producto');
        return;
    }
    
    var nuevoProducto = {
        id: Date.now(),
        nombre: nombreProducto,
        precio: parseFloat(precioProducto),
        imagen: imagenProducto,
        descripcion: descripcionProducto
    };

    fetch('http://localhost:3000/api/tiendas/' + tiendaInfo.id + '/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        if (datos.success) {
            listaProductos.push(datos.producto || nuevoProducto);
            formularioProducto.reset();
            mostrarProductos();
            actualizarEstadisticas();
            alert('Producto agregado correctamente!');
        } else {
            alert('Error: ' + datos.message);
        }
    })
    .catch(function(error) {
        console.error('Error al conectar con el servidor:', error);
        alert('Error al agregar el producto');
    });
});

function mostrarPantallaPrincipal() {
    console.log('Mostrando pantalla principal');
    
    contenedorLogin.style.display = 'none';
    
    pantallaPrincipal.style.display = 'block';
    
    tituloTienda.textContent =  tiendaInfo.nombre;
    
    mostrarInfoTienda();
    
    actualizarEstadisticas();

    switchTienda.checked = !!tiendaInfo.abierta;
    estadoTiendaLabel.textContent = tiendaInfo.abierta ? 'Abierta' : 'Cerrada';
    cargarProductosDesdeServidor();
}


function mostrarInfoTienda() {
    console.log('Mostrando información de la tienda');
    
    
    var etiquetasCategoria = {
        'restaurante': 'Restaurante',
        'tienda': 'Tienda de Conveniencia',
        'farmacia': 'Farmacia',
        'ropa': 'Ropa y Accesorios',
        'electronica': 'Electrónica',
        'hogar': 'Hogar y Jardín',
        'otros': 'Otros'
    };
    

    infoTienda.innerHTML = 
        '<div class="info-item">' +
            '<h4>Categoría</h4>' +
            '<p>' + etiquetasCategoria[tiendaInfo.categoria] + '</p>' +
        '</div>' +
        '<div class="info-item">' +
            '<h4>Dirección</h4>' +
            '<p>' + tiendaInfo.direccion + '</p>' +
        '</div>' +
        '<div class="info-item">' +
            '<h4>Teléfono</h4>' +
            '<p>' + tiendaInfo.telefono + '</p>' +
        '</div>' +
        '<div class="info-item">' +
            '<h4>Descripción</h4>' +
            '<p>' + (tiendaInfo.descripcion || 'Sin descripción') + '</p>' +
        '</div>';
}


function mostrarProductos() {
    console.log('Mostrando productos');
    
    if (listaProductos.length === 0) {

        listaProductosHTML.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">No hay productos</p>';
        return; 
    }
    
    
    var htmlProductos = '';
    
    for (var i = 0; i < listaProductos.length; i++) {
        var producto = listaProductos[i];
        
        
        htmlProductos = htmlProductos + 
            '<div class="product-item">' +
                '<img src="' + (producto.imagen || 'https://via.placeholder.com/150x150?text=Sin+Imagen') + '" alt="' + producto.nombre + '" class="product-image" onerror="this.src=\'https://via.placeholder.com/150x150?text=Error\'">' +
                '<div class="product-info">' +
                    '<div class="product-name">' + producto.nombre + '</div>' +
                    '<div class="product-price">$' + producto.precio.toFixed(2) + '</div>' +
                    '<div class="product-description">' + (producto.descripcion || 'Sin descripción') + '</div>' +
                '</div>' +
                '<button onclick="eliminarProducto(' + producto.id + ')" style="background: #e53e3e; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Eliminar</button>' +
            '</div>';
    }
    
    listaProductosHTML.innerHTML = htmlProductos;
}


function eliminarProducto(idProducto) {
    console.log('Eliminando producto con ID:', idProducto);
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        
        for (var i = 0; i < listaProductos.length; i++) {
            if (listaProductos[i].id === idProducto) {
                listaProductos.splice(i, 1);
                break; 
            }
        }
        
        console.log('Producto eliminado. Productos restantes:', listaProductos.length);
        
        mostrarProductos();
        actualizarEstadisticas();
        
        alert('Producto eliminado correctamente');
    }
}


function actualizarEstadisticas() {
    console.log('Actualizando estadísticas');
    
    totalProductos.textContent = listaProductos.length;
    
    totalPedidos.textContent = '0';
    
    totalIngresos.textContent = '$0.00';
}


function cerrarSesion() {
    console.log('Cerrando sesión');
   
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        
     
        tiendaInfo = null;
        listaProductos = [];
    
        contenedorLogin.style.display = 'flex';
        pantallaPrincipal.style.display = 'none';
        
        formularioLogin.reset();
        formularioProducto.reset();
        
   
        alert('Sesión cerrada correctamente');
    }
}

function limpiarTodosLosProductos() {    
    if (listaProductos.length === 0) {
        alert('No hay productos para limpiar');
        return; 
    }

    if (confirm('¿Estás seguro de que quieres eliminar todos los productos? Esta acción no se puede deshacer.')) {
        
        listaProductos = [];
        
        console.log('Todos los productos eliminados');
        
        mostrarProductos();
        actualizarEstadisticas();
        
        alert('Todos los productos han sido eliminados');
    }
}


function enviarTiendaAlServidor(tienda) {
    console.log('Enviando tienda al servidor:', tienda);
    
    fetch('http://localhost:3000/api/tiendas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tienda)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datos) {
        console.log('Respuesta del servidor:', datos);
        
        if (datos.success) {
            console.log('Tienda enviada al servidor exitosamente');
            tiendaInfo.id = datos.tienda.id;
        } else {
            console.error('Error al enviar tienda:', datos.message);
        }
    })
    .catch(function(error) {
        console.error('Error al conectar con el servidor:', error);
    });
}

function cargarProductosDesdeServidor() {
    fetch('http://localhost:3000/api/tiendas/' + tiendaInfo.id + '/productos')
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos) {
            if (datos.success && Array.isArray(datos.productos)) {
                listaProductos = datos.productos;
                mostrarProductos();
                actualizarEstadisticas();
            } else {
                listaProductos = [];
                mostrarProductos();
                actualizarEstadisticas();
            }
        })
        .catch(function(error) {
            console.error('Error al cargar productos del servidor:', error);
            listaProductos = [];
            mostrarProductos();
            actualizarEstadisticas();
        });
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof tiendaInfo?.abierta === 'undefined') tiendaInfo = { abierta: false };

    const switchTienda = document.getElementById('switch-tienda');
    const estadoTiendaLabel = document.getElementById('estado-tienda-label');

    function mostrarPantallaPrincipal() {
        console.log('Mostrando pantalla principal');
        contenedorLogin.style.display = 'none';
        pantallaPrincipal.style.display = 'block';
        tituloTienda.textContent = tiendaInfo.nombre;
        mostrarInfoTienda();
        actualizarEstadisticas();

        switchTienda.checked = !!tiendaInfo.abierta;
        estadoTiendaLabel.textContent = tiendaInfo.abierta ? 'Abierta' : 'Cerrada';
        cargarProductosDesdeServidor();
    }

    switchTienda.addEventListener('change', function() {
        tiendaInfo.abierta = switchTienda.checked;
        estadoTiendaLabel.textContent = tiendaInfo.abierta ? 'Abierta' : 'Cerrada';

        fetch('http://localhost:3000/api/tiendas/' + tiendaInfo.id + '/estado', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ abierta: tiendaInfo.abierta })
        });
    });

    window.mostrarPantallaPrincipal = mostrarPantallaPrincipal;
});
document.addEventListener('click', function(evento) {
    
    if (evento.target.id === 'logout-btn') {
        cerrarSesion();
    }
    
    if (evento.target.id === 'clear-all-products') {
        limpiarTodosLosProductos();
    }
});

