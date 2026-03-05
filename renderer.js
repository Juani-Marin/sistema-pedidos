const btnPedidos = document.getElementById('btn-pedidos');
const btnClientes = document.getElementById('btn-clientes');
const btnProductos = document.getElementById('btn-productos');
const btnCadetes = document.getElementById('btn-cadetes'); 
const pantallaActiva = document.getElementById('pantalla-activa');

let clienteSeleccionadoId = null; 
let totalAcumulado = 0;           

// EVENTOS DEL MENÚ PRINCIPAL
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

// FUNCIONES DE PANTALLA

async function pantallaNuevoPedido() {
    const area = document.getElementById('area-trabajo-pedidos');
    totalAcumulado = 0;
    clienteSeleccionadoId = null;

    area.innerHTML = `
        <div class="panel-comanda">
            <h3>Nueva Comanda</h3>
            <div id="mensaje-pedido" style="display: none; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; text-align: center;"></div>
            
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
                <input type="number" id="input-precio" class="input-corto" placeholder="$" readonly tabindex="-1" style="background-color: #eee; cursor: not-allowed;" />
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
                        <optgroup label="🛵 Envío a Domicilio" id="grupo-cadetes">
                            </optgroup>
                    </select>
                </div>
            </div>
            <button id="btn-guardar" class="btn-primario btn-bloque">CONFIRMAR Y GUARDAR</button>
        </div>`;

    const inputCli = document.getElementById('input-cliente');
    const inputProd = document.getElementById('input-producto');
    const inputPrecio = document.getElementById('input-precio');
    const divSugProd = document.getElementById('sugerencias-producto');
    const divSugCli = document.getElementById('sugerencias-cliente');
    const grupoCadetes = document.getElementById('grupo-cadetes');
    const divMensaje = document.getElementById('mensaje-pedido');

    const mostrarMensaje = (texto, tipo) => {
        divMensaje.textContent = texto;
        divMensaje.style.display = 'block';
        divMensaje.style.backgroundColor = tipo === 'error' ? '#f8d7da' : '#d4edda';
        divMensaje.style.color = tipo === 'error' ? '#721c24' : '#155724';
        setTimeout(() => { divMensaje.style.display = 'none'; }, 3000);
    };

    // Carga de cadetes al selector
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
                    inputPrecio.value = p.precio; 
                    divSugProd.innerHTML = ""; 
                };
                divSugProd.appendChild(item);
            });
        }
    });

    document.getElementById('btn-agregar').addEventListener('click', () => {
        const nombre = inputProd.value; 
        const precio = parseFloat(inputPrecio.value); 
        const cant = parseInt(document.getElementById('input-cantidad').value);
        
        if (!nombre || isNaN(precio)) return;
        
        totalAcumulado += (cant * precio);
        document.getElementById('total-pedido').innerText = totalAcumulado;
        
        const li = document.createElement('li'); 
        li.innerText = `${cant}x ${nombre} --- $${cant * precio}`;
        li.classList.add('item-pedido');
        document.getElementById('lista-pedido').appendChild(li);
        
        inputProd.value = ""; 
        inputPrecio.value = ""; 
        document.getElementById('input-cantidad').value = 1;
        inputProd.focus();
    });

    document.getElementById('btn-guardar').addEventListener('click', async (e) => {
        if (!clienteSeleccionadoId || totalAcumulado <= 0) {
            return mostrarMensaje("Faltan datos en la comanda", "error");
        }
        
        const btn = e.target;
        btn.disabled = true;

        const datos = { 
            idCliente: clienteSeleccionadoId, 
            total: totalAcumulado, 
            metodo: document.getElementById('select-pago').value, 
            idCadete: document.getElementById('select-cadete').value 
        };
        
        const res = await window.api.guardarPedido(datos);
        if (res.exito) { 
            mostrarMensaje("✅ Guardado", "exito");
            imprimirTicket(totalAcumulado, document.getElementById('lista-pedido').innerHTML);
            setTimeout(() => { pantallaNuevoPedido(); }, 1500);
        } else {
            btn.disabled = false;
        }
    });
}

// RESTO DE FUNCIONES (GESTIÓN Y LISTADOS)

async function pantallaHistorial() {
    const area = document.getElementById('area-trabajo-pedidos');
    const pedidos = await window.api.obtenerPedidos();
    
    area.innerHTML = `<h3>Historial de Ventas</h3>
        <table class="tabla-base">
            <thead>
                <tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Entrega</th></tr>
            </thead>
            <tbody id="cuerpo-historial"></tbody>
        </table>`;
    
    const tabla = document.getElementById('cuerpo-historial');
    pedidos.forEach(p => {
        const fila = `<tr>
            <td>${new Date(p.fecha).toLocaleDateString()}</td>
            <td>${p.cliente_nombre}</td>
            <td>$${p.total}</td>
            <td>${p.metodo_pago}</td>
            <td>${p.id_cadete}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

async function pantallaGestionClientes() {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Clientes</h2>
        <div class="panel-formulario">
            <input type="text" id="cli-nombre" placeholder="Nombre completo" class="input-base">
            <input type="text" id="cli-tel" placeholder="Teléfono" class="input-base">
            <input type="text" id="cli-dir" placeholder="Dirección" class="input-base">
            <button id="btn-registrar-cli" class="btn-primario">Registrar Cliente</button>
        </div>
        <div id="msg-cli"></div>`;

    document.getElementById('btn-registrar-cli').addEventListener('click', async () => {
        const c = {
            nombre: document.getElementById('cli-nombre').value,
            telefono: document.getElementById('cli-tel').value,
            direccion: document.getElementById('cli-dir').value
        };
        const res = await window.api.guardarNuevoCliente(c);
        if(res.exito) {
            document.getElementById('msg-cli').innerHTML = "✅ Cliente guardado";
            setTimeout(() => { pantallaGestionClientes(); }, 1000);
        }
    });
}

async function pantallaGestionMenu() {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Productos</h2>
        <div class="panel-formulario">
            <input type="text" id="prod-nombre" placeholder="Nombre del producto" class="input-base">
            <input type="number" id="prod-precio" placeholder="Precio" class="input-base">
            <button id="btn-registrar-prod" class="btn-primario">Agregar al Menú</button>
        </div>
        <div id="msg-prod"></div>`;

    document.getElementById('btn-registrar-prod').addEventListener('click', async () => {
        const p = {
            nombre: document.getElementById('prod-nombre').value,
            precio: parseFloat(document.getElementById('prod-precio').value)
        };
        const res = await window.api.guardarNuevoProducto(p);
        if(res.exito) {
            document.getElementById('msg-prod').innerHTML = "✅ Producto agregado";
            setTimeout(() => { pantallaGestionMenu(); }, 1000);
        }
    });
}

async function pantallaGestionCadetes() {
    pantallaActiva.innerHTML = `
        <h2>Gestión de Cadetes</h2>
        <div class="panel-formulario">
            <input type="text" id="cad-nombre" placeholder="Nombre del Cadete" class="input-base">
            <input type="text" id="cad-tel" placeholder="Teléfono" class="input-base">
            <input type="text" id="cad-veh" placeholder="Vehículo (Moto/Bici)" class="input-base">
            <button id="btn-registrar-cad" class="btn-primario">Registrar Cadete</button>
        </div>
        <div id="msg-cad"></div>`;

    document.getElementById('btn-registrar-cad').addEventListener('click', async () => {
        const cad = {
            nombre: document.getElementById('cad-nombre').value,
            telefono: document.getElementById('cad-tel').value,
            vehiculo: document.getElementById('cad-veh').value
        };
        const res = await window.api.guardarNuevoCadete(cad);
        if(res.exito) {
            document.getElementById('msg-cad').innerHTML = "✅ Cadete registrado";
            setTimeout(() => { pantallaGestionCadetes(); }, 1000);
        }
    });
}

function imprimirTicket(total, itemsHTML) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.write(`
        <html>
        <head>
            <style>
                body { font-family: monospace; font-size: 14px; width: 80mm; margin: 0; padding: 10px; color: black; }
                h2 { text-align: center; margin: 0 0 10px 0; }
                ul { list-style: none; padding: 0; margin: 0; }
                li { margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; }
                .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h2>Fika POS</h2>
            <p>Comanda de pedido</p>
            <hr style="border-top: 1px dashed black;">
            <ul>${itemsHTML}</ul>
            <hr style="border-top: 1px dashed black;">
            <div class="total">Total: $${total}</div>
        </body>
        </html>
    `);
    doc.close();
    
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
}