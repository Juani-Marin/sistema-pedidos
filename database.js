const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fika_pos.db'));

function inicializarBD() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            telefono TEXT,
            direccion TEXT
        );

        CREATE TABLE IF NOT EXISTS Productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            descripcion TEXT,
            precio REAL
        );

        CREATE TABLE IF NOT EXISTS Pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_cliente INTEGER,
            id_cadete TEXT,
            total REAL,
            metodo_pago TEXT,
            estado TEXT DEFAULT 'pendiente',
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(id_cliente) REFERENCES Clientes(id)
        );

        CREATE TABLE IF NOT EXISTS Detalle_Pedido (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_pedido INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            FOREIGN KEY(id_pedido) REFERENCES Pedidos(id),
            FOREIGN KEY(id_producto) REFERENCES Productos(id)
        );
        CREATE TABLE IF NOT EXISTS Cadetes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        telefono TEXT,
        vehiculo TEXT -- Opcional: Moto, Bici, etc.
    );
    `);
}

inicializarBD();
module.exports = db;