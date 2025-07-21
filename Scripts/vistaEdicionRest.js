document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('label.imagen-slot input[type="file"][accept*="image"]').forEach(function(input) {
        input.addEventListener('change', function(event) {
            const fileList = event.target.files;
            const label = input.closest('label.imagen-slot');
            const placeholderImg = label ? label.querySelector('img') : null;
            if (fileList.length > 0 && placeholderImg) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    placeholderImg.src = e.target.result;
                    placeholderImg.style.objectFit = 'cover';
                    placeholderImg.style.width = '100%';
                    placeholderImg.style.height = '100%';
                };
                reader.readAsDataURL(fileList[0]);
            }
        });
    });

    document.querySelectorAll('label.btn-menu input[type="file"][accept="application/pdf"]').forEach(function(input) {
        input.addEventListener('change', function(event) {
            const fileList = event.target.files;
            const label = input.closest('label.btn-menu');
            Array.from(label.children).forEach(function(child) {
                if (child.tagName === 'IMG') {
                    child.style.display = (fileList.length > 0) ? 'none' : '';
                }
            });
            let fileNameSpan = label.querySelector('.file-name');
            if (!fileNameSpan) {
                fileNameSpan = document.createElement('span');
                fileNameSpan.className = 'file-name';
                fileNameSpan.style.marginLeft = '10px';
                fileNameSpan.style.fontWeight = 'normal';
                label.appendChild(fileNameSpan);
            }
            if (fileList.length > 0) {
                fileNameSpan.textContent = `Archivo seleccionado: ${fileList[0].name}`;
                fileNameSpan.style.display = 'inline-block';
            } else {
                fileNameSpan.textContent = '';
                fileNameSpan.style.display = 'none';
                Array.from(label.children).forEach(function(child) {
                    if (child.tagName === 'IMG') {
                        child.style.display = '';
                    }
                });
            }
        });
    });
    // --- Lógica de autenticación y carga de datos del restaurante ---
    
    // Función para verificar si el backend está disponible
    async function verificarBackend(reintentos = 3) {
        for (let i = 0; i < reintentos; i++) {
            try {
                const response = await fetch('http://localhost:7070/solicitudes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000 // 10 segundos timeout
                });
                
                // Si obtenemos cualquier respuesta del servidor, está disponible
                if (response.status < 500) {
                    return true;
                }
                
                // Si es error 500, el servidor está corriendo pero hay problemas
                console.warn(`Intento ${i + 1}: Servidor responde pero con error ${response.status}`);
                if (i < reintentos - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
                }
            } catch (error) {
                console.warn(`Intento ${i + 1}: Error de conexión:`, error.message);
                if (i < reintentos - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
                }
            }
        }
        return false;
    }

    // Obtener datos del restaurante del usuario autenticado
    async function cargarDatosRestauranteUsuario() {
        try {
            // Verificar backend primero
            const backendDisponible = await verificarBackend();
            if (!backendDisponible) {
                throw new Error('Backend no disponible en http://localhost:7070');
            }

            // Obtener datos de usuario autenticado
            const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
            const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');
            const loginSuccess = sessionStorage.getItem('loginSuccess') || localStorage.getItem('loginSuccess');
            
            if (!idUsuario && !correoUsuario && !loginSuccess) {
                alert('❌ Sesión no válida. Redirigiendo al login...');
                window.location.href = 'loginRest.html';
                return;
            }

            // PASO 1: Obtener teléfono del usuario desde las solicitudes de registro
            let telefonoUsuario = null;
            
            if (correoUsuario) {
                try {
                    const responseSolicitudes = await fetch(`http://localhost:7070/solicitudes`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (responseSolicitudes.ok) {
                        const solicitudes = await responseSolicitudes.json();
                        
                        // Buscar la solicitud del usuario actual por correo
                        const solicitudUsuario = solicitudes.find(s => 
                            s.correo && s.correo.toLowerCase() === correoUsuario.toLowerCase()
                        );
                        
                        if (solicitudUsuario) {
                            // Extraer teléfono de la solicitud
                            telefonoUsuario = solicitudUsuario.numero ||
                                            solicitudUsuario.telefono || 
                                            solicitudUsuario.telefonoContacto ||
                                            solicitudUsuario.celular ||
                                            solicitudUsuario.phone ||
                                            solicitudUsuario.numeroContacto;
                            
                            // Guardar teléfono en sessionStorage para futuras consultas
                            if (telefonoUsuario) {
                                sessionStorage.setItem('telefono', telefonoUsuario);
                            }
                            
                            // Guardar datos completos de la solicitud para uso posterior
                            window.solicitudUsuario = solicitudUsuario;
                        }
                    }
                } catch (errorSolicitudes) {
                    console.warn('Error al obtener solicitudes:', errorSolicitudes.message);
                }
            }

            try {
                // PASO 2: Obtener todos los restaurantes y buscar por los datos del usuario
                response = await fetch('http://localhost:7070/restaurantes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const restaurantes = await response.json();
                    let restauranteUsuario = null;
                    
                    if (Array.isArray(restaurantes)) {
                        // PRIORIDAD 1: Buscar por teléfono obtenido de las solicitudes
                        if (telefonoUsuario && telefonoUsuario.trim() !== '') {
                            const telefonoLimpio = telefonoUsuario.replace(/[\s\-\(\)]/g, '');
                            
                            restauranteUsuario = restaurantes.find(r => {
                                const telefonosAComparar = [
                                    r.numero,
                                    r.telefono,
                                    r.telefonoContacto,
                                    r.celular,
                                    r.phone,
                                    r.numeroContacto,
                                    r.numeroTelefono
                                ];
                                
                                return telefonosAComparar.some(telefono => {
                                    if (!telefono) return false;
                                    const telefonoRestauranteLimpio = telefono.toString().replace(/[\s\-\(\)]/g, '');
                                    return telefonoRestauranteLimpio === telefonoLimpio;
                                });
                            });
                        }
                        
                        // PRIORIDAD 2: Si no se encontró por teléfono, buscar por correo
                        if (!restauranteUsuario && correoUsuario) {
                            restauranteUsuario = restaurantes.find(r => {
                                const correosAComparar = [
                                    r.correo,
                                    r.correoContacto, 
                                    r.email,
                                    r.correoElectronico,
                                    r.emailContacto,
                                    r.contactoCorreo
                                ];
                                
                                return correosAComparar.some(correo => 
                                    correo && correo.toLowerCase() === correoUsuario.toLowerCase()
                                );
                            });
                        }
                        
                        // PRIORIDAD 3: Si no se encontró, buscar por ID de usuario
                        if (!restauranteUsuario && idUsuario) {
                            restauranteUsuario = restaurantes.find(r => {
                                const idsAComparar = [
                                    r.idUsuario,
                                    r.usuarioId,
                                    r.id,
                                    r.restauranteroId,
                                    r.propietarioId
                                ];
                                
                                return idsAComparar.some(id => 
                                    id && id.toString() === idUsuario.toString()
                                );
                            });
                        }
                    }
                    
                    if (restauranteUsuario) {
                        // Guardar globalmente para uso posterior
                        window.restauranteActual = restauranteUsuario;
                        
                        // Debug: Mostrar qué datos tenemos disponibles
                        console.log('✅ Datos del restaurante encontrado:', restauranteUsuario);
                        console.log('🔍 ID del restaurante encontrado:', {
                            id: restauranteUsuario.id,
                            idRestaurante: restauranteUsuario.idRestaurante,
                            restauranteId: restauranteUsuario.restauranteId,
                            id_restaurante: restauranteUsuario.id_restaurante
                        });
                        console.log('🔑 Foreign Keys del restaurante:', {
                            id_solicitud_aprobada: restauranteUsuario.id_solicitud_aprobada,
                            id_zona: restauranteUsuario.id_zona
                        });
                        if (window.solicitudUsuario) {
                            console.log('📄 Datos de la solicitud encontrada:', window.solicitudUsuario);
                            console.log('🔍 ID de la solicitud:', {
                                id: window.solicitudUsuario.id,
                                id_solicitud: window.solicitudUsuario.id_solicitud
                            });
                        }
                        
                        // Cargar datos en el formulario con datos combinados
                        cargarDatosEnFormulario(restauranteUsuario, window.solicitudUsuario);
                        
                        // Cargar etiquetas si las tiene
                        if (restauranteUsuario.etiquetas) {
                            cargarEtiquetasRestaurante(restauranteUsuario.etiquetas);
                        }
                        
                        return; // Éxito, salir de la función
                    } else {
                        // Debug: Mostrar qué restaurantes están disponibles
                        console.log('No se encontró restaurante específico para el usuario');
                        console.log('Restaurantes disponibles:', restaurantes.map(r => ({
                            id: r.id || r.idRestaurante || r.restauranteId,
                            nombre: r.nombre,
                            telefono: r.telefono || r.numero,
                            correo: r.correo
                        })));
                        console.log('Datos del usuario buscado:', { correoUsuario, idUsuario, telefonoUsuario });
                        
                        throw new Error('No se encontró ningún restaurante asociado al usuario');
                    }
                } else {
                    throw new Error(`Error al obtener restaurantes: ${response.status}`);
                }
                
            } catch (fetchError) {
                console.error('Error al obtener restaurantes:', fetchError);
                throw fetchError;
            }

        } catch (error) {
            console.error('Error al cargar datos del restaurante:', error);
            
            // Verificar si es un error de red o del servidor
            if (error.message.includes('fetch')) {
                alert('❌ Error de conexión: No se puede conectar al servidor.');
            } else if (error.message.includes('404')) {
                alert('❌ Endpoint no encontrado: Verifique la configuración del servidor.');
            } else if (error.message.includes('500')) {
                alert('❌ Error del servidor: Contacte al administrador.');
            } else {
                alert(`❌ Error al cargar los datos del restaurante: ${error.message}`);
            }
        }
    }

    // Función para cargar datos en el formulario combinando datos del restaurante y solicitud
    function cargarDatosEnFormulario(restaurante, solicitud = null) {
        // Actualizar nombre del restaurante en la página
        const nombreElement = document.querySelector('.restaurante-nombre');
        if (nombreElement) {
            // Prioridad: restaurante.nombre > solicitud.restaurante > 'Mi Restaurante'
            const nombre = restaurante.nombre || 
                          (solicitud && solicitud.restaurante) || 
                          'Mi Restaurante';
            nombreElement.textContent = nombre;
        }

        // Cargar dirección - prioridad: restaurante > solicitud
        const inputUbicacion = document.querySelector('input[placeholder="Ingrese la dirección"]');
        if (inputUbicacion) {
            const direccion = restaurante.direccion || 
                             (solicitud && solicitud.direccion) ||
                             '';
            inputUbicacion.value = direccion;
        }

        // Cargar teléfono - prioridad: restaurante > solicitud.numero > solicitud.telefono
        const inputTelefono = document.querySelector('input[placeholder="Ingrese su número celular"]');
        if (inputTelefono) {
            const telefono = restaurante.telefono || 
                            restaurante.numero ||
                            (solicitud && solicitud.numero) ||
                            (solicitud && solicitud.telefono) ||
                            '';
            inputTelefono.value = telefono;
        }

        // Cargar horarios - prioridad: restaurante > solicitud
        const horariosInputs = document.querySelectorAll('.horarios-inputs input');
        if (horariosInputs.length > 0) {
            const horario = restaurante.horario || 
                           (solicitud && solicitud.horario) ||
                           '';
            horariosInputs[0].value = horario;
        }

        // Cargar descripción si existe el campo
        const inputDescripcion = document.querySelector('textarea[placeholder*="descripción"], input[placeholder*="descripción"]');
        if (inputDescripcion) {
            const descripcion = restaurante.descripcion || 
                               (solicitud && solicitud.descripcion) ||
                               '';
            inputDescripcion.value = descripcion;
        }

        // Cargar propietario si existe el campo
        const inputPropietario = document.querySelector('input[placeholder*="propietario"], input[placeholder*="dueño"]');
        if (inputPropietario) {
            const propietario = restaurante.propietario || 
                               (solicitud && solicitud.propietario) ||
                               '';
            inputPropietario.value = propietario;
        }

        // Cargar imágenes si existen - mostrar URLs de las imágenes del restaurante o solicitud
        cargarImagenesExistentes(restaurante, solicitud);
    }

    // Función para cargar imágenes existentes del restaurante o solicitud
    function cargarImagenesExistentes(restaurante, solicitud) {
        // Buscar las imágenes disponibles en orden de prioridad
        const imagenesDisponibles = [
            restaurante.imagen1 || (solicitud && solicitud.imagen1),
            restaurante.imagen2 || (solicitud && solicitud.imagen2), 
            restaurante.imagen3 || (solicitud && solicitud.imagen3),
            restaurante.imagenPrincipal || (solicitud && solicitud.imagenPrincipal),
            restaurante.imagenSecundaria || (solicitud && solicitud.imagenSecundaria)
        ].filter(img => img); // Filtrar valores null/undefined

        // Obtener todos los slots de imagen
        const imageSlots = document.querySelectorAll('label.imagen-slot img');
        
        // Cargar las imágenes disponibles en los slots
        imagenesDisponibles.forEach((imagenUrl, index) => {
            if (index < imageSlots.length && imagenUrl) {
                const imgElement = imageSlots[index];
                imgElement.src = imagenUrl;
                imgElement.style.objectFit = 'cover';
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                
                // Agregar indicador visual de que es una imagen existente
                const parentLabel = imgElement.closest('label.imagen-slot');
                if (parentLabel && !parentLabel.querySelector('.imagen-existente-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'imagen-existente-indicator';
                    indicator.style.cssText = `
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: rgba(0,0,0,0.7);
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 10px;
                        z-index: 10;
                    `;
                    indicator.textContent = 'Actual';
                    parentLabel.style.position = 'relative';
                    parentLabel.appendChild(indicator);
                }
            }
        });

        // Cargar PDF del menú si existe
        cargarMenuExistente(restaurante, solicitud);
    }

    // Función para cargar el menú PDF existente
    function cargarMenuExistente(restaurante, solicitud) {
        const menuUrl = restaurante.menu || 
                       restaurante.menuPdf ||
                       (solicitud && solicitud.comprobante) ||
                       (solicitud && solicitud.menu);
        
        if (menuUrl) {
            const menuLabels = document.querySelectorAll('label.btn-menu');
            if (menuLabels.length > 0) {
                const menuLabel = menuLabels[0];
                
                // Ocultar imagen de placeholder
                const imgElements = menuLabel.querySelectorAll('img');
                imgElements.forEach(img => img.style.display = 'none');
                
                // Mostrar nombre del archivo existente
                let fileNameSpan = menuLabel.querySelector('.file-name');
                if (!fileNameSpan) {
                    fileNameSpan = document.createElement('span');
                    fileNameSpan.className = 'file-name';
                    fileNameSpan.style.marginLeft = '10px';
                    fileNameSpan.style.fontWeight = 'normal';
                    menuLabel.appendChild(fileNameSpan);
                }
                
                // Extraer nombre del archivo de la URL
                const fileName = menuUrl.split('/').pop() || 'menu-actual.pdf';
                fileNameSpan.textContent = `Archivo actual: ${fileName}`;
                fileNameSpan.style.display = 'inline-block';
                
                // Agregar enlace para descargar/ver el archivo actual
                if (!menuLabel.querySelector('.link-archivo-actual')) {
                    const linkDescarga = document.createElement('a');
                    linkDescarga.className = 'link-archivo-actual';
                    linkDescarga.href = menuUrl;
                    linkDescarga.target = '_blank';
                    linkDescarga.style.cssText = `
                        display: block;
                        margin-top: 5px;
                        color: #007bff;
                        font-size: 12px;
                        text-decoration: underline;
                    `;
                    linkDescarga.textContent = '📄 Ver archivo actual';
                    menuLabel.appendChild(linkDescarga);
                }
            }
        }
    }

    // --- Lógica de membresía ---
    // Simula el estado de membresía: "inactiva", "pendiente", "activa"
    // En producción, obtén este valor del backend
    const estadoMembresia = window.estadoMembresiaRestaurante || "activa"; // Cambia según pruebas

    const btnHeaderSubscripcion = document.getElementById('btnHeaderSubscripcion');
    const btnEstadisticas = document.getElementById('btnEstadisticas');
    const mensaje = document.getElementById('membresiaMensaje');

    if (btnEstadisticas && mensaje) {
        if (estadoMembresia === "activa") {
            btnEstadisticas.style.display = "inline-block";
            btnEstadisticas.disabled = false;
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "none";
        } else if (estadoMembresia === "pendiente") {
            btnEstadisticas.style.display = "none";
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "inline-block";
        } else {
            btnEstadisticas.style.display = "none";
            mensaje.textContent = "";
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "inline-block";
        }
    }

    // Cargar datos del restaurante al inicializar la página
    cargarDatosRestauranteUsuario();

    // Etiquetas disponibles para restaurantes
    const ETIQUETAS_DISPONIBLES = [
        'Comida Rápida',
        'Pet Friendly', 
        'Familiar',
        'Económico',
        'Gourmet',
        'Vegetariano',
        'Delivery',
        'Terraza',
        'WiFi Gratuito',
        'Estacionamiento'
    ];

    // Llenar los dropdowns de etiquetas con las opciones disponibles
    const selectsEtiquetas = document.querySelectorAll('.etiquetas .filtro-select');
    
    selectsEtiquetas.forEach(select => {
        // Limpiar opciones existentes (excepto la primera que es "Seleccionar")
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Agregar las etiquetas disponibles
        ETIQUETAS_DISPONIBLES.forEach(etiqueta => {
            const option = document.createElement('option');
            option.value = etiqueta;
            option.textContent = etiqueta;
            select.appendChild(option);
        });
    });

    // Función para obtener las etiquetas seleccionadas
    window.obtenerEtiquetasSeleccionadas = function() {
        const etiquetasSeleccionadas = [];
        selectsEtiquetas.forEach(select => {
            if (select.value && select.value !== '') {
                etiquetasSeleccionadas.push(select.value);
            }
        });
        return etiquetasSeleccionadas.join(', ');
    };

    // Función para cargar etiquetas existentes (desde el backend)
    window.cargarEtiquetasRestaurante = function(etiquetasString) {
        if (!etiquetasString) return;
        
        const etiquetasArray = etiquetasString.split(',').map(e => e.trim());
        
        // Asignar las etiquetas a los selects disponibles
        etiquetasArray.forEach((etiqueta, index) => {
            if (index < selectsEtiquetas.length) {
                selectsEtiquetas[index].value = etiqueta;
            }
        });
    };

    // Evento para evitar seleccionar la misma etiqueta en múltiples dropdowns
    selectsEtiquetas.forEach((select, index) => {
        select.addEventListener('change', function() {
            const etiquetaSeleccionada = this.value;
            
            // Si se seleccionó una etiqueta, removerla de los otros dropdowns
            if (etiquetaSeleccionada && etiquetaSeleccionada !== '') {
                selectsEtiquetas.forEach((otroSelect, otroIndex) => {
                    if (otroIndex !== index) {
                        // Remover la opción seleccionada de otros dropdowns
                        const opcionARemover = otroSelect.querySelector(`option[value="${etiquetaSeleccionada}"]`);
                        if (opcionARemover && otroSelect.value !== etiquetaSeleccionada) {
                            opcionARemover.style.display = 'none';
                        }
                    }
                });
            }
            
            // Mostrar todas las opciones en todos los dropdowns y luego ocultar las ya seleccionadas
            actualizarOpcionesDisponibles();
        });
    });

    // Función para actualizar las opciones disponibles en todos los dropdowns
    function actualizarOpcionesDisponibles() {
        const etiquetasYaSeleccionadas = [];
        
        // Obtener todas las etiquetas ya seleccionadas
        selectsEtiquetas.forEach(select => {
            if (select.value && select.value !== '') {
                etiquetasYaSeleccionadas.push(select.value);
            }
        });
        
        // Para cada dropdown, mostrar/ocultar opciones
        selectsEtiquetas.forEach(select => {
            const etiquetaActual = select.value;
            
            Array.from(select.options).forEach(option => {
                if (option.value === '' || option.value === etiquetaActual) {
                    // Siempre mostrar la opción "Seleccionar" y la opción actualmente seleccionada
                    option.style.display = '';
                } else if (etiquetasYaSeleccionadas.includes(option.value)) {
                    // Ocultar opciones ya seleccionadas en otros dropdowns
                    option.style.display = 'none';
                } else {
                    // Mostrar opciones disponibles
                    option.style.display = '';
                }
            });
        });
    }

    // Agregar funcionalidad al botón "Aplicar Cambios"
    const btnAplicar = document.querySelector('.btn-aplicar');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', async function() {
            if (!window.restauranteActual) {
                alert('❌ No se han cargado los datos del restaurante');
                return;
            }

            const etiquetasSeleccionadas = obtenerEtiquetasSeleccionadas();
            
            // Recopilar solo los datos que el backend acepta, incluyendo id_solicitud_aprobada
            const datosActualizados = {
                nombre: document.querySelector('.restaurante-nombre')?.textContent || window.restauranteActual.nombre,
                direccion: document.querySelector('input[placeholder="Ingrese la dirección"]')?.value || '',
                telefono: document.querySelector('input[placeholder="Ingrese su número celular"]')?.value || '',
                horario: document.querySelector('.horarios-inputs input')?.value || '',
                etiquetas: etiquetasSeleccionadas
                // Campo requerido por la foreign key constraint:
            };
            
            // Agregar id_solicitud_aprobada si está disponible (requerido por foreign key)
            if (window.restauranteActual.id_solicitud_aprobada) {
                datosActualizados.id_solicitud_aprobada = window.restauranteActual.id_solicitud_aprobada;
            } else if (window.solicitudUsuario && window.solicitudUsuario.id_solicitud) {
                datosActualizados.id_solicitud_aprobada = window.solicitudUsuario.id_solicitud;
            } else if (window.solicitudUsuario && window.solicitudUsuario.id) {
                datosActualizados.id_solicitud_aprobada = window.solicitudUsuario.id;
            }
            
            // Agregar id_zona si está disponible (puede ser requerido)
            if (window.restauranteActual.id_zona) {
                datosActualizados.id_zona = window.restauranteActual.id_zona;
            }

            try {
                const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
                const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');
                
                // Buscar el ID del restaurante en diferentes campos posibles (tu backend usa id_restaurante)
                const idRestaurante = window.restauranteActual.id_restaurante || 
                                    window.restauranteActual.id ||
                                    window.restauranteActual.idRestaurante ||
                                    window.restauranteActual.restauranteId ||
                                    window.restauranteActual.ID ||
                                    window.restauranteActual.Id;
                
                console.log('🔍 Debug - IDs disponibles:', {
                    id_restaurante: window.restauranteActual.id_restaurante,
                    id: window.restauranteActual.id,
                    idRestaurante: window.restauranteActual.idRestaurante,
                    restauranteId: window.restauranteActual.restauranteId,
                    idFinal: idRestaurante
                });
                
                if (!idRestaurante) {
                    console.error('Datos completos del restaurante:', window.restauranteActual);
                    alert('❌ No se puede actualizar: No se encontró el ID del restaurante. Revise la consola para más detalles.');
                    return;
                }
                
                // Usar endpoint PUT /restaurantes/{id} - compatible con tu backend
                const endpointUrl = `http://localhost:7070/restaurantes/${idRestaurante}`;
                console.log('🚀 Enviando actualización a:', endpointUrl);
                console.log('📦 Datos a enviar (con foreign keys):', datosActualizados);
                console.log('🔑 Foreign Keys enviadas:', {
                    id_solicitud_aprobada: datosActualizados.id_solicitud_aprobada,
                    id_zona: datosActualizados.id_zona
                });
                console.log('📋 Campos válidos en tu backend: direccion, horario, id_restaurante, id_solicitud_aprobada, nombre, id_zona, etiquetas, telefono');
                
                // Enviar actualización al backend (headers mínimos para máxima compatibilidad)
                const response = await fetch(endpointUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizados)
                });

                if (response.ok) {
                    const responseData = await response.json();
                    console.log('✅ Respuesta del servidor:', responseData);
                    alert('✅ Datos del restaurante actualizados correctamente');
                    // Recargar datos para reflejar cambios
                    await cargarDatosRestauranteUsuario();
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error del servidor:', response.status, errorText);
                    alert(`❌ Error al actualizar (${response.status}): ${errorText}`);
                }

            } catch (error) {
                console.error('❌ Error al guardar:', error);
                
                // Diagnóstico específico del error
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    alert('❌ Error de conexión: Verifique que el backend esté ejecutándose en http://localhost:7070');
                } else if (error.message.includes('CORS')) {
                    alert('❌ Error CORS: El backend no permite conexiones desde este origen');
                } else {
                    alert(`❌ Error de conexión al guardar los datos: ${error.message}`);
                }
            }
        });
    }

});
