let todasLasSolicitudes = [];

async function crearTarjetaRestaurante(solicitud) {
    const card = document.createElement('div');
    card.className = 'restaurante-card';
    
    const identificador = solicitud.correo || solicitud.id_solicitud || solicitud.id || 'sin-identificador';
    const tipoId = solicitud.correo ? 'correo' : 'id';
    
    card.onclick = () => {
        if (tipoId === 'correo') {
            window.location.href = `vistaRestaurante.html?correo=${encodeURIComponent(identificador)}`;
        } else {
            window.location.href = `vistaRestaurante.html?id=${identificador}`;
        }
    };

    let imagenSrc = '../images/img_rest2.jpg';
    
    if (solicitud.id_restaurantero) {
        try {
            const response = await fetch(`http://52.23.26.163:7070/imagenes/restaurantero/${solicitud.id_restaurantero}`);
            if (response.ok) {
                const responseData = await response.json();
                const imagenes = responseData.data || responseData;
                if (Array.isArray(imagenes) && imagenes.length > 0) {
                    imagenSrc = imagenes[0].ruta_imagen;
                }
            }
        } catch (error) {
            console.log('Error al cargar imagen para tarjeta:', error);
        }
    }

    card.innerHTML = `
        <img class="restaurante-img" src="${imagenSrc}" alt="Restaurante ${solicitud.nombre_propuesto_restaurante || solicitud.restaurante}">
        <div class="restaurante-info">
            <h3 class="restaurante-nombre">${solicitud.nombre_propuesto_restaurante || solicitud.restaurante}</h3>
        </div>
    `;
    
    return card;
}

async function mostrarRestaurantes(solicitudes) {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    container.innerHTML = '';

    if (solicitudes.length === 0) {
        container.innerHTML = '<p class="mensaje-sin-resultados">No se encontraron restaurantes.</p>';
        return;
    }

    
    const tarjetas = await Promise.all(
        solicitudes.map(solicitud => crearTarjetaRestaurante(solicitud))
    );

    
    tarjetas.forEach(card => {
        container.appendChild(card);
    });
}

async function buscarRestaurantes(termino) {
    if (!termino.trim()) {
        await aplicarFiltros();
        return;
    }

    const restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => 
        (solicitud.nombre_propuesto_restaurante || solicitud.restaurante) && 
        (solicitud.nombre_propuesto_restaurante || solicitud.restaurante).toLowerCase().includes(termino.toLowerCase())
    );

    await mostrarRestaurantes(restaurantesFiltrados);
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

async function aplicarFiltros() {
    const filtroTipoComida = document.getElementById('filtroTipoComida')?.value || '';
    const filtroAmbiente = document.getElementById('filtroAmbiente')?.value || '';
    const filtroServicios = document.getElementById('filtroServicios')?.value || '';
    const terminoBusqueda = document.querySelector('.barra-busqueda input[type="text"]')?.value || '';

    let restaurantesFiltrados = todasLasSolicitudes.filter(solicitud => {
        const coincideBusqueda = !terminoBusqueda.trim() || 
            ((solicitud.nombre_propuesto_restaurante || solicitud.restaurante) && 
             (solicitud.nombre_propuesto_restaurante || solicitud.restaurante).toLowerCase().includes(terminoBusqueda.toLowerCase()));
        
        const coincideTipoComida = restauranteTieneEtiqueta(solicitud, filtroTipoComida);
        const coincideAmbiente = restauranteTieneEtiqueta(solicitud, filtroAmbiente);
        const coincideServicios = restauranteTieneEtiqueta(solicitud, filtroServicios);

        return coincideBusqueda && coincideTipoComida && coincideAmbiente && coincideServicios;
    });

    await mostrarRestaurantes(restaurantesFiltrados);
}

async function limpiarFiltros() {
    const filtros = ['filtroTipoComida', 'filtroAmbiente', 'filtroServicios'];
    filtros.forEach(filtroId => {
        const filtro = document.getElementById(filtroId);
        if (filtro) filtro.value = '';
    });

    const inputBusqueda = document.querySelector('.barra-busqueda input[type="text"]');
    if (inputBusqueda) inputBusqueda.value = '';

    await mostrarRestaurantes(todasLasSolicitudes);
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
        
        const response = await fetch('http://52.23.26.163:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Respuesta completa del servidor:', responseData);

        
        const solicitudes = responseData.data || responseData;
        console.log('Solicitudes recibidas:', solicitudes);

        
        if (!Array.isArray(solicitudes)) {
            throw new Error('La respuesta no contiene un array de solicitudes válido');
        }

        todasLasSolicitudes = solicitudes.filter(solicitud => 
            solicitud.estado === 'aprobado' || 
            solicitud.estado === 'Aprobado' ||
            solicitud.estado === 'APROBADO'
        );

        console.log('Solicitudes aprobadas:', todasLasSolicitudes);
        console.log('Estados disponibles:', solicitudes.map(s => `${s.nombre_propuesto_restaurante}: ${s.estado}`));

        if (todasLasSolicitudes.length === 0) {
            container.innerHTML = '<p class="mensaje-sin-restaurantes">No hay restaurantes disponibles.</p>';
            return;
        }

        await mostrarRestaurantes(todasLasSolicitudes);

        configurarBusqueda();

    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        container.innerHTML = '<p class="mensaje-error">Error al cargar restaurantes. Revisa la consola para más detalles.</p>';
    }
});