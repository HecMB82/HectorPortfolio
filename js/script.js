/* RELOJ Y FECHA */

function actualizarReloj() {
    const ahora = new Date();

    const hora = ahora.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const fecha = ahora.toLocaleDateString("es-ES");

    document.getElementById("hora").textContent = hora;
    document.getElementById("fecha").textContent = fecha;
}

actualizarReloj();

setInterval(actualizarReloj, 1000);

/* TIEMPO METEREOLOGÓGICO*/

const botonTiempo = document.getElementById("boton_tiempo");
const temperatura = document.getElementById("temperatura");
const iconoTiempo = document.getElementById("icono_tiempo");

botonTiempo.addEventListener("click", obtenerUbicacion);

consultarTiempo(40.4168, -3.7038);

function obtenerUbicacion() {

    if (!navigator.geolocation) {
        temperatura.textContent = "No disponible";
        return;
    }    

    navigator.geolocation.getCurrentPosition(
        function (posicion) {
            const latitud = posicion.coords.latitude;
            const longitud = posicion.coords.longitude;

            consultarTiempo(latitud, longitud);
            botonTiempo.title = "Tiempo de tu ubicación actual";
        },

        function (error) {
            temperatura.textContent = "No disponible";
            console.error("Error de ubicación:", error.message);
        }
    );
}

async function consultarTiempo(latitud, longitud) {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,weather_code&timezone=auto`;

    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar el tiempo");
        }

        const datos = await respuesta.json();

        const grados = datos.current.temperature_2m;
        const codigo = datos.current.weather_code;

        temperatura.textContent = `${Math.round(grados)}°C`;

        if (codigo === 0) {
            iconoTiempo.textContent = "☀";
        } else if (codigo >= 1 && codigo <= 3) {
            iconoTiempo.textContent = "☁";
        } else if (codigo >= 51 && codigo <= 67) {
            iconoTiempo.textContent = "☂";
        } else if (codigo >= 71 && codigo <= 77) {
            iconoTiempo.textContent = "❄";
        } else if (codigo >= 95) {
            iconoTiempo.textContent = "⚡";
        } else {
            iconoTiempo.textContent = "☁";
        }

    } catch (error) {
        temperatura.textContent = "No disponible";
        console.error("Error meteorológico:", error);
    }
}


/* SISTEMA DE VENTANAS HEC.OS */

const accesosDirectos = document.querySelectorAll("[data-ventana]");
const ventanas = document.querySelectorAll(".ventana");
const barraVentanas = document.getElementById("ventanas_barra");

let zIndexActual = 10;
let contadorVentanas = 0;

const desplazamientoHorizontal = 50;
const desplazamientoVertical = 50;


function posicionarVentana(ventana) {

    const escritorio = document.querySelector(".fondo_escritorio");

    const anchoDisponible = escritorio.clientWidth;
    const altoDisponible = escritorio.clientHeight;

    const anchoVentana = ventana.offsetWidth;
    const altoVentana = ventana.offsetHeight;

    const posicionCascada = contadorVentanas % 5;

    const desplazamientoX = posicionCascada * desplazamientoHorizontal;
    const desplazamientoY = posicionCascada * desplazamientoVertical;

    const posicionX = Math.max(0, Math.min(
        (anchoDisponible - anchoVentana) / 2 + desplazamientoX,
        anchoDisponible - anchoVentana
    ));

    const posicionY = Math.max(0, Math.min(
        altoDisponible * 0.15 + desplazamientoY,
        altoDisponible - altoVentana
    ));

    ventana.style.transform = "none";
    ventana.style.left = posicionX + "px";
    ventana.style.top = posicionY + "px";

    contadorVentanas++;
}


// Traer una ventana al frente
function activarVentana(ventana) {
    zIndexActual++;
    ventana.style.zIndex = zIndexActual;

    document.querySelectorAll(".boton_ventana_barra").forEach(function (boton) {
        boton.classList.toggle(
            "activa",
            boton.dataset.ventana === ventana.id
        );
    });
}

// Crear o recuperar el botón de una ventana
function obtenerBotonBarra(ventana) {
    let boton = barraVentanas.querySelector(
        `[data-ventana="${ventana.id}"]`
    );

    if (!boton) {
        boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton_ventana_barra";
        boton.dataset.ventana = ventana.id;
        
        const acceso = document.querySelector(
            `[data-ventana="${ventana.id}"]`
        );

        const imagenOriginal = acceso.querySelector("img");

        const imagen = document.createElement("img");
        imagen.src = imagenOriginal.src;
        imagen.alt = "";

        boton.appendChild(imagen);

        boton.title = ventana.querySelector(".barra_ventana span").textContent;
        boton.setAttribute("aria-label", boton.title);

        boton.addEventListener("click", function () {
            if (ventana.hidden) {
                ventana.hidden = false;
                activarVentana(ventana);
            } else {
                ventana.hidden = true;
                boton.classList.remove("activa");
            }
        });

        barraVentanas.appendChild(boton);
    }

    return boton;
}

// Abrir ventanas desde los iconos
accesosDirectos.forEach(function (acceso) {

    acceso.addEventListener("click", function () {

        const ventana = document.getElementById(acceso.dataset.ventana);

        if (!ventana) return;

        const estabaCerrada = !ventana.dataset.abierta;

        ventana.hidden = false;

        if (estabaCerrada) {
            posicionarVentana(ventana);
            ventana.dataset.abierta = "true";
        }

        if (ventana.id !== "ventana_acerca_de") {
            obtenerBotonBarra(ventana);
        }

        activarVentana(ventana);
    });

});


// Comportamiento de cada ventana
ventanas.forEach(function (ventana) {

    // Activar al hacer clic
    ventana.addEventListener("pointerdown", function () {
        activarVentana(ventana);
    });

    // Cerrar
    ventana.querySelector(".cerrar_ventana").addEventListener("click", function () {
        ventana.hidden = true;
        delete ventana.dataset.abierta;

        const quedanVentanasAbiertas = Array.from(ventanas).some(function (v) {
        return v.dataset.abierta === "true";
        });

        if (!quedanVentanasAbiertas) {
            contadorVentanas = 0;
        }

        const boton = barraVentanas.querySelector(
            `[data-ventana="${ventana.id}"]`
        );

        if (boton) {
            boton.remove();
        }
    });

    // Minimizar
    ventana.querySelector(".minimizar_ventana").addEventListener("click", function () {
        ventana.hidden = true;

        if (ventana.id !== "ventana_acerca_de") {
            const boton = obtenerBotonBarra(ventana);
            boton.classList.remove("activa");
        }
    });

    // Arrastrar desde la barra de título
    const barraTitulo = ventana.querySelector(".barra_ventana");

    barraTitulo.addEventListener("pointerdown", function (evento) {

        if (evento.target.closest("button")) return;
        if (evento.button !== 0) return;

        activarVentana(ventana);

        const rectangulo = ventana.getBoundingClientRect();
        const escritorio = document.querySelector(".fondo_escritorio");
        const rectEscritorio = escritorio.getBoundingClientRect();

        const desplazamientoX = evento.clientX - rectangulo.left;
        const desplazamientoY = evento.clientY - rectangulo.top;

        ventana.style.transform = "none";
        ventana.style.left = (rectangulo.left - rectEscritorio.left) + "px";
        ventana.style.top = (rectangulo.top - rectEscritorio.top) + "px";

        barraTitulo.setPointerCapture(evento.pointerId);

        function moverVentana(eventoMovimiento) {
            const nuevaX = eventoMovimiento.clientX
                - rectEscritorio.left - desplazamientoX;

            const nuevaY = eventoMovimiento.clientY
                - rectEscritorio.top - desplazamientoY;

            const maxX = Math.max(0, escritorio.clientWidth - ventana.offsetWidth);
            const maxY = Math.max(0, escritorio.clientHeight - barraTitulo.offsetHeight);

            ventana.style.left = Math.max(0, Math.min(nuevaX, maxX)) + "px";
            ventana.style.top = Math.max(0, Math.min(nuevaY, maxY)) + "px";
        }

        function terminarArrastre() {
            barraTitulo.removeEventListener("pointermove", moverVentana);
            barraTitulo.removeEventListener("pointerup", terminarArrastre);
            barraTitulo.removeEventListener("pointercancel", terminarArrastre);
        }

        barraTitulo.addEventListener("pointermove", moverVentana);
        barraTitulo.addEventListener("pointerup", terminarArrastre);
        barraTitulo.addEventListener("pointercancel", terminarArrastre);
    });
});


/* ========================================
   EXPLORADOR DE PROYECTOS
======================================== */

const botonesProyectos = document.querySelectorAll(".elemento_proyecto");
const fichasProyectos = document.querySelectorAll(".ficha_proyecto");

botonesProyectos.forEach(boton => {

    boton.addEventListener("click", () => {

        // Deseleccionar todas las carpetas
        botonesProyectos.forEach(elemento => {
            elemento.classList.remove("seleccionado");
        });

        // Seleccionar la carpeta pulsada
        boton.classList.add("seleccionado");

        // Ocultar todas las fichas
        fichasProyectos.forEach(ficha => {
            ficha.hidden = true;
        });

        // Mostrar la ficha correspondiente
        const proyecto = boton.dataset.proyecto;
        const fichaSeleccionada = document.getElementById("proyecto_" + proyecto);

        if (fichaSeleccionada) {
            fichaSeleccionada.hidden = false;
        }

    });

});


/* ========================================
   CUADRÍCULA UNIFORME DEL ESCRITORIO
   - Casillas idénticas en toda el área disponible
   - Iconos centrados en cada casilla
   - Papelera móvil, inicialmente abajo a la derecha
   - Posiciones guardadas por icono
======================================== */

const zonaIconos = document.querySelector(".iconos_escritorio");
const iconosMovibles = Array.from(
    zonaIconos.querySelectorAll(".acceso_directo")
);

// Clave nueva: evita recuperar índices de la cuadrícula antigua.
const claveIconos = "hecos_posiciones_iconos_v2";
const margenMinimoCeldaX = 104;
const margenMinimoCeldaY = 112;

let posicionesIconos = {};
let columnasIconos = 1;
let filasIconos = 1;
let anchoCelda = 1;
let altoCelda = 1;
let ignorarClickIcono = null;

try {
    const guardado = JSON.parse(localStorage.getItem(claveIconos));
    if (guardado && typeof guardado === "object") {
        posicionesIconos = guardado;
    }
} catch (error) {
    posicionesIconos = {};
}

function idIcono(icono) {
    return icono.dataset.ventana;
}

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}

// Dividimos TODO el ancho y alto en casillas del mismo tamaño.
// Los márgenes superior/inferior e izquierdo/derecho quedan simétricos.
function calcularCuadricula() {
    const ancho = Math.max(1, zonaIconos.clientWidth);
    const alto = Math.max(1, zonaIconos.clientHeight);

    columnasIconos = Math.max(1, Math.floor(ancho / margenMinimoCeldaX));
    filasIconos = Math.max(1, Math.floor(alto / margenMinimoCeldaY));

    // Aseguramos seis casillas incluso en pantallas pequeñas.
    while (columnasIconos * filasIconos < iconosMovibles.length) {
        if (alto / filasIconos >= ancho / columnasIconos) {
            filasIconos++;
        } else {
            columnasIconos++;
        }
    }

    anchoCelda = ancho / columnasIconos;
    altoCelda = alto / filasIconos;
}

const margenEscritorio = 10;

function centroCasilla(columna, fila) {
    const anchoUtil = zonaIconos.clientWidth - margenEscritorio * 2;
    const altoUtil = zonaIconos.clientHeight - margenEscritorio * 2;

    return {
        x: margenEscritorio + (columna + 0.5) * (anchoUtil / columnasIconos),
        y: margenEscritorio + (fila + 0.5) * (altoUtil / filasIconos)
    };
}

function indiceCasilla(columna, fila) {
    return columna * filasIconos + fila;
}

// Guardamos coordenadas proporcionales para adaptarlas a cambios de pantalla.
function posicionGuardada(icono, indice) {
    const guardada = posicionesIconos[idIcono(icono)];
    if (guardada && Number.isFinite(guardada.x) &&
        Number.isFinite(guardada.y)) {
        return {
            columna: limitar(Math.round(guardada.x * (columnasIconos - 1)),
                             0, columnasIconos - 1),
            fila: limitar(Math.round(guardada.y * (filasIconos - 1)),
                          0, filasIconos - 1)
        };
    }

    if (idIcono(icono) === "ventana_papelera") {
        return { columna: columnasIconos - 1, fila: filasIconos - 1 };
    }

    // Los cinco accesos iniciales empiezan de arriba abajo.
    return {
        columna: Math.floor(indice / filasIconos),
        fila: indice % filasIconos
    };
}

function buscarCasillaLibre(columna, fila, ocupadas) {
    let mejor = null;
    let distancia = Infinity;

    for (let c = 0; c < columnasIconos; c++) {
        for (let f = 0; f < filasIconos; f++) {
            const indice = indiceCasilla(c, f);
            if (ocupadas.has(indice)) continue;

            const d = Math.pow(c - columna, 2) + Math.pow(f - fila, 2);
            if (d < distancia) {
                mejor = { columna: c, fila: f };
                distancia = d;
            }
        }
    }
    return mejor;
}

let casillasActuales = {};

function organizarIconos() {
    calcularCuadricula();
    const ocupadas = new Set();
    const nuevas = {};

    // Se reserva primero la posición de la papelera, si corresponde.
    const orden = [...iconosMovibles].sort((a, b) =>
        (idIcono(a) === "ventana_papelera" ? -1 : 0) -
        (idIcono(b) === "ventana_papelera" ? -1 : 0)
    );

    orden.forEach(icono => {
        const indice = iconosMovibles.indexOf(icono);
        const preferida = posicionGuardada(icono, indice);
        const casilla = buscarCasillaLibre(
            preferida.columna, preferida.fila, ocupadas
        );
        if (!casilla) return;

        ocupadas.add(indiceCasilla(casilla.columna, casilla.fila));
        nuevas[idIcono(icono)] = casilla;

        const centro = centroCasilla(casilla.columna, casilla.fila);
        icono.style.left = centro.x + "px";
        icono.style.top = centro.y + "px";
    });

    casillasActuales = nuevas;
}

function guardarPosicionesIconos() {
    const datos = {};
    for (const icono of iconosMovibles) {
        const casilla = casillasActuales[idIcono(icono)];
        if (!casilla) continue;
        datos[idIcono(icono)] = {
            x: columnasIconos > 1 ? casilla.columna / (columnasIconos - 1) : 0,
            y: filasIconos > 1 ? casilla.fila / (filasIconos - 1) : 0
        };
    }
    posicionesIconos = datos;
    try {
        localStorage.setItem(claveIconos, JSON.stringify(datos));
    } catch (error) {
        console.warn("No se pudieron guardar las posiciones", error);
    }
}

zonaIconos.addEventListener("click", function (evento) {
    const icono = evento.target.closest(".acceso_directo");
    if (icono && icono === ignorarClickIcono) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        ignorarClickIcono = null;
    }
}, true);

iconosMovibles.forEach(icono => {
    let arrastre = null;

    icono.addEventListener("pointerdown", evento => {
        if (evento.button !== 0) return;
        ignorarClickIcono = null;

        arrastre = {
            pointerId: evento.pointerId,
            inicioX: evento.clientX,
            inicioY: evento.clientY,
            centroX: parseFloat(icono.style.left),
            centroY: parseFloat(icono.style.top),
            movido: false
        };
        icono.setPointerCapture(evento.pointerId);
    });

    icono.addEventListener("pointermove", evento => {
        if (!arrastre || evento.pointerId !== arrastre.pointerId) return;

        const dx = evento.clientX - arrastre.inicioX;
        const dy = evento.clientY - arrastre.inicioY;
        if (!arrastre.movido && Math.hypot(dx, dy) < 6) return;

        arrastre.movido = true;
        icono.style.left = limitar(arrastre.centroX + dx, 0,
                                  zonaIconos.clientWidth) + "px";
        icono.style.top = limitar(arrastre.centroY + dy, 0,
                                 zonaIconos.clientHeight) + "px";
        icono.style.zIndex = "6";
    });

    icono.addEventListener("pointerup", evento => {
        if (!arrastre || evento.pointerId !== arrastre.pointerId) return;
        const movido = arrastre.movido;
        arrastre = null;
        icono.style.zIndex = "";

        if (!movido) return;
        ignorarClickIcono = icono;

        // La casilla de destino se calcula por el CENTRO del icono.
        const x = parseFloat(icono.style.left);
        const y = parseFloat(icono.style.top);
        const columna = limitar(Math.floor(x / anchoCelda),
                                0, columnasIconos - 1);
        const fila = limitar(Math.floor(y / altoCelda),
                             0, filasIconos - 1);
        const destino = { columna, fila };
        const id = idIcono(icono);
        const origen = casillasActuales[id];

        const otroIcono = iconosMovibles.find(otro => {
            if (otro === icono) return false;
            const p = casillasActuales[idIcono(otro)];
            return p && p.columna === columna && p.fila === fila;
        });

        casillasActuales[id] = destino;
        if (otroIcono && origen) {
            casillasActuales[idIcono(otroIcono)] = origen;
        }

        // Colocamos todos exactamente en el centro de sus casillas.
        iconosMovibles.forEach(otro => {
            const p = casillasActuales[idIcono(otro)];
            if (!p) return;
            const centro = centroCasilla(p.columna, p.fila);
            otro.style.left = centro.x + "px";
            otro.style.top = centro.y + "px";
        });

        guardarPosicionesIconos();
    });

    icono.addEventListener("pointercancel", () => {
        arrastre = null;
        icono.style.zIndex = "";
        organizarIconos();
    });
});

organizarIconos();

window.addEventListener("resize", organizarIconos);





