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

    async function cargarDatosRestauranteUsuario() {
        try {
            const backendDisponible = await verificarBackend();
            if (!backendDisponible) {
                throw new Error('Backend no disponible en http://52.23.26.163:7070');
            }

            const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
            const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');
            const loginSuccess = sessionStorage.getItem('loginSuccess') || localStorage.getItem('loginSuccess');
            
            if (!idUsuario && !correoUsuario && !loginSuccess) {
                alert('❌ Sesión no válida. Redirigiendo al login...');
                window.location.href = 'loginRest.html';
                return;
            }

            let telefonoUsuario = null;
            
            if (correoUsuario) {
                try {
                    const responseSolicitudes = await fetch(`http://52.23.26.163:7070/solicitudes`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (responseSolicitudes.ok) {
                        const solicitudes = await responseSolicitudes.json();
                        
                        const solicitudUsuario = solicitudes.find(s => 
                            s.correo && s.correo.toLowerCase() === correoUsuario.toLowerCase()
                        );
                        
                        if (solicitudUsuario) {
                            telefonoUsuario = solicitudUsuario.numero ||
                                            solicitudUsuario.telefono || 
                                            solicitudUsuario.telefonoContacto ||
                                            solicitudUsuario.celular ||
                                            solicitudUsuario.phone ||
                                            solicitudUsuario.numeroContacto;
                            
                            if (telefonoUsuario) {
                                sessionStorage.setItem('telefono', telefonoUsuario);
                            }
                            
                            window.solicitudUsuario = solicitudUsuario;
                        }
                    }
                } catch (errorSolicitudes) {
                    console.warn('Error al obtener solicitudes:', errorSolicitudes.message);
                }
            }

            try {
                response = await fetch('http://52.23.26.163:7070/solicitudes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const restaurantes = await response.json();
                    let restauranteUsuario = null;
                    
                    if (Array.isArray(restaurantes)) {
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
                        window.restauranteActual = restauranteUsuario;
                        
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
                        
                        cargarDatosEnFormulario(restauranteUsuario, window.solicitudUsuario);
                        
                        if (restauranteUsuario.etiquetas) {
                            cargarEtiquetasRestaurante(restauranteUsuario.etiquetas);
                        }
                        
                        return;
                    } else {
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

    function cargarDatosEnFormulario(restaurante) {
        const nombreElement = document.getElementById('restauranteNombre');
        if (nombreElement) {
            nombreElement.textContent = restaurante.restaurante || 'Mi Restaurante';
        }

        const inputUbicacion = document.querySelector('input[placeholder="Ingrese la dirección"]');
        if (inputUbicacion && restaurante.direccion) {
            inputUbicacion.value = restaurante.direccion;
        }

        const inputTelefono = document.querySelector('input[placeholder="Ingrese su número celular"]');
        if (inputTelefono && restaurante.numero) {
            inputTelefono.value = restaurante.numero;
        }

        const horariosInputs = document.querySelectorAll('.horarios-inputs input');
        if (restaurante.horario && horariosInputs.length > 0) {
            horariosInputs[0].value = restaurante.horario;
        }
        const inputInstagram = document.querySelector('input[placeholder="Ingrese su instagram"]');
        if (inputInstagram && restaurante.instagram) {
            inputInstagram.value = restaurante.instagram;
        }

        const inputFacebook = document.querySelector('input[placeholder="Ingrese su facebook"]');
        if (inputFacebook && restaurante.facebook) {
            inputFacebook.value = restaurante.facebook;
        }

        const img1 = document.getElementById('imgGaleria1');
        if (img1) img1.src = restaurante.imagen1 || '../images/imagen.png';
        const img2 = document.getElementById('imgGaleria2');
        if (img2) img2.src = restaurante.imagen2 || '../images/imagen.png';
        const img3 = document.getElementById('imgGaleria3');
        if (img3) img3.src = restaurante.imagen3 || '../images/imagen.png';

        const btnMenu = document.querySelector('label.btn-menu input[type="file"]');
        if (btnMenu && restaurante.menu) {
            const label = btnMenu.closest('label.btn-menu');
            let fileNameSpan = label.querySelector('.file-name');
            
            if (!fileNameSpan) {
                fileNameSpan = document.createElement('span');
                fileNameSpan.className = 'file-name';
                fileNameSpan.style.marginLeft = '10px';
                fileNameSpan.style.fontWeight = 'normal';
                fileNameSpan.style.color = '#912F2F';
                label.appendChild(fileNameSpan);
            }
            
            const nombreArchivo = restaurante.menu.split('/').pop() || restaurante.menu;
            fileNameSpan.textContent = `Menú guardado: ${nombreArchivo}`;
            fileNameSpan.style.display = 'inline-block';
        }
    }


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

    cargarDatosRestauranteUsuario();

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

    const selectsEtiquetas = document.querySelectorAll('.etiquetas .filtro-select');
    
    selectsEtiquetas.forEach(select => {
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        ETIQUETAS_DISPONIBLES.forEach(etiqueta => {
            const option = document.createElement('option');
            option.value = etiqueta;
            option.textContent = etiqueta;
            select.appendChild(option);
        });
    });

    window.obtenerEtiquetasSeleccionadas = function() {
        const etiquetasSeleccionadas = [];
        selectsEtiquetas.forEach(select => {
            if (select.value && select.value !== '') {
                etiquetasSeleccionadas.push(select.value);
            }
        });
        return etiquetasSeleccionadas.join(', ');
    };

    window.cargarEtiquetasRestaurante = function(etiquetasString) {
        if (!etiquetasString) return;
        
        const etiquetasArray = etiquetasString.split(',').map(e => e.trim());
        
        etiquetasArray.forEach((etiqueta, index) => {
            if (index < selectsEtiquetas.length) {
                selectsEtiquetas[index].value = etiqueta;
            }
        });
    };

    selectsEtiquetas.forEach((select, index) => {
        select.addEventListener('change', function() {
            const etiquetaSeleccionada = this.value;
            
            if (etiquetaSeleccionada && etiquetaSeleccionada !== '') {
                selectsEtiquetas.forEach((otroSelect, otroIndex) => {
                    if (otroIndex !== index) {
                        const opcionARemover = otroSelect.querySelector(`option[value="${etiquetaSeleccionada}"]`);
                        if (opcionARemover && otroSelect.value !== etiquetaSeleccionada) {
                            opcionARemover.style.display = 'none';
                        }
                    }
                });
            }
            
            actualizarOpcionesDisponibles();
        });
    });

    function actualizarOpcionesDisponibles() {
        const etiquetasYaSeleccionadas = [];
        selectsEtiquetas.forEach(select => {
            if (select.value && select.value !== '') {
                etiquetasYaSeleccionadas.push(select.value);
            }
        });
        selectsEtiquetas.forEach(select => {
            const etiquetaActual = select.value;
            Array.from(select.options).forEach(option => {
                if (option.value === '' || option.value === etiquetaActual) {
                    option.style.display = '';
                } else if (etiquetasYaSeleccionadas.includes(option.value)) {
                    option.style.display = 'none';
                } else {
                    option.style.display = '';
                }
            });
        });
    }

    const btnAplicar = document.querySelector('.btn-aplicar');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', async function() {
            if (!window.restauranteActual) {
                alert('❌ No se han cargado los datos del restaurante');
                return;
            }

            const etiquetasSeleccionadas = obtenerEtiquetasSeleccionadas();
            
            const datosActualizados = {
                nombre: window.restauranteActual.nombre,
                direccion: document.querySelector('input[placeholder="Ingrese la dirección"]')?.value || '',
                telefono: document.querySelector('input[placeholder="Ingrese su número celular"]')?.value || '',
                horario: document.querySelector('.horarios-inputs input')?.value || '',
                etiquetas: etiquetasSeleccionadas,
            };

            try {
                const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
                const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');
                
                if (!window.restauranteActual.id) {
                    alert('❌ No se puede actualizar: No se tiene el ID del restaurante');
                    return;
                }
                
                const endpointUrl = `http://52.23.26.163:7070/restaurantes/${window.restauranteActual.id}`;
                
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
                    await cargarDatosRestauranteUsuario();
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error del servidor:', response.status, errorText);
                    alert(`❌ Error al actualizar (${response.status}): ${errorText}`);
                }

            } catch (error) {
                console.error('❌ Error al guardar:', error);
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    alert('❌ Error de conexión: Verifique que el backend esté ejecutándose en http://52.23.26.163:7070');
                } else if (error.message.includes('CORS')) {
                    alert('❌ Error CORS: El backend no permite conexiones desde este origen');
                } else {
                    alert(`❌ Error de conexión al guardar los datos: ${error.message}`);
                }
            }
        });
    }

});
