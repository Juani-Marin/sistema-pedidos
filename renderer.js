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
                <input type="number" id="input-precio" class="input-corto" placeholder="$" readonly tabindex="-1" />
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

    // Cargar cadetes en el grupo de envío
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
                    inputPrecio.value = p.precio; // Se asigna automáticamente el precio del menú
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
        
        if (!nombre || isNaN(precio)) {
            return mostrarMensaje("Seleccioná un producto de la lista.", "error");
        }
        
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
        if (!clienteSeleccionadoId) {
            return mostrarMensaje("Falta seleccionar el cliente.", "error");
        }
        if (totalAcumulado <= 0) {
            return mostrarMensaje("El pedido está vacío.", "error");
        }
        
        const btn = e.target;
        btn.disabled = true;

        const datos = { 
            idCliente: clienteSeleccionadoId, 
            total: totalAcumulado, 
            metodo: document.getElementById('select-pago').value, 
            idCadete: document.getElementById('select-cadete').value // Captura "Retira en Local" o el nombre del cadete
        };
        
        const res = await window.api.guardarPedido(datos);
        if (res.exito) { 
            mostrarMensaje("✅ Guardado correctamente", "exito");
            imprimirTicket(totalAcumulado, document.getElementById('lista-pedido').innerHTML);
            setTimeout(() => { pantallaNuevoPedido(); }, 1500);
        } else {
            mostrarMensaje("Error al guardar.", "error");
            btn.disabled = false;
        }
    });
}

async function pantallaHistorial() {
    const area = document.getElementById('area-trabajo-pedidos');
    const pedidos = await window.api.obtenerPedidos();
    const totalCaja = pedidos.reduce((acc, p) => acc + p.total, 0);
    
    let html = `
        <h3>Historial</h3>
        <div class="panel-total-caja">
            <strong>Total: $${totalCaja}</strong>
        </div>
        <table class="tabla-datos">
            <thead>
                <tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Cadete</th><th>Pago</th><th>Total</th></tr>
            </thead>
            <tbody>`;
            
    pedidos.forEach(p => {
        html += `<tr><td>#${p.id}</td><td>${p.fecha}</td><td>${p.nombre || 'Anónimo'}</td><td>${p.id_cadete || '-'}</td><td>${p.metodo_pago}</td><td>$${p.total}</td></tr>`;
    });
    
    area.innerHTML = html + `</tbody></table>`;
}

function pantallaGestionClientes() {
    pantallaActiva.innerHTML = `
        <h2>Clientes</h2>
        <div class="formulario-linea">
            <input type="text" id="nom" class="input-base" placeholder="Nombre"/>
            <input type="text" id="tel" class="input-base" placeholder="Tel"/>
            <input type="text" id="dir" class="input-base" placeholder="Dirección"/>
            <button id="save-cli" class="btn-primario">Registrar</button>
        </div>`;
        
    document.getElementById('save-cli').addEventListener('click', async (e) => {
        const btn = e.target;
        const res = await window.api.guardarNuevoCliente({ 
            nombre: document.getElementById('nom').value, 
            telefono: document.getElementById('tel').value, 
            direccion: document.getElementById('dir').value 
        });
        
        if(res.exito) { 
            btn.textContent = "✅ Registrado";
            btn.style.backgroundColor = "var(--color-exito)"; 
            setTimeout(() => { pantallaGestionClientes(); }, 1000);
        }
    });
}

async function pantallaGestionMenu() {
    pantallaActiva.innerHTML = `
        <h2>Menú</h2>
        <div class="formulario-linea">
            <input type="text" id="p-nom" class="input-base" placeholder="Producto"/>
            <input type="number" id="p-pre" class="input-base" placeholder="Precio"/>
            <button id="btn-s-p" class="btn-primario">Guardar</button>
        </div>
        <hr>
        <div id="lista-p" class="grilla-items"></div>`;
        
    const lista = document.getElementById('lista-p');
    const productos = await window.api.buscarProductos(""); 
    productos.forEach(p => { 
        lista.innerHTML += `<div class="card-item">${p.nombre} - <strong>$${p.precio}</strong></div>`; 
    });

   document.getElementById('btn-s-p').addEventListener('click', async (e) => {
        const btn = e.target;
        const res = await window.api.guardarNuevoProducto({ 
            nombre: document.getElementById('p-nom').value, 
            precio: document.getElementById('p-pre').value 
        });
        if (res.exito) {
            btn.textContent = "✅ Guardado";
            btn.style.backgroundColor = "var(--color-exito)";
            btn.style.color = "white"; 
            setTimeout(() => { pantallaGestionMenu(); }, 1000);
        }
    });
}

async function pantallaGestionCadetes() {
    pantallaActiva.innerHTML = `
        <h2>Cadetes</h2>
        <div class="formulario-linea">
            <input type="text" id="c-nom" class="input-base" placeholder="Nombre"/>
            <button id="btn-s-c" class="btn-primario">Guardar</button>
        </div>
        <hr>
        <div id="lista-c" class="grilla-items"></div>`;
        
    const lista = document.getElementById('lista-c');
    const cadetes = await window.api.obtenerCadetes();
    cadetes.forEach(c => { 
        lista.innerHTML += `<div class="card-item">${c.nombre}</div>`; 
    });
        
    document.getElementById('btn-s-c').addEventListener('click', async (e) => {
        const btn = e.target;
        const res = await window.api.guardarNuevoCadete({ 
            nombre: document.getElementById('c-nom').value,
            telefono: "", 
            vehiculo: ""  
        });
        if (res.exito) {
            btn.textContent = "✅ Guardado";
            btn.style.backgroundColor = "var(--color-exito)";
            btn.style.color = "white";
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
    
    // Le damos un momento para que el navegador renderice el iframe antes de imprimir
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
}