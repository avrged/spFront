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
    async function verificarBackend() {
        try {
            const response = await fetch('http://localhost:7070/solicitudes', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return true;
        } catch (error) {
            console.error('Backend no disponible:', error.message);
            return false;
        }
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
                        }
                    }
                } catch (errorSolicitudes) {
                    console.warn('Error al obtener solicitudes:', errorSolicitudes.message);
                }
            }

            try {
                // PASO 2: Obtener todos los restaurantes y buscar por los datos del usuario
                response = await fetch('http://localhost:7070/solicitudes', {
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
                        
                        // Cargar datos en el formulario
                        cargarDatosEnFormulario(restauranteUsuario);
                        
                        // Cargar etiquetas si las tiene
                        if (restauranteUsuario.etiquetas) {
                            cargarEtiquetasRestaurante(restauranteUsuario.etiquetas);
                        }
                        
                        return; // Éxito, salir de la función
                    } else {
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

    // Función para cargar datos en el formulario
    function cargarDatosEnFormulario(restaurante) {
        // Mostrar en consola los datos recibidos del backend
        console.log('Datos del restaurante recibidos:', restaurante);
        console.log('imagen1:', restaurante.imagen1);
        console.log('imagen2:', restaurante.imagen2);
        console.log('imagen3:', restaurante.imagen3);
        // Actualizar nombre del restaurante en la página
        const nombreElement = document.getElementById('restauranteNombre');
        if (nombreElement) {
            nombreElement.textContent = restaurante.restaurante || 'Mi Restaurante';
        }

        // Cargar dirección
        const inputDireccion = document.getElementById('direccionInput');
        if (inputDireccion && restaurante.direccion) {
            inputDireccion.value = restaurante.direccion;
        }

        // Cargar teléfono
        const inputTelefono = document.getElementById('telefonoInput');
        if (inputTelefono && restaurante.telefono) {
            inputTelefono.value = restaurante.telefono;
        }

        // Cargar horarios si existen
        const horarioLVInput = document.getElementById('horarioLVInput');
        if (horarioLVInput && restaurante.horarioLV) {
            horarioLVInput.value = restaurante.horarioLV;
        }
        const horarioSDInput = document.getElementById('horarioSDInput');
        if (horarioSDInput && restaurante.horarioSD) {
            horarioSDInput.value = restaurante.horarioSD;
        }

        // Cargar imágenes en la galería usando ids únicos
        const img1 = document.getElementById('imgGaleria1');
        if (img1) img1.src = restaurante.imagen1 || '../images/imagen.png';
        const img2 = document.getElementById('imgGaleria2');
        if (img2) img2.src = restaurante.imagen2 || '../images/imagen.png';
        const img3 = document.getElementById('imgGaleria3');
        if (img3) img3.src = restaurante.imagen3 || '../images/imagen.png';
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


            // Recopilar los datos EXACTOS requeridos por el backend
            // Extraer los datos desde window.restauranteActual y los inputs del formulario
            const datosActualizados = {
                id_restaurantero: window.restauranteActual.id_restaurantero || 72,
                fecha: window.restauranteActual.fecha || [2025, 7, 20],
                estado: window.restauranteActual.estado || "aprobado",
                restaurante: window.restauranteActual.restaurante || '',
                correo: window.restauranteActual.correo || '',
                direccion: document.getElementById('direccionInput')?.value || window.restauranteActual.direccion || '',
                imagen1: window.restauranteActual.imagen1 || '',
                imagen2: window.restauranteActual.imagen2 || '',
                imagen3: window.restauranteActual.imagen3 || '',
                comprobante: window.restauranteActual.comprobante || '',
                propietario: window.restauranteActual.propietario || '',
                numero: document.getElementById('telefonoInput')?.value || window.restauranteActual.numero || '',
                horario: (document.getElementById('horarioLVInput')?.value || '') + (document.getElementById('horarioSDInput')?.value ? ' | ' + document.getElementById('horarioSDInput').value : window.restauranteActual.horario || '')
            };


            // Mostrar los datos en consola para guía
            console.log('Datos que se enviarán al backend:', datosActualizados);
            // Imprimir el idRestaurante en consola
            console.log('ID del restaurante a actualizar:', window.restauranteActual.id_solicitud);

            try {
                const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
                const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');

                if (!window.restauranteActual.id_solicitud) {
                    alert('❌ No se puede actualizar: No se tiene el ID de la solicitud');
                    return;
                }

                // Usar endpoint PUT /solicitudes/{id} (updateWithFiles)
                const endpointUrl = `http://localhost:7070/solicitudes/${window.restauranteActual.id_solicitud}`;

                // Enviar actualización al backend
                const response = await fetch(endpointUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Email': correoUsuario || '',
                        'X-User-ID': idUsuario || '',
                    },
                    body: JSON.stringify(datosActualizados)
                });

                if (response.ok) {
                    alert('✅ Datos del restaurante actualizados correctamente');
                    // Recargar datos para reflejar cambios
                    await cargarDatosRestauranteUsuario();
                } else {
                    const errorText = await response.text();
                    alert(`❌ Error al actualizar: ${errorText}`);
                }

            } catch (error) {
                console.error('Error al guardar:', error);
                alert('❌ Error de conexión al guardar los datos');
            }
        });
    }

});
