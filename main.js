const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database.js');

function crearVentanaPrincipal() {
  const ventana = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ventana.loadFile('index.html');
}

app.whenReady().then(() => {
  crearVentanaPrincipal();

ipcMain.handle('guardar-pedido', async (event, datosPedido) => {
  try {
     const stmt = db.prepare('INSERT INTO Pedidos (id_cliente, total, metodo_pago, id_cadete) VALUES (?, ?, ?, ?)');
     const info = stmt.run(datosPedido.idCliente, datosPedido.total, datosPedido.metodo, datosPedido.idCadete);
    return { exito: true, id: info.lastInsertRowid };
  } catch (error) {
    console.error(error);
    return { exito: false, error: error.message };
  }
});

  ipcMain.handle('buscar-cliente', async (event, nombreBusqueda) => {
    try {
      const stmt = db.prepare('SELECT * FROM Clientes WHERE nombre LIKE ?');
      return stmt.all(`%${nombreBusqueda}%`);
    } catch (error) {
      return [];
    }
  });

ipcMain.handle('obtener-pedidos', async () => {
  try {
  const query = `
    SELECT 
        Pedidos.id, 
        Pedidos.fecha, 
        Pedidos.total, 
        Pedidos.metodo_pago, 
        Pedidos.id_cadete, -- Importante pedirlo
        Clientes.nombre 
    FROM Pedidos 
    LEFT JOIN Clientes ON Pedidos.id_cliente = Clientes.id
    ORDER BY Pedidos.fecha DESC`;
    return db.prepare(query).all();
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return [];
  }
});
ipcMain.handle('guardar-nuevo-cliente', async (event, cliente) => {
    try {
      const stmt = db.prepare('INSERT INTO Clientes (nombre, telefono, direccion) VALUES (?, ?, ?)');
      const info = stmt.run(cliente.nombre, cliente.telefono, cliente.direccion);
      return { exito: true, id: info.lastInsertRowid };
    } catch (error) {
      return { exito: false, error: error.message };
    }
  });

 ipcMain.handle('buscar-productos', async (event, busqueda) => {
  try {
    const stmt = db.prepare('SELECT * FROM Productos WHERE nombre LIKE ? LIMIT 5');
    return stmt.all(`%${busqueda}%`);
  } catch (error) {
    return [];
  }
});

ipcMain.handle('guardar-nuevo-producto', async (event, producto) => {
    const stmt = db.prepare('INSERT INTO Productos (nombre, precio) VALUES (?, ?)');
    const info = stmt.run(producto.nombre, producto.precio);
    return { exito: true, id: info.lastInsertRowid };
});

ipcMain.handle('obtener-cadetes', async () => {
    try {
        return db.prepare('SELECT * FROM Cadetes').all();
    } catch (error) {
        return [];
    }
});

ipcMain.handle('guardar-nuevo-cadete', async (event, cadete) => {
    try {
        const stmt = db.prepare('INSERT INTO Cadetes (nombre, telefono, vehiculo) VALUES (?, ?, ?)');
        const info = stmt.run(cadete.nombre, cadete.telefono, cadete.vehiculo);
        return { exito: true, id: info.lastInsertRowid };
    } catch (error) {
        return { exito: false, error: error.message };
    }
});
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});