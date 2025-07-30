let todasLasSolicitudes = [];

function crearTarjetaRestaurante(solicitud) {
    const card = document.createElement('div');
    card.className = 'restaurante-card';
    
    const identificador = solicitud.correo || solicitud.id || 'sin-identificador';
    const tipoId = solicitud.correo ? 'correo' : 'id';
    
    card.onclick = () => {
        if (tipoId === 'correo') {
            window.location.href = `vistaRestaurante.html?correo=${encodeURIComponent(identificador)}`;
        } else {
            window.location.href = `vistaRestaurante.html?id=${identificador}`;
        }
    };

    card.innerHTML = `
        <img class="restaurante-img" src="${solicitud.imagen1 || '../images/img_rest2.jpg'}" alt="Restaurante ${solicitud.restaurante}">
        <div class="restaurante-info">
            <h3 class="restaurante-nombre">${solicitud.restaurante}</h3>
        </div>
    `;
    
    return card;
}

function mostrarRestaurantes(solicitudes) {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    container.innerHTML = '';

    if (solicitudes.length === 0) {
        container.innerHTML = '<p class="mensaje-sin-resultados">No se encontraron restaurantes.</p>';
        return;
    }

    solicitudes.forEach(solicitud => {
        const card = crearTarjetaRestaurante(solicitud);
        container.appendChild(card);
    });
}

function buscarRestaurantes(termino) {
    if (!termino.trim()) {
        aplicarFiltros();
        return;
    }

    const restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => 
        solicitud.restaurante && 
        solicitud.restaurante.toLowerCase().includes(termino.toLowerCase())
    );

    mostrarRestaurantes(restaurantesFiltrados);
}

function restauranteTieneEtiqueta(restaurante, etiqueta) {
    if (!etiqueta || etiqueta === '') return true;
    
    const etiquetasRestaurante = [
        restaurante.etiqueta1,
        restaurante.etiqueta2,
        restaurante.etiqueta3
    ].filter(e => e && e !== '' && e !== 'Seleccionar');
    
    return etiquetasRestaurante.some(e => 
        e && e.toLowerCase() === etiqueta.toLowerCase()
    );
}

function aplicarFiltros() {
    const filtroTipoComida = document.getElementById('filtroTipoComida')?.value || '';
    const filtroAmbiente = document.getElementById('filtroAmbiente')?.value || '';
    const filtroServicios = document.getElementById('filtroServicios')?.value || '';
    const terminoBusqueda = document.querySelector('.barra-busqueda input[type="text"]')?.value || '';

    let restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => {
        const coincideBusqueda = !terminoBusqueda.trim() || 
            (solicitud.restaurante && solicitud.restaurante.toLowerCase().includes(terminoBusqueda.toLowerCase()));
        
        const coincideTipoComida = restauranteTieneEtiqueta(solicitud, filtroTipoComida);
        const coincideAmbiente = restauranteTieneEtiqueta(solicitud, filtroAmbiente);
        const coincideServicios = restauranteTieneEtiqueta(solicitud, filtroServicios);

        return coincideBusqueda && coincideTipoComida && coincideAmbiente && coincideServicios;
    });

    mostrarRestaurantes(restaurantesFiltrados);
}

function limpiarFiltros() {
    const filtros = ['filtroTipoComida', 'filtroAmbiente', 'filtroServicios'];
    filtros.forEach(filtroId => {
        const filtro = document.getElementById(filtroId);
        if (filtro) filtro.value = '';
    });

    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    if (inputBusqueda) inputBusqueda.value = '';

    mostrarRestaurantes(todasLasSolicitudes);
}

function configurarBusqueda() {
    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    const botonBuscar = document.querySelector('.barra-busqueda .buscar');

    if (inputBusqueda && botonBuscar) {
        botonBuscar.addEventListener('click', () => {
            aplicarFiltros();
        });

        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });

        inputBusqueda.addEventListener('input', (e) => {
            aplicarFiltros();
        });
    }

    const filtros = ['filtroTipoComida', 'filtroAmbiente', 'filtroServicios'];
    filtros.forEach(filtroId => {
        const filtro = document.getElementById(filtroId);
        if (filtro) {
            filtro.addEventListener('change', () => {
                console.log(`🏷️ Filtro ${filtroId} cambiado a: ${filtro.value}`);
                aplicarFiltros();
            });
        }
    });

    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            limpiarFiltros();
        });
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    try {
        console.log('Intentando cargar solicitudes...');
        
        const response = await fetch('http://75.101.159.172:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const solicitudes = await response.json();
        console.log('Solicitudes recibidas:', solicitudes);

        todasLasSolicitudes = solicitudes.filter(solicitud => 
            solicitud.estado === 'aprobado' || 
            solicitud.estado === 'Aprobado' ||
            solicitud.estado === 'APROBADO'
        );

        console.log('Solicitudes aprobadas:', todasLasSolicitudes);

        if (todasLasSolicitudes.length === 0) {
            container.innerHTML = '<p class="mensaje-sin-restaurantes">No hay restaurantes disponibles.</p>';
            return;
        }

        mostrarRestaurantes(todasLasSolicitudes);

        configurarBusqueda();

    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        container.innerHTML = '<p class="mensaje-error">Error al cargar restaurantes. Revisa la consola para más detalles.</p>';
    }
});