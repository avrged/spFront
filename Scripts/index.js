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
        // Si no hay término de búsqueda, mostrar todos los restaurantes
        mostrarRestaurantes(todasLasSolicitudes);
        return;
    }

    // Filtrar restaurantes que contengan el término en su nombre (sin distinguir mayúsculas/minúsculas)
    const restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => 
        solicitud.restaurante && 
        solicitud.restaurante.toLowerCase().includes(termino.toLowerCase())
    );

    mostrarRestaurantes(restaurantesFiltrados);
}

// Configurar eventos de búsqueda
function configurarBusqueda() {
    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    const botonBuscar = document.querySelector('.barra-busqueda .buscar');

    if (inputBusqueda && botonBuscar) {
        // Búsqueda al hacer clic en el botón
        botonBuscar.addEventListener('click', () => {
            const termino = inputBusqueda.value;
            buscarRestaurantes(termino);
        });

        // Búsqueda al presionar Enter
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const termino = inputBusqueda.value;
                buscarRestaurantes(termino);
            }
        });

        // Búsqueda en tiempo real mientras escribe
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value;
            buscarRestaurantes(termino);
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

        // Configurar la funcionalidad de búsqueda
        configurarBusqueda();

    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        container.innerHTML = '<p>Error al cargar restaurantes. Revisa la consola para más detalles.</p>';
    }
});