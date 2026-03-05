const btnPedidos = document.getElementById('btn-pedidos');
const btnClientes = document.getElementById('btn-clientes');
const btnProductos = document.getElementById('btn-productos');
const btnCadetes = document.getElementById('btn-cadetes'); 
const pantallaActiva = document.getElementById('pantalla-activa');

let clienteSeleccionadoId = null; 
let totalAcumulado = 0;           

// =========================================
// UTILIDADES DE FEEDBACK (SIN ALERTS)
// =========================================
const mostrarNotificacion = (contenedor, texto, tipo) => {
    const divMensaje = document.createElement('div');
    divMensaje.textContent = texto;
    divMensaje.style.padding = '10px';
    divMensaje.style.borderRadius = '6px';
    divMensaje.style.marginBottom = '15px';
    divMensaje.style.fontWeight = 'bold';
    divMensaje.style.textAlign = 'center';
    divMensaje.style.backgroundColor = tipo === 'error' ? '#f8d7da' : '#d4edda';
    divMensaje.style.color = tipo === 'error' ? '#721c24' : '#155724';
    
    contenedor.prepend(divMensaje);
    setTimeout(() => { divMensaje.remove(); }, 3000);
};

// =========================================
// EVENTOS DEL MENÚ PRINCIPAL
// =========================================
btnPedidos.addEventListener('click', () => {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Pedidos</h2>
        <div class="controles-superiores">
            <button id="btn-nuevo-pedido" class="btn-accion">Nuevo Pedido</button>
            <button id="btn-ver-pedidos" class="btn-accion">Ver Historial</button>
        </div>
        <div id="area-trabajo-pedidos"></div>`;

    document.getElementById('btn-nuevo-pedido').addEventListener('click', pantallaNuevoPedido);
    document.getElementById('btn-ver-pedidos').addEventListener('click', pantallaHistorial);
});

btnClientes.addEventListener('click', pantallaGestionClientes);
btnProductos.addEventListener('click', pantallaGestionMenu);
btnCadetes.addEventListener('click', pantallaGestionCadetes);

// =========================================
// GESTIÓN DE PEDIDOS
// =========================================
async function pantallaNuevoPedido() {
    const area = document.getElementById('area-trabajo-pedidos');
    totalAcumulado = 0;
    clienteSeleccionadoId = null;
    let precioProductoActual = 0;

    area.innerHTML = `
        <div class="panel-comanda" id="form-pedido">
            <h3>Nueva Comanda</h3>
            <label>Cliente:</label><br>
            <input type="text" id="input-cliente" class="input-bloque" placeholder="Buscar cliente..." autocomplete="off" />
            <div id="sugerencias-cliente" class="caja-sugerencias"></div>
            <hr>
            <label>Agregar Producto:</label><br>
            <div class="fila-flexible">
                <div class="contenedor-relativo flex-1">
                    <input type="text" id="input-producto" class="input-bloque" placeholder="Escribí para buscar..." autocomplete="off" />
                    <div id="sugerencias-producto" class="caja-sugerencias absoluta"></div>
                </div>
                <input type="number" id="input-cantidad" class="input-mini" value="1" min="1" />
                <button id="btn-agregar" class="btn-secundario">Agregar</button>
            </div>
            <ul id="lista-pedido" class="lista-items"></ul>
            <p class="texto-total"><strong>Total: $<span id="total-pedido">0</span></strong></p>
            <hr>
            <div class="fila-flexible mb-espaciado">
                <div>
                    <label>Método de Pago:</label><br>
                    <select id="select-pago" class="input-base">
                        <option value="Efectivo">Efectivo</option>
                        <option value="MercadoPago">MercadoPago</option>
                    </select>
                </div>
                <div>
                    <label>Modalidad de Entrega:</label><br>
                    <select id="select-cadete" class="input-base">
                        <option value="Retira en Local">🏠 Retira en Local</option>
                        <optgroup label="🛵 Envío a Domicilio" id="grupo-cadetes"></optgroup>
                    </select>
                </div>
            </div>
            <button id="btn-guardar" class="btn-primario btn-bloque">CONFIRMAR Y GUARDAR</button>
        </div>`;

    const inputCli = document.getElementById('input-cliente');
    const inputProd = document.getElementById('input-producto');
    const divSugProd = document.getElementById('sugerencias-producto');
    const divSugCli = document.getElementById('sugerencias-cliente');
    const grupoCadetes = document.getElementById('grupo-cadetes');
    const formPedido = document.getElementById('form-pedido');

    const cadetes = await window.api.obtenerCadetes();
    cadetes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nombre; 
        opt.textContent = `Cadete: ${c.nombre}`;
        grupoCadetes.appendChild(opt);
    });

    inputCli.addEventListener('input', async () => {
        divSugCli.innerHTML = "";
        if (inputCli.value.length > 2) {
            const clientes = await window.api.buscarCliente(inputCli.value);
            clientes.forEach(c => {
                const item = document.createElement('div');
                item.innerText = `${c.nombre} (${c.direccion})`;
                item.classList.add('item-sugerencia');
                item.onclick = () => { 
                    inputCli.value = c.nombre; 
                    clienteSeleccionadoId = c.id; 
                    divSugCli.innerHTML = ""; 
                };
                divSugCli.appendChild(item);
            });
        }
    });

    inputProd.addEventListener('input', async () => {
        divSugProd.innerHTML = "";
        if (inputProd.value.length > 1) {
            const productos = await window.api.buscarProductos(inputProd.value);
            productos.forEach(p => {
                const item = document.createElement('div');
                item.innerText = `${p.nombre} - $${p.precio}`;
                item.classList.add('item-sugerencia');
                item.onclick = () => { 
                    inputProd.value = p.nombre; 
                    precioProductoActual = p.precio; 
                    divSugProd.innerHTML = ""; 
                };
                divSugProd.appendChild(item);
            });
        }
    });

    document.getElementById('btn-agregar').addEventListener('click', () => {
        const nombre = inputProd.value; 
        const cant = parseInt(document.getElementById('input-cantidad').value);
        if (!nombre || precioProductoActual === 0) return;
        totalAcumulado += (cant * precioProductoActual);
        document.getElementById('total-pedido').innerText = totalAcumulado;
        const li = document.createElement('li'); 
        li.innerText = `${cant}x ${nombre} --- $${cant * precioProductoActual}`;
        li.classList.add('item-pedido');
        document.getElementById('lista-pedido').appendChild(li);
        inputProd.value = ""; 
        precioProductoActual = 0; 
        document.getElementById('input-cantidad').value = 1;
        inputProd.focus();
    });

    document.getElementById('btn-guardar').addEventListener('click', async (e) => {
        if (!clienteSeleccionadoId || totalAcumulado <= 0) {
            return mostrarNotificacion(formPedido, "⚠️ Faltan datos", "error");
        }
        const datos = { 
            idCliente: clienteSeleccionadoId, 
            total: totalAcumulado, 
            metodo: document.getElementById('select-pago').value, 
            idCadete: document.getElementById('select-cadete').value 
        };
        const res = await window.api.guardarPedido(datos);
        if (res.exito) { 
            mostrarNotificacion(formPedido, "✅ Pedido Guardado", "exito");
            imprimirTicket(totalAcumulado, document.getElementById('lista-pedido').innerHTML);
            setTimeout(() => { pantallaNuevoPedido(); }, 1500);
        }
    });
}

// =========================================
// GESTIÓN DE PRODUCTOS Y CADETES (CON TABLAS)
// =========================================
async function pantallaGestionMenu() {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Productos</h2>
        <div class="panel-formulario" id="form-productos">
            <input type="text" id="prod-nombre" placeholder="Nombre del producto" class="input-base">
            <input type="number" id="prod-precio" placeholder="Precio" class="input-base">
            <button id="btn-registrar-prod" class="btn-primario">Agregar al Menú</button>
        </div>
        <hr>
        <h3>Productos en el Menú</h3>
        <table class="tabla-base">
            <thead><tr><th>Producto</th><th>Precio</th></tr></thead>
            <tbody id="lista-productos-tabla"></tbody>
        </table>`;

    const cargarProductos = async () => {
        const productos = await window.api.buscarProductos("");
        document.getElementById('lista-productos-tabla').innerHTML = productos.map(p => `<tr><td>${p.nombre}</td><td>$${p.precio}</td></tr>`).join('');
    };

    document.getElementById('btn-registrar-prod').addEventListener('click', async () => {
        const p = { nombre: document.getElementById('prod-nombre').value, precio: parseFloat(document.getElementById('prod-precio').value) };
        if(!p.nombre || isNaN(p.precio)) return;
        const res = await window.api.guardarNuevoProducto(p);
        if(res.exito) {
            mostrarNotificacion(document.getElementById('form-productos'), "✅ Producto agregado", "exito");
            setTimeout(() => { pantallaGestionMenu(); }, 1000);
        }
    });
    cargarProductos();
}

async function pantallaGestionCadetes() {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Cadetes</h2>
        <div class="panel-formulario" id="form-cadetes">
            <input type="text" id="cad-nombre" placeholder="Nombre" class="input-base">
            <input type="text" id="cad-tel" placeholder="Teléfono" class="input-base">
            <input type="text" id="cad-veh" placeholder="Vehículo" class="input-base">
            <button id="btn-registrar-cad" class="btn-primario">Registrar Cadete</button>
        </div>
        <hr>
        <h3>Cadetes Registrados</h3>
        <table class="tabla-base">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Vehículo</th></tr></thead>
            <tbody id="lista-cadetes-tabla"></tbody>
        </table>`;

    const cargarCadetes = async () => {
        const cadetes = await window.api.obtenerCadetes();
        document.getElementById('lista-cadetes-tabla').innerHTML = cadetes.map(c => `<tr><td>${c.nombre}</td><td>${c.telefono}</td><td>${c.vehiculo}</td></tr>`).join('');
    };

    document.getElementById('btn-registrar-cad').addEventListener('click', async () => {
        const cad = { nombre: document.getElementById('cad-nombre').value, telefono: document.getElementById('cad-tel').value, vehiculo: document.getElementById('cad-veh').value };
        if(!cad.nombre) return;
        const res = await window.api.guardarNuevoCadete(cad);
        if(res.exito) {
            mostrarNotificacion(document.getElementById('form-cadetes'), "✅ Cadete registrado", "exito");
            setTimeout(() => { pantallaGestionCadetes(); }, 1000);
        }
    });
    cargarCadetes();
}

async function pantallaGestionClientes() {
    pantallaActiva.innerHTML = `<h2>Gestión de Clientes</h2>
        <div class="panel-formulario" id="form-clientes">
            <input type="text" id="cli-nombre" placeholder="Nombre" class="input-base">
            <input type="text" id="cli-tel" placeholder="Teléfono" class="input-base">
            <input type="text" id="cli-dir" placeholder="Dirección" class="input-base">
            <button id="btn-registrar-cli" class="btn-primario">Registrar Cliente</button>
        </div>`;
    document.getElementById('btn-registrar-cli').addEventListener('click', async () => {
        const c = { nombre: document.getElementById('cli-nombre').value, telefono: document.getElementById('cli-tel').value, direccion: document.getElementById('cli-dir').value };
        const res = await window.api.guardarNuevoCliente(c);
        if(res.exito) {
            mostrarNotificacion(document.getElementById('form-clientes'), "✅ Cliente registrado", "exito");
        }
    });
}

async function pantallaHistorial() {
    const area = document.getElementById('area-trabajo-pedidos');
    const pedidos = await window.api.obtenerPedidos();
    area.innerHTML = `<h3>Historial de Ventas</h3>
        <table class="tabla-base">
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Entrega</th></tr></thead>
            <tbody id="cuerpo-historial"></tbody>
        </table>`;
    const tabla = document.getElementById('cuerpo-historial');
    pedidos.forEach(p => {
        tabla.innerHTML += `<tr><td>${new Date(p.fecha).toLocaleDateString()}</td><td>${p.cliente_nombre}</td><td>$${p.total}</td><td>${p.metodo_pago}</td><td>${p.id_cadete}</td></tr>`;
    });
}

function imprimirTicket(total, itemsHTML) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.write(`<html><body style="font-family:monospace; padding:10px;"><h2>Fika POS</h2><hr>${itemsHTML}<hr><b>Total: $${total}</b></body></html>`);
    doc.close();
    setTimeout(() => { iframe.contentWindow.print(); document.body.removeChild(iframe); }, 500);
}