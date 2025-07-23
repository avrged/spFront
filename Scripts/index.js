// Variable global para almacenar todas las solicitudes aprobadas
let todasLasSolicitudes = [];

// Función para crear una tarjeta de restaurante
function crearTarjetaRestaurante(solicitud) {
    const card = document.createElement('div');
    card.className = 'restaurante-card';
    
    // Usar correo como identificador principal, ID como fallback
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

// Función para mostrar restaurantes en el contenedor
function mostrarRestaurantes(solicitudes) {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    container.innerHTML = '';

    if (solicitudes.length === 0) {
        container.innerHTML = '<p>No se encontraron restaurantes.</p>';
        return;
    }

    solicitudes.forEach(solicitud => {
        const card = crearTarjetaRestaurante(solicitud);
        container.appendChild(card);
    });
}

// Función de búsqueda
function buscarRestaurantes(termino) {
    if (!termino.trim()) {
        // Si no hay término de búsqueda, aplicar filtros actuales
        aplicarFiltros();
        return;
    }

    // Filtrar restaurantes que contengan el término en su nombre (sin distinguir mayúsculas/minúsculas)
    const restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => 
        solicitud.restaurante && 
        solicitud.restaurante.toLowerCase().includes(termino.toLowerCase())
    );

    mostrarRestaurantes(restaurantesFiltrados);
}

// Función para verificar si un restaurante tiene una etiqueta específica
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

// Función para aplicar todos los filtros activos
function aplicarFiltros() {
    // Obtener valores de los filtros
    const filtroTipoComida = document.getElementById('filtroTipoComida')?.value || '';
    const filtroAmbiente = document.getElementById('filtroAmbiente')?.value || '';
    const filtroServicios = document.getElementById('filtroServicios')?.value || '';
    const terminoBusqueda = document.querySelector('.barra-busqueda input[type="text"]')?.value || '';

    console.log('🔍 Aplicando filtros:', {
        tipoComida: filtroTipoComida,
        ambiente: filtroAmbiente,
        servicios: filtroServicios,
        busqueda: terminoBusqueda
    });

    // Filtrar restaurantes
    let restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => {
        // Filtro por búsqueda de texto
        const coincideBusqueda = !terminoBusqueda.trim() || 
            (solicitud.restaurante && solicitud.restaurante.toLowerCase().includes(terminoBusqueda.toLowerCase()));
        
        // Filtros por etiquetas
        const coincideTipoComida = restauranteTieneEtiqueta(solicitud, filtroTipoComida);
        const coincideAmbiente = restauranteTieneEtiqueta(solicitud, filtroAmbiente);
        const coincideServicios = restauranteTieneEtiqueta(solicitud, filtroServicios);

        return coincideBusqueda && coincideTipoComida && coincideAmbiente && coincideServicios;
    });

    console.log(`📊 Restaurantes filtrados: ${restaurantesFiltrados.length} de ${todasLasSolicitudes.length}`);
    mostrarRestaurantes(restaurantesFiltrados);
}

// Función para limpiar todos los filtros
function limpiarFiltros() {
    // Limpiar selects de filtros
    const filtros = ['filtroTipoComida', 'filtroAmbiente', 'filtroServicios'];
    filtros.forEach(filtroId => {
        const filtro = document.getElementById(filtroId);
        if (filtro) filtro.value = '';
    });

    // Limpiar barra de búsqueda
    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    if (inputBusqueda) inputBusqueda.value = '';

    // Mostrar todos los restaurantes
    mostrarRestaurantes(todasLasSolicitudes);
    
    console.log('🧹 Filtros limpiados - Mostrando todos los restaurantes');
}

// Configurar eventos de búsqueda y filtros
function configurarBusqueda() {
    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    const botonBuscar = document.querySelector('.barra-busqueda .buscar');

    if (inputBusqueda && botonBuscar) {
        // Búsqueda al hacer clic en el botón
        botonBuscar.addEventListener('click', () => {
            aplicarFiltros();
        });

        // Búsqueda al presionar Enter
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });

        // Búsqueda en tiempo real mientras escribe
        inputBusqueda.addEventListener('input', (e) => {
            aplicarFiltros();
        });
    }

    // Configurar eventos para los filtros de etiquetas
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

    // Configurar botón de limpiar filtros
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
        
        // Hacer petición directa sin usar SazonAPI
        const response = await fetch('http://52.23.26.163:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const solicitudes = await response.json();
        console.log('Solicitudes recibidas:', solicitudes);

        // Filtrar solo las solicitudes aprobadas y guardarlas globalmente
        todasLasSolicitudes = solicitudes.filter(solicitud => 
            solicitud.estado === 'aprobado' || 
            solicitud.estado === 'Aprobado' ||
            solicitud.estado === 'APROBADO'
        );

        console.log('Solicitudes aprobadas:', todasLasSolicitudes);

        if (todasLasSolicitudes.length === 0) {
            container.innerHTML = '<p>No hay restaurantes aprobados disponibles.</p>';
            return;
        }

        // Mostrar todos los restaurantes inicialmente
        mostrarRestaurantes(todasLasSolicitudes);

        // Configurar la funcionalidad de búsqueda y filtros
        configurarBusqueda();

    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        container.innerHTML = '<p>Error al cargar restaurantes. Revisa la consola para más detalles.</p>';
    }
});