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
                const response = await fetch('http://52.23.26.163:7070/solicitudes', {
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
            throw new Error('Backend no disponible en http://52.23.26.163:7070');
        }
        
        const response = await fetch('http://52.23.26.163:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const solicitudes = await response.json();
        console.log('📋 Solicitudes obtenidas:', solicitudes);
        console.log('📊 Total de solicitudes:', solicitudes.length);
        
        if (solicitudes.length > 0) {
            console.log('🔬 Estructura de datos (primer elemento):', Object.keys(solicitudes[0]));
            console.log('🆔 Datos disponibles:', solicitudes.map(s => ({
                id: s.id,
                restaurante: s.restaurante,
                estado: s.estado,
                correo: s.correo
            })));
        }
        
        let restauranteEncontrado = null;
        
        if (correo) {
            restauranteEncontrado = solicitudes.find(s => 
                s.correo && s.correo.toLowerCase() === correo.toLowerCase()
            );
            if (restauranteEncontrado) {
                console.log('✅ Restaurante encontrado por correo:', correo);
            }
        }
        
        if (!restauranteEncontrado && id && id !== 'undefined' && id !== 'null') {
            restauranteEncontrado = solicitudes.find(s => 
                s.id == id || 
                s.idRestaurante == id || 
                s.restauranteId == id ||
                s.id_restaurante == id
            );
            if (restauranteEncontrado) {
                console.log('✅ Restaurante encontrado por ID:', id);
            }
        }
        
        if (!restauranteEncontrado && id && !isNaN(parseInt(id))) {
            const index = parseInt(id);
            if (index >= 0 && index < solicitudes.length) {
                restauranteEncontrado = solicitudes[index];
                console.log('✅ Restaurante encontrado por índice:', index);
            }
        }
        
        if (!restauranteEncontrado) {
            const solicitudesAprobadas = solicitudes.filter(s => 
                s.estado === 'aprobado' || 
                s.estado === 'Aprobado' ||
                s.estado === 'APROBADO'
            );
            
            if (solicitudesAprobadas.length > 0) {
                restauranteEncontrado = solicitudesAprobadas[0];
                console.log('✅ Usando primer restaurante aprobado disponible');
            }
        }
        
        if (!restauranteEncontrado && solicitudes.length > 0) {
            restauranteEncontrado = solicitudes[0];
            console.log('✅ Usando primer restaurante disponible como fallback');
        }
        
        if (!restauranteEncontrado) {
            console.error('❌ No se encontró ningún restaurante');
            console.error('🔍 Parámetros buscados:', { id, correo });
            console.error('📋 Solicitudes disponibles:', solicitudes.map(s => ({ id: s.id, correo: s.correo })));
            throw new Error(`No hay restaurantes disponibles para mostrar`);
        }

        console.log('✅ Restaurante encontrado:', restauranteEncontrado);

        window.restauranteActual = restauranteEncontrado;

        cargarDatosRestaurante(restauranteEncontrado);
        
    } catch (error) {
        console.error('❌ Error al cargar restaurante:', error);
        
        if (error.message.includes('fetch')) {
            alert('❌ Error de conexión: No se puede conectar al servidor.');
        } else if (error.message.includes('404')) {
            alert('❌ Endpoint no encontrado: Verifique la configuración del servidor.');
        } else if (error.message.includes('500')) {
            alert('❌ Error del servidor: Contacte al administrador.');
        } else {
            alert(`❌ Error al cargar la información del restaurante: ${error.message}`);
        }
    }

    function cargarDatosRestaurante(restaurante) {
        try {
            console.log('🎨 Cargando datos en la vista:', restaurante);

            const nombreElement = document.querySelector('.restaurante-nombre');
            if (nombreElement) {
                nombreElement.textContent = restaurante.restaurante || 'Restaurante sin nombre';
            }

            const imgPrincipal = document.querySelector('.galeria-principal');
            if (imgPrincipal) {
                const imagenPrincipal = restaurante.imagen1 || '../images/img_rest2.jpg';
                imgPrincipal.src = imagenPrincipal;
                imgPrincipal.alt = `Imagen principal de ${restaurante.restaurante}`;
                console.log('🖼️ Imagen principal cargada:', imagenPrincipal);
            }

            const galeriaSecundaria = document.querySelector('.galeria-secundaria');
            if (galeriaSecundaria) {
                const imagenesSecundarias = [];
                if (restaurante.imagen2) imagenesSecundarias.push(restaurante.imagen2);
                if (restaurante.imagen3) imagenesSecundarias.push(restaurante.imagen3);
                
                galeriaSecundaria.innerHTML = imagenesSecundarias.length > 0
                    ? imagenesSecundarias.map(img => `<img src='${img}' alt='Imagen restaurante' class='galeria-thumb' />`).join('')
                    : '<span style="color:#888">No hay imágenes adicionales</span>';
                
                console.log('🖼️ Imágenes secundarias cargadas:', imagenesSecundarias.length);
            }

            const caracteristicas = document.querySelector('.caracteristicas-lista');
            if (caracteristicas) {
                let etiquetasArray = [];
                
                const etiquetasIndividuales = [
                    restaurante.etiqueta1,
                    restaurante.etiqueta2, 
                    restaurante.etiqueta3
                ].filter(etiqueta => 
                    etiqueta && 
                    etiqueta !== '' && 
                    etiqueta !== 'Seleccionar' && 
                    etiqueta.trim() !== ''
                );
                
                if (etiquetasIndividuales.length === 0 && restaurante.etiquetas) {
                    if (typeof restaurante.etiquetas === 'string') {
                        etiquetasArray = restaurante.etiquetas.split(',').map(e => e.trim()).filter(e => e && e !== 'Seleccionar');
                    } else if (Array.isArray(restaurante.etiquetas)) {
                        etiquetasArray = restaurante.etiquetas.filter(e => e && e !== 'Seleccionar');
                    }
                } else {
                    etiquetasArray = etiquetasIndividuales;
                }
                
                caracteristicas.innerHTML = etiquetasArray.length > 0 
                    ? etiquetasArray.map(etiqueta =>
                        `<div class='caracteristica-item'>
                            <img src='../images/etiqueta.png' alt='Etiqueta' class='icon-etiqueta' />
                            <span class='caracteristica'>${etiqueta}</span>
                        </div>`
                    ).join('')
                    : '<span style="color:#888">No hay características disponibles</span>';
                
                console.log('🏷️ Etiquetas cargadas:', etiquetasArray);
                console.log('🔍 Etiquetas individuales encontradas:', { 
                    etiqueta1: restaurante.etiqueta1, 
                    etiqueta2: restaurante.etiqueta2, 
                    etiqueta3: restaurante.etiqueta3 
                });
            }

            const horarios = document.querySelector('.restaurante-horarios');
            if (horarios) {
                horarios.innerHTML = `
                    <h2>Horarios</h2>
                    <div><img src='../images/reloj.png' alt='Horario' class='icon-16' /> ${restaurante.horario || 'No especificado'}</div>
                `;
                console.log('⏰ Horarios cargados:', restaurante.horario);
            }

            const contactos = document.querySelector('.restaurante-contactos');
            if (contactos) {
                const telefono = restaurante.numero || restaurante.telefono || 'No especificado';
                const facebook = restaurante.facebook || 'No especificado';
                const instagram = restaurante.instagram || 'No especificado';
                
                contactos.innerHTML = `
                    <h2>Contactos</h2>
                    <div><img src='../images/llamada.png' alt='Teléfono' class='icon-16' /> ${telefono}</div>
                    <div><img src='../images/facebook.png' alt='Facebook' class='icon-16' /> ${facebook}</div>
                    <div><img src='../images/instagram.png' alt='Instagram' class='icon-16' /> ${instagram}</div>
                `;
                console.log('📞 Contactos cargados:', { telefono, facebook, instagram });
            }

            const ubicacion = document.querySelector('.restaurante-ubicacion');
            if (ubicacion) {
                const direccion = restaurante.direccion || 'No especificada';
                ubicacion.innerHTML = `
                    <h2>Ubicación</h2>
                    <div><img src='../images/ubicacion.png' alt='Ubicación' class='icon-16' /> ${direccion}</div>
                `;
                console.log('📍 Ubicación cargada:', direccion);
            }

            if (restaurante.descripcion) {
                console.log('📝 Descripción disponible:', restaurante.descripcion);
            }
            if (restaurante.menu) {
                console.log('📋 Menú disponible:', restaurante.menu);
            }

            console.log('✅ Todos los datos cargados correctamente');

        } catch (error) {
            console.error('❌ Error al cargar datos en la vista:', error);
        }
    }
});