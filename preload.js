const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    guardarPedido: (datosPedido) => ipcRenderer.invoke('guardar-pedido', datosPedido),
    buscarCliente: (nombre) => ipcRenderer.invoke('buscar-cliente', nombre),
    obtenerPedidos: () => ipcRenderer.invoke('obtener-pedidos'), 
    guardarNuevoCliente: (cliente) => ipcRenderer.invoke('guardar-nuevo-cliente', cliente),
    buscarProductos: (texto) => ipcRenderer.invoke('buscar-productos', texto),
    guardarNuevoProducto: (p) => ipcRenderer.invoke('guardar-nuevo-producto', p),
obtenerCadetes: () => ipcRenderer.invoke('obtener-cadetes'),
guardarNuevoCadete: (cadete) => ipcRenderer.invoke('guardar-nuevo-cadete', cadete),
});