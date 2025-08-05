document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const correo = params.get('correo');
    if (!id && !correo) {
        console.warn('⚠️ No se proporcionó ID ni correo del restaurante - usando fallback');
    }

    async function verificarBackend(reintentos = 3) {
        for (let i = 0; i < reintentos; i++) {
            try {
                const response = await fetch('http://localhost:7070/solicitudes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
                
                if (response.status < 500) {
                    return true;
                }
                
                console.warn(`Intento ${i + 1}: Servidor responde pero con error ${response.status}`);
                if (i < reintentos - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.warn(`Intento ${i + 1}: Error de conexión:`, error.message);
                if (i < reintentos - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        return false;
    }

    try {
        console.log('🔍 Buscando restaurante con:', { id, correo });
        
        const backendDisponible = await verificarBackend();
        if (!backendDisponible) {
            throw new Error('Backend no disponible en http://localhost:7070');
        }

        const response = await fetch('http://localhost:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('📋 Respuesta completa:', responseData);
        
        const solicitudes = responseData.data || responseData;
        console.log('📋 Solicitudes obtenidas:', solicitudes);
        console.log('📊 Total de solicitudes:', solicitudes.length);
        
        if (!Array.isArray(solicitudes)) {
            throw new Error('La respuesta no contiene un array de solicitudes válido');
        }
        
        const solicitudesAprobadas = solicitudes.filter(s => 
            s.estado === 'aprobado' || 
            s.estado === 'Aprobado' ||
            s.estado === 'APROBADO'
        );
        
        console.log('✅ Solicitudes aprobadas encontradas:', solicitudesAprobadas.length);
        console.log('📊 Estados disponibles:', solicitudes.map(s => s.estado));
        
        if (solicitudesAprobadas.length > 0) {
            console.log('🔬 Estructura de datos (primer elemento aprobado):', Object.keys(solicitudesAprobadas[0]));
            console.log('🆔 Datos aprobados disponibles:', solicitudesAprobadas.map(s => ({
                id_solicitud: s.id_solicitud,
                nombre_propuesto_restaurante: s.nombre_propuesto_restaurante,
                estado: s.estado,
                correo: s.correo
            })));
        }
        
        let restauranteEncontrado = null;
        
        if (correo) {
            restauranteEncontrado = solicitudesAprobadas.find(s => 
                s.correo && s.correo.toLowerCase() === correo.toLowerCase()
            );
            if (restauranteEncontrado) {
                console.log('✅ Restaurante aprobado encontrado por correo:', correo);
            }
        }
        
        if (!restauranteEncontrado && id && id !== 'undefined' && id !== 'null') {
            restauranteEncontrado = solicitudesAprobadas.find(s => 
                s.id_solicitud == id || 
                s.id == id
            );
            if (restauranteEncontrado) {
                console.log('✅ Restaurante aprobado encontrado por ID:', id);
            }
        }
        
        if (!restauranteEncontrado && id && !isNaN(parseInt(id))) {
            const index = parseInt(id);
            if (index >= 0 && index < solicitudesAprobadas.length) {
                restauranteEncontrado = solicitudesAprobadas[index];
                console.log('✅ Restaurante aprobado encontrado por índice:', index);
            }
        }
        
        if (!restauranteEncontrado && solicitudesAprobadas.length > 0) {
            restauranteEncontrado = solicitudesAprobadas[0];
            console.log('✅ Usando primer restaurante aprobado disponible');
        }
        
        if (!restauranteEncontrado) {
            console.log('❌ No se encontraron restaurantes aprobados');
            console.log('Parámetros buscados:', { id, correo });
            console.log('Total solicitudes aprobadas:', solicitudesAprobadas.length);
            alert('No se encontraron restaurantes aprobados disponibles.');
            return;
        }

        console.log('✅ Restaurante aprobado encontrado:', restauranteEncontrado);
        console.log('📋 Estado del restaurante:', restauranteEncontrado.estado);

        if (restauranteEncontrado.id_restaurantero) {
            sessionStorage.setItem('id_restaurantero', restauranteEncontrado.id_restaurantero);
            localStorage.setItem('id_restaurantero', restauranteEncontrado.id_restaurantero);
        }

        window.restauranteActual = restauranteEncontrado;

        cargarDatosRestaurante(restauranteEncontrado);
        
    } catch (error) {
        console.error('Error al cargar restaurante:', error);
        
        if (error.message.includes('fetch')) {
            alert('Error de conexión: No se puede conectar al servidor.');
        } else if (error.message.includes('404')) {
            alert('Endpoint no encontrado: Verifique la configuración del servidor.');
        } else if (error.message.includes('500')) {
            alert('Error del servidor: Contacte al administrador.');
        } else {
            alert(`Error al cargar la información del restaurante: ${error.message}`);
        }
    }

    async function cargarDatosRestaurante(restauranteSolicitud) {
        try {
            const idRestaurantero = restauranteSolicitud.id_restaurantero;
            if (!idRestaurantero) {
                console.warn('No se encontró id_restaurantero para cargar datos completos');
                return;
            }

            const response = await fetch(`http://localhost:7070/restaurantes/restaurantero/${idRestaurantero}`);
            if (!response.ok) {
                throw new Error(`Error al obtener datos del restaurante: HTTP ${response.status}`);
            }
            const data = await response.json();
            const restaurante = (data.data && data.data.length > 0) ? data.data[0] : null;
            if (!restaurante) {
                throw new Error('No se encontraron datos del restaurante');
            }

            let menuUrl = null;
            try {
                const menuResponse = await fetch(`http://localhost:7070/menus/restaurantero/${idRestaurantero}`);
                if (menuResponse.ok) {
                    const menuData = await menuResponse.json();
                    if (menuData && menuData.data && menuData.data.length > 0) {
                        menuUrl = menuData.data[0].ruta_menu || menuData.data[0].ruta_archivo || null;
                    }
                }
            } catch (e) {
                console.warn('No se pudo obtener el menú del restaurante:', e);
            }
            restaurante.menu = menuUrl;
            window.restauranteActual = restaurante;

            const nombreElement = document.querySelector('.restaurante-nombre');
            if (nombreElement) nombreElement.textContent = restaurante.nombre || 'Restaurante sin nombre';

            const caracteristicas = document.querySelector('.caracteristicas-lista');
            if (caracteristicas) {
                const etiquetasArray = typeof restaurante.etiquetas === 'string'
                    ? restaurante.etiquetas.split(',').map(e => e.trim()).filter(e => e)
                    : [];
                caracteristicas.innerHTML = etiquetasArray.length > 0
                    ? etiquetasArray.map(etiqueta =>
                        `<div class='caracteristica-item'>
                            <img src='../images/etiqueta.png' alt='Etiqueta' class='icon-etiqueta' />
                            <span class='caracteristica'>${etiqueta}</span>
                        </div>`
                    ).join('')
                    : '<span style="color:#888">No hay características disponibles</span>';
            }

            const horarios = document.querySelector('.restaurante-horarios');
            if (horarios) {
                horarios.innerHTML = `
                    <h2>Horarios</h2>
                    <div><img src='../images/reloj.png' alt='Horario' class='icon-16' /> ${restaurante.horario || 'No especificado'}</div>
                `;
            }

            const contactos = document.querySelector('.restaurante-contactos');
            if (contactos) {
                contactos.innerHTML = `
                    <h2>Contactos</h2>
                    <div><img src='../images/llamada.png' alt='Teléfono' class='icon-16' /> ${restaurante.telefono || 'No especificado'}</div>
                    <div><img src='../images/facebook.png' alt='Facebook' class='icon-16' /> ${restaurante.facebook || 'No especificado'}</div>
                    <div><img src='../images/instagram.png' alt='Instagram' class='icon-16' /> ${restaurante.instagram || 'No especificado'}</div>
                `;
            }

            const ubicacion = document.querySelector('.restaurante-ubicacion');
            if (ubicacion) {
                ubicacion.innerHTML = `
                    <h2>Ubicación</h2>
                    <div><img src='../images/ubicacion.png' alt='Ubicación' class='icon-16' /> ${restaurante.direccion || 'No especificada'}</div>
                `;
            }

            cargarImagenesRestaurante(restaurante);

            console.log('✅ Datos del restaurante cargados:', restaurante);

        } catch (error) {
            console.error('Error al cargar datos en la vista:', error);
        }
    }

    async function cargarImagenesRestaurante(restaurante) {
        try {
            const idRestaurantero = restaurante.id_restaurantero;
            if (!idRestaurantero) {
                console.warn('No se encontró id_restaurantero para cargar imágenes');
                cargarImagenesDefault();
                return;
            }

            console.log('🖼️ Cargando imágenes para restaurantero:', idRestaurantero);

            const response = await fetch(`http://localhost:7070/imagenes/restaurantero/${idRestaurantero}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                console.warn(`Error al cargar imágenes: HTTP ${response.status}`);
                cargarImagenesDefault();
                return;
            }

            const responseData = await response.json();
            console.log('📸 Respuesta de imágenes:', responseData);

            const imagenes = responseData.data || responseData;
            
            if (!Array.isArray(imagenes) || imagenes.length === 0) {
                console.warn('No se encontraron imágenes para este restaurante');
                cargarImagenesDefault();
                return;
            }

            const imgPrincipal = document.querySelector('.galeria-principal');
            if (imgPrincipal && imagenes.length > 0) {
                const imagenPrincipal = imagenes[0].ruta_imagen;
                imgPrincipal.src = imagenPrincipal;
                imgPrincipal.alt = `Imagen principal de ${restaurante.nombre_propuesto_restaurante}`;
                console.log('🖼️ Imagen principal cargada:', imagenPrincipal);
            }

            const galeriaSecundaria = document.querySelector('.galeria-secundaria');
            if (galeriaSecundaria) {
                const imagenesSecundarias = imagenes.slice(1); 
                
                galeriaSecundaria.innerHTML = imagenesSecundarias.length > 0
                    ? imagenesSecundarias.map(img => 
                        `<img src='${img.ruta_imagen}' alt='Imagen restaurante' class='galeria-thumb' />`
                    ).join('')
                    : '<span style="color:#888">No hay imágenes adicionales</span>';

                console.log('🖼️ Imágenes secundarias cargadas:', imagenesSecundarias.length);
            }

            console.log(`✅ Se cargaron ${imagenes.length} imágenes del restaurante`);

        } catch (error) {
            console.error('Error al cargar imágenes del restaurante:', error);
            cargarImagenesDefault();
        }
    }

    function cargarImagenesDefault() {
        console.log('🖼️ Cargando imágenes por defecto');
        
        const imgPrincipal = document.querySelector('.galeria-principal');
        if (imgPrincipal) {
            imgPrincipal.src = '../images/img_rest2.jpg';
            imgPrincipal.alt = 'Imagen por defecto del restaurante';
        }

        const galeriaSecundaria = document.querySelector('.galeria-secundaria');
        if (galeriaSecundaria) {
            galeriaSecundaria.innerHTML = '<span style="color:#888">No hay imágenes adicionales</span>';
        }
    }
});
async function enviarEncuesta() {
    try {
        const idRestaurantero = window.restauranteActual?.id_restaurantero;
        if (!idRestaurantero) {
            alert('No se pudo identificar el restaurante.');
            return;
        }

        const opinion = document.getElementById('opinionSelect')?.value || '';
        const origen = document.getElementById('origenSelect')?.value || '';

        if (!opinion || !origen) {
            alert('Por favor selecciona una opción en ambas preguntas.');
            return;
        }

        const body = {
            cantidad_descargas: 1,
            opinion,
            origen
        };

        const response = await fetch(`http://localhost:7070/descargas/restaurantero/${idRestaurantero}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            alert('¡Gracias por tu respuesta!');
            if (typeof closeEncuestaModal === 'function') closeEncuestaModal();
        } else {
            const errorText = await response.text();
            alert('Error al registrar la encuesta: ' + errorText);
        }
    } catch (error) {
        alert('Error al enviar la encuesta: ' + error.message);
    }
}

window.enviarEncuesta = enviarEncuesta;