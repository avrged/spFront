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
    
    async function verificarBackend(reintentos = 3) {
        for (let i = 0; i < reintentos; i++) {
            try {
                const response = await fetch('http://75.101.159.172:7070/solicitudes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
                
                if (response.status < 500) {
                    return true;
                }
                
                if (i < reintentos - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
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
                throw new Error('Backend no disponible en http://75.101.159.172:7070');
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
                    const responseSolicitudes = await fetch(`http://75.101.159.172:7070/solicitudes`, {
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
                }
            }

            try {
                response = await fetch('http://75.101.159.172:7070/solicitudes', {
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
                        
                        cargarDatosEnFormulario(restauranteUsuario, window.solicitudUsuario);
                        
                        const etiquetasIndividuales = [
                            restauranteUsuario.etiqueta1,
                            restauranteUsuario.etiqueta2,
                            restauranteUsuario.etiqueta3
                        ].filter(etiqueta => 
                            etiqueta && 
                            etiqueta !== '' && 
                            etiqueta !== 'Seleccionar' && 
                            etiqueta.trim() !== ''
                        );
                        
                        if (etiquetasIndividuales.length > 0) {
                            cargarEtiquetasRestaurante(etiquetasIndividuales.join(', '));
                        } else if (restauranteUsuario.etiquetas) {
                            cargarEtiquetasRestaurante(restauranteUsuario.etiquetas);
                        }
                        
                        return;
                    } else {
                        throw new Error('No se encontró ningún restaurante asociado al usuario');
                    }
                } else {
                    throw new Error(`Error al obtener restaurantes: ${response.status}`);
                }
                
            } catch (fetchError) {
                throw fetchError;
            }

        } catch (error) {
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
            const menuSpan = label.querySelector('span');
            
            if (menuSpan) {
                const nombreArchivo = restaurante.menu.split('/').pop() || restaurante.menu;
                menuSpan.textContent = nombreArchivo;
            }
        }
    }

    const estadoMembresia = window.estadoMembresiaRestaurante || "activa";
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
        
        selectsEtiquetas.forEach((select, index) => {
            if (select.value && select.value !== '' && select.value !== 'Seleccionar') {
                etiquetasSeleccionadas.push(select.value);
            }
        });
        
        return etiquetasSeleccionadas.join(', ');
    };

    window.cargarEtiquetasRestaurante = function(etiquetasString) {
        if (!etiquetasString) {
            return;
        }
        
        const etiquetasArray = etiquetasString.split(',').map(e => e.trim()).filter(e => e !== '');
        
        etiquetasArray.forEach((etiqueta, index) => {
            if (index < selectsEtiquetas.length) {
                console.log(`🏷️ Asignando etiqueta ${index + 1}: "${etiqueta}" al select`);
                selectsEtiquetas[index].value = etiqueta;
                
                if (selectsEtiquetas[index].value === etiqueta) {
                    console.log(`✅ Etiqueta ${index + 1} asignada correctamente`);
                } else {
                    console.warn(`❌ Error al asignar etiqueta ${index + 1}: "${etiqueta}". Valor actual: "${selectsEtiquetas[index].value}"`);
                    // Verificar si la opción existe en el select
                    const opcionExiste = Array.from(selectsEtiquetas[index].options).some(option => option.value === etiqueta);
                    console.log(`🔍 ¿La opción "${etiqueta}" existe en el select?`, opcionExiste);
                }
            }
        });
        
        selectsEtiquetas.forEach((select, index) => {
        });
    };

    function establecerEtiquetasPorDefecto() {
        const etiquetasPorDefecto = ['Seleccionar', 'Seleccionar', 'Seleccionar'];
        etiquetasPorDefecto.forEach((etiqueta, index) => {
            if (index < selectsEtiquetas.length) {
                selectsEtiquetas[index].value = etiqueta;
            }
        });
    }

    establecerEtiquetasPorDefecto();

    const menuInput = document.getElementById('menuInput');
    if (menuInput) {
        menuInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const btnMenu = document.querySelector('.btn-menu');
            const menuSpan = btnMenu.querySelector('span');
            
            if (file) {
                menuSpan.textContent = file.name;
            } else {
                menuSpan.textContent = 'Seleccionar archivo PDF';
            }
        });
    }

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
            console.log('🏷️ Etiquetas obtenidas:', etiquetasSeleccionadas);

            const direccion = document.querySelector('input[placeholder="Ingrese la dirección"]')?.value || '';
            const telefono = document.querySelector('input[placeholder="Ingrese su número celular"]')?.value || '';
            const horario = document.querySelector('.horarios-inputs input')?.value || '';
            const instagram = document.querySelector('input[placeholder="Ingrese su instagram"]')?.value || '';
            const facebook = document.querySelector('input[placeholder="Ingrese su facebook"]')?.value || '';
            const img1Input = document.getElementById('imgGaleria1Input');
            const img2Input = document.getElementById('imgGaleria2Input');
            const img3Input = document.getElementById('imgGaleria3Input');

            console.log('img1Input:', img1Input, 'files:', img1Input && img1Input.files);
            console.log('img2Input:', img2Input, 'files:', img2Input && img2Input.files);
            console.log('img3Input:', img3Input, 'files:', img3Input && img3Input.files);
            const menuInput = document.getElementById('menuInput');

            const formData = new FormData();
            formData.append('restaurante', window.restauranteActual.restaurante || window.restauranteActual.nombre || '');
            formData.append('correo', window.restauranteActual.correo || '');
            formData.append('direccion', direccion);
            formData.append('numero', telefono);
            formData.append('horario', horario);
            formData.append('facebook', facebook);
            formData.append('instagram', instagram);

            const etiquetasArray = etiquetasSeleccionadas.split(',').map(e => e.trim()).filter(e => e !== '');
            console.log('🏷️ Array de etiquetas procesado:', etiquetasArray);
            
            formData.append('etiqueta1', etiquetasArray[0] || 'Seleccionar');
            formData.append('etiqueta2', etiquetasArray[1] || 'Seleccionar');
            formData.append('etiqueta3', etiquetasArray[2] || 'Seleccionar');
            
            console.log('📤 Etiquetas que se enviarán:', {
                etiqueta1: etiquetasArray[0] || 'Seleccionar',
                etiqueta2: etiquetasArray[1] || 'Seleccionar', 
                etiqueta3: etiquetasArray[2] || 'Seleccionar'
            });

            if (img1Input && img1Input.files && img1Input.files[0]) {
                formData.append('imagen1', img1Input.files[0]);
            }
            if (img2Input && img2Input.files && img2Input.files[0]) {
                formData.append('imagen2', img2Input.files[0]);
            }
            if (img3Input && img3Input.files && img3Input.files[0]) {
                formData.append('imagen3', img3Input.files[0]);
            }
            if (menuInput && menuInput.files && menuInput.files[0]) {
                formData.append('menu', menuInput.files[0]);
            }

    const formDataPreview = {};
    formData.forEach((value, key) => {
        if (value instanceof File) {
            formDataPreview[key] = {
                name: value.name,
                size: value.size,
                type: value.type
            };
        } else {
            formDataPreview[key] = value;
        }
    });
    console.log('📦 Datos a enviar al backend:', formDataPreview);

            try {
                const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
                const correoUsuario = sessionStorage.getItem('correo') || localStorage.getItem('correo');
                const idSolicitud = (window.restauranteActual && (window.restauranteActual.id_solicitud || window.restauranteActual.id || window.restauranteActual.idSolicitud))
                    || (window.solicitudUsuario && (window.solicitudUsuario.id_solicitud || window.solicitudUsuario.id));
                if (!idSolicitud) {
                    alert('❌ No se puede actualizar: No se tiene el ID de la solicitud');
                    return;
                }
                const endpointUrl = `http://75.101.159.172:7070/solicitudes/${idSolicitud}`;
                const endpointUrlWithFiles = `http://75.101.159.172:7070/solicitudes/${idSolicitud}/with-files`;
                const response = await fetch(endpointUrlWithFiles, {
                    method: 'PUT',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json();
                    console.log('✅ Respuesta del servidor:', responseData);
                    alert('✅ Datos del restaurante actualizados correctamente con archivos');
                    await cargarDatosRestauranteUsuario();
                } else {
                    const errorText = await response.text();
                    console.error('❌ Error del servidor:', response.status, errorText);
                    alert(`❌ Error al actualizar (${response.status}): ${errorText}`);
                }

            } catch (error) {
                console.error('❌ Error al guardar:', error);
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    alert('❌ Error de conexión: Verifique que el backend esté ejecutándose en http://75.101.159.172:7070');
                } else if (error.message.includes('CORS')) {
                    alert('❌ Error CORS: El backend no permite conexiones desde este origen');
                } else {
                    alert(`❌ Error de conexión al guardar los datos: ${error.message}`);
                }
            }
        });
    }

});
