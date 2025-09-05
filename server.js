const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.use("/tiendas", express.static(path.join(__dirname, "tiendas")));
app.use("/repartidor", express.static(path.join(__dirname, "repartidor")));
app.use("/usuario", express.static(path.join(__dirname, "usuario")));


let tiendas = [];


let usuarios = [];


let ordenes = []; 

console.log('Servidor iniciado. Las tiendas y usuarios se guardan en memoria.');


app.post("/api/tiendas", (req, res) => {
  const { nombre, categoria, descripcion, direccion, telefono } = req.body;
  

  if (!nombre || !categoria || !direccion || !telefono) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan campos obligatorios" 
    });
  }
  

  const nuevaTienda = {
    id: Date.now(),
    nombre,
    categoria,
    descripcion: descripcion || "Sin descripción",
    direccion,
    telefono,
    productos: []
  };

  tiendas.push(nuevaTienda);
  
  console.log("Nueva tienda creada:", nuevaTienda.nombre);
  
  res.status(201).json({ 
    success: true, 
    message: "Tienda creada exitosamente",
    tienda: nuevaTienda
  });
});

app.get("/api/tiendas", (req, res) => {
  res.json({
    success: true,
    tiendas: tiendas
  });
});


app.post("/api/tiendas/:tiendaId/productos", (req, res) => {
  const tiendaId = parseInt(req.params.tiendaId);
  const { nombre, precio, imagen, descripcion } = req.body;

  const tienda = tiendas.find(t => t.id === tiendaId);
  if (!tienda) {
    return res.status(404).json({ 
      success: false, 
      message: "Tienda no encontrada" 
    });
  }
  
  if (!nombre || !precio) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan campos obligatorios" 
    });
  }
  
  const nuevoProducto = {
    id: Date.now(),
    nombre,
    precio: parseFloat(precio),
    imagen: imagen || null,
    descripcion: descripcion || "Sin descripción"
  };
  

  tienda.productos.push(nuevoProducto);
  
  console.log("Producto agregado:", nuevoProducto.nombre);
  
  res.status(201).json({ 
    success: true, 
    message: "Producto agregado exitosamente",
    producto: nuevoProducto
  });
});

app.post("/api/usuarios/registro", (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan campos obligatorios" 
    });
  }

  const usuarioExistente = usuarios.find(u => u.correo === correo);
  if (usuarioExistente) {
    return res.status(400).json({ 
      success: false, 
      message: "El correo ya está registrado" 
    });
  }

  const nuevoUsuario = {
    id: Date.now(),
    nombre,
    correo,
    contraseña
  };
  
  usuarios.push(nuevoUsuario);
  
  console.log("Nuevo usuario registrado:", nuevoUsuario.nombre);
  
  res.status(201).json({ 
    success: true, 
    message: "Usuario registrado exitosamente",
    usuario: {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo
    }
  });
});

app.post("/api/usuarios/login", (req, res) => {
  const { correo, contraseña } = req.body;
  
  if (!correo || !contraseña) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan campos obligatorios" 
    });
  }
  

  const usuario = usuarios.find(u => u.correo === correo && u.contraseña === contraseña);
  
  if (!usuario) {
    return res.status(401).json({ 
      success: false, 
      message: "Correo o contraseña incorrectos" 
    });
  }
  
  console.log("Usuario logueado:", usuario.nombre);
  
  res.json({ 
    success: true, 
    message: "Login exitoso",
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo
    }
  });
});

app.get("/api/usuarios", (req, res) => {
  res.json({
    success: true,
    usuarios: usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo
    }))
  });
});


app.post('/api/ordenes', (req, res) => {
    const nuevaOrden = { ...req.body, id: Date.now(), estado: "pendiente", repartidor: null };
    ordenes.push(nuevaOrden);
    res.json({ success: true });
});

app.get('/api/ordenes', (req, res) => {
    const estado = req.query.estado;
    const repartidor = req.query.repartidor;
    let resultado = ordenes;

    if (estado) {
        resultado = resultado.filter(o => o.estado === estado);
    }
    if (repartidor) {
        resultado = resultado.filter(o => o.repartidor === repartidor);
    }
    res.json({ success: true, ordenes: resultado });
});

app.post('/api/ordenes/:id/aceptar', (req, res) => {
    const id = parseInt(req.params.id);
    const { repartidor } = req.body;
    const orden = ordenes.find(o => o.id === id);
    if (!orden || orden.estado !== "pendiente") {
        return res.json({ success: false, message: "Orden no disponible" });
    }
    orden.estado = "aceptada";
    orden.repartidor = repartidor;
    res.json({ success: true });
});

app.put('/api/tiendas/:id/estado', (req, res) => {
    const id = parseInt(req.params.id);
    const { abierta } = req.body;
    const tienda = tiendas.find(t => t.id === id);
    if (tienda) {
        tienda.abierta = abierta;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Tienda no encontrada' });
    }
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));


