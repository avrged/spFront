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
                const response = await fetch('http://52.23.26.163:7070/solicitudes', {
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
                        const solicitudesResult = await responseSolicitudes.json();
                        const solicitudes = solicitudesResult.data || [];
                        const solicitudUsuario = solicitudes.find(s => 
                            s.correo && s.correo.toLowerCase() === correoUsuario.toLowerCase()
                        );
                        if (solicitudUsuario) {
                            telefonoUsuario = solicitudUsuario.telefono || 
                                            solicitudUsuario.numero ||
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
                } catch (errorSolicitudes) {}
            }

            try {
                let idRestauranteroValido = idUsuario;
                if (window.solicitudUsuario && window.solicitudUsuario.id_restaurantero) {
                    idRestauranteroValido = window.solicitudUsuario.id_restaurantero;
                }
                if (idRestauranteroValido) {
                    const restauranteResponse = await fetch(`http://52.23.26.163:7070/restaurantes/restaurantero/${idRestauranteroValido}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (restauranteResponse.ok) {
                        const restauranteResult = await restauranteResponse.json();
                        const restaurantes = restauranteResult.data || [];
                        if (restaurantes.length > 0) {
                            const restauranteUsuario = restaurantes[0];
                            window.restauranteActual = restauranteUsuario;
                            cargarDatosEnFormulario(restauranteUsuario, window.solicitudUsuario);
                            if (restauranteUsuario.id_restaurantero) {
                                await cargarImagenesRestaurante(restauranteUsuario.id_restaurantero);
                            }
                            if (restauranteUsuario.etiquetas) {
                                cargarEtiquetasRestaurante(restauranteUsuario.etiquetas);
                            }
                            return;
                        }
                    }
                }
                response = await fetch('http://52.23.26.163:7070/solicitudes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const restaurantesResult = await response.json();
                    const restaurantes = restaurantesResult.data || [];
                    let restauranteUsuario = null;
                    if (Array.isArray(restaurantes)) {
                        if (correoUsuario) {
                            restauranteUsuario = restaurantes.find(r => {
                                return r.correo && r.correo.toLowerCase() === correoUsuario.toLowerCase();
                            });
                        }
                        if (!restauranteUsuario && telefonoUsuario && telefonoUsuario.trim() !== '') {
                            const telefonoLimpio = telefonoUsuario.replace(/[\s\-\(\)]/g, '');
                            restauranteUsuario = restaurantes.find(r => {
                                const telefonoRestaurante = r.telefono || r.numero;
                                if (!telefonoRestaurante) return false;
                                const telefonoRestauranteLimpio = telefonoRestaurante.toString().replace(/[\s\-\(\)]/g, '');
                                return telefonoRestauranteLimpio === telefonoLimpio;
                            });
                        }
                        if (!restauranteUsuario && idUsuario) {
                            restauranteUsuario = restaurantes.find(r => {
                                return r.id_restaurantero && r.id_restaurantero.toString() === idUsuario.toString();
                            });
                        }
                    }
                    if (restauranteUsuario) {
                        window.restauranteActual = restauranteUsuario;
                        cargarDatosEnFormulario(restauranteUsuario, window.solicitudUsuario);
                        if (restauranteUsuario.id_restaurantero) {
                            await cargarImagenesRestaurante(restauranteUsuario.id_restaurantero);
                        }
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

    async function cargarImagenesRestaurante(idRestaurantero) {
        try {
            console.log('🖼️ Cargando imágenes para restaurantero ID:', idRestaurantero);
            
            const response = await fetch(`http://52.23.26.163:7070/imagenes/restaurantero/${idRestaurantero}`);
            
            if (response.ok) {
                const result = await response.json();
                const imagenes = result.data || [];
                
                console.log('🖼️ Respuesta del endpoint de imágenes:', result);
                console.log('🖼️ Imágenes encontradas:', imagenes);
                
                // Guardar las imágenes en una variable global para usar en actualizaciones
                window.imagenesRestaurante = imagenes;
                
                if (imagenes.length > 0) {
                    // Cargar las imágenes en orden
                    const img1 = document.getElementById('imgGaleria1');
                    const img2 = document.getElementById('imgGaleria2');
                    const img3 = document.getElementById('imgGaleria3');
                    
                    if (imagenes[0] && img1) {
                        img1.src = imagenes[0].ruta_imagen || '../images/imagen.png';
                        console.log('🖼️ Imagen 1 cargada:', imagenes[0].ruta_imagen, 'ID:', imagenes[0].id_imagen);
                    }
                    
                    if (imagenes[1] && img2) {
                        img2.src = imagenes[1].ruta_imagen || '../images/imagen.png';
                        console.log('🖼️ Imagen 2 cargada:', imagenes[1].ruta_imagen, 'ID:', imagenes[1].id_imagen);
                    }
                    
                    if (imagenes[2] && img3) {
                        img3.src = imagenes[2].ruta_imagen || '../images/imagen.png';
                        console.log('🖼️ Imagen 3 cargada:', imagenes[2].ruta_imagen, 'ID:', imagenes[2].id_imagen);
                    }
                } else {
                    console.log('🖼️ No se encontraron imágenes para este restaurante');
                    window.imagenesRestaurante = [];
                }
            } else {
                console.log('🖼️ Error al obtener imágenes:', response.status, response.statusText);
                window.imagenesRestaurante = [];
            }
        } catch (error) {
            console.error('🖼️ Error al cargar imágenes:', error);
            window.imagenesRestaurante = [];
        }
    }

    function cargarDatosEnFormulario(restaurante) {
        console.log('📝 ===== INICIANDO CARGA DE DATOS EN FORMULARIO =====');
        console.log('📝 Datos del restaurante recibidos:', restaurante);
        
        const nombreElement = document.getElementById('restauranteNombre');
        if (nombreElement) {
            
            const nombreRestaurante = restaurante.nombre || 
                                    restaurante.nombre_propuesto_restaurante || 
                                    restaurante.restaurante || 
                                    'Mi Restaurante';
            nombreElement.textContent = nombreRestaurante;
            console.log('📝 ✅ Nombre del restaurante cargado:', nombreRestaurante);
        } else {
            console.log('📝 ❌ No se encontró el elemento restauranteNombre');
        }

        const inputUbicacion = document.querySelector('input[placeholder="Ingrese la dirección"]');
        console.log('📝 🔍 Input de ubicación encontrado:', !!inputUbicacion);
        console.log('📝 🔍 Dirección del restaurante:', restaurante.direccion);
        if (inputUbicacion && restaurante.direccion) {
            inputUbicacion.value = restaurante.direccion;
            console.log('📝 ✅ Dirección cargada en input:', restaurante.direccion);
        } else {
            console.log('📝 ❌ No se pudo cargar dirección. Input encontrado:', !!inputUbicacion, 'Dirección disponible:', !!restaurante.direccion);
        }

        const inputTelefono = document.querySelector('input[placeholder="Ingrese su número celular"]');
        console.log('📝 🔍 Input de teléfono encontrado:', !!inputTelefono);
       
        const telefonoValue = restaurante.telefono || restaurante.numero;
        console.log('📝 🔍 Teléfono del restaurante:', telefonoValue);
        if (inputTelefono && telefonoValue) {
            inputTelefono.value = telefonoValue;
            console.log('📝 ✅ Teléfono cargado en input:', telefonoValue);
        } else {
            console.log('📝 ❌ No se pudo cargar teléfono. Input encontrado:', !!inputTelefono, 'Teléfono disponible:', !!telefonoValue);
        }

        const horariosInputs = document.querySelectorAll('.horarios-inputs input');
        console.log('📝 🔍 Inputs de horario encontrados:', horariosInputs.length);
        
        const horarioValue = restaurante.horario || restaurante.horario_atencion;
        console.log('📝 🔍 Horario del restaurante:', horarioValue);
        if (horarioValue && horariosInputs.length > 0) {
            horariosInputs[0].value = horarioValue;
            console.log('📝 ✅ Horario cargado en input:', horarioValue);
        } else {
            console.log('📝 ❌ No se pudo cargar horario. Inputs encontrados:', horariosInputs.length, 'Horario disponible:', !!horarioValue);
        }
        
        const inputInstagram = document.querySelector('input[placeholder="Ingrese su instagram"]');
        console.log('📝 🔍 Input de Instagram encontrado:', !!inputInstagram);
        console.log('📝 🔍 Instagram del restaurante:', restaurante.instagram);
        if (inputInstagram && restaurante.instagram) {
            inputInstagram.value = restaurante.instagram;
            console.log('📝 ✅ Instagram cargado en input:', restaurante.instagram);
        } else {
            console.log('📝 ❌ No se pudo cargar Instagram. Input encontrado:', !!inputInstagram, 'Instagram disponible:', !!restaurante.instagram);
        }

        const inputFacebook = document.querySelector('input[placeholder="Ingrese su facebook"]');
        console.log('📝 🔍 Input de Facebook encontrado:', !!inputFacebook);
        console.log('📝 🔍 Facebook del restaurante:', restaurante.facebook);
        if (inputFacebook && restaurante.facebook) {
            inputFacebook.value = restaurante.facebook;
            console.log('📝 ✅ Facebook cargado en input:', restaurante.facebook);
        } else {
            console.log('📝 ❌ No se pudo cargar Facebook. Input encontrado:', !!inputFacebook, 'Facebook disponible:', !!restaurante.facebook);
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
        
        console.log('📝 ===== CARGA DE DATOS COMPLETADA =====');
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

    async function actualizarImagenesIndividuales(img1Input, img2Input, img3Input) {
        const imagenesParaActualizar = [];
        
        if (img1Input && img1Input.files && img1Input.files[0] && window.imagenesRestaurante && window.imagenesRestaurante[0]) {
            imagenesParaActualizar.push({
                input: img1Input,
                idImagen: window.imagenesRestaurante[0].id_imagen,
                numero: 1
            });
        }
        
        if (img2Input && img2Input.files && img2Input.files[0] && window.imagenesRestaurante && window.imagenesRestaurante[1]) {
            imagenesParaActualizar.push({
                input: img2Input,
                idImagen: window.imagenesRestaurante[1].id_imagen,
                numero: 2
            });
        }
        
        if (img3Input && img3Input.files && img3Input.files[0] && window.imagenesRestaurante && window.imagenesRestaurante[2]) {
            imagenesParaActualizar.push({
                input: img3Input,
                idImagen: window.imagenesRestaurante[2].id_imagen,
                numero: 3
            });
        }

        for (const imagen of imagenesParaActualizar) {
            try {
                console.log(`🖼️ Actualizando imagen ${imagen.numero} con id_imagen: ${imagen.idImagen}`);
                
                const formData = new FormData();
                formData.append('ruta_imagen', imagen.input.files[0]);
                
                const response = await fetch(`http://52.23.26.163:7070/imagenes/${imagen.idImagen}`, {
                    method: 'PUT',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`✅ Imagen ${imagen.numero} actualizada correctamente:`, result);
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Error al actualizar imagen ${imagen.numero}:`, response.status, errorText);
                    throw new Error(`Error al actualizar imagen ${imagen.numero}: ${response.status} - ${errorText}`);
                }
                
            } catch (error) {
                console.error(`❌ Error al actualizar imagen ${imagen.numero}:`, error);
                throw error;
            }
        }
        
        if (imagenesParaActualizar.length > 0) {
            console.log(`✅ Se actualizaron ${imagenesParaActualizar.length} imágenes correctamente`);
        } else {
            console.log('ℹ️ No hay imágenes nuevas para actualizar');
        }
    }

    async function actualizarDatosRestaurante(direccion, telefono, horario, instagram, facebook, etiquetas) {
        try {
            const idRestaurante = window.restauranteActual.id_restaurante || 
                                window.restauranteActual.id || 
                                window.restauranteActual.restaurante_id;
            
            console.log('🏢 Datos completos del restaurante actual:', window.restauranteActual);
            console.log('🏢 ID del restaurante encontrado:', idRestaurante);
            console.log('🏢 Tipo de ID:', typeof idRestaurante);
            
            if (!idRestaurante) {
                console.error('❌ No se encontró el ID del restaurante en ningún campo');
                console.log('🔍 Campos disponibles en restauranteActual:', Object.keys(window.restauranteActual));
                throw new Error('No se encontró el ID del restaurante');
            }

            console.log('🏢 Actualizando datos del restaurante con ID:', idRestaurante);

            const datosRestaurante = {
                horario: horario,
                telefono: telefono,
                etiquetas: etiquetas,
                direccion: direccion,
                facebook: facebook,
                instagram: instagram
            };

            console.log('📤 Datos a enviar:', datosRestaurante);
            console.log('🌐 URL del endpoint:', `http://52.23.26.163:7070/restaurantes/actualizar/${idRestaurante}`);

            const response = await fetch(`http://52.23.26.163:7070/restaurantes/actualizar/${idRestaurante}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosRestaurante)
            });

            console.log('📡 Respuesta del servidor - Status:', response.status);
            console.log('📡 Respuesta del servidor - StatusText:', response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Datos del restaurante actualizados correctamente:', result);
            } else {
                const errorText = await response.text();
                console.error('❌ Error al actualizar datos del restaurante:', response.status, errorText);
                throw new Error(`Error al actualizar datos del restaurante: ${response.status} - ${errorText}`);
            }

        } catch (error) {
            console.error('❌ Error al actualizar datos del restaurante:', error);
            throw error;
        }
    }

    async function actualizarMenu(menuInput, idRestaurantero) {
        if (!menuInput || !menuInput.files || !menuInput.files[0] || !idRestaurantero) {
            console.log('ℹ️ No hay menú nuevo para actualizar o falta idRestaurantero');
            return;
        }

        try {
            console.log('📄 Actualizando menú para restaurantero ID:', idRestaurantero);
            
            const formData = new FormData();
            formData.append('ruta_archivo', menuInput.files[0]);
            formData.append('ruta_menu', menuInput.files[0]);
            const response = await fetch(`http://52.23.26.163:7070/menus/restaurantero/${idRestaurantero}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Menú actualizado correctamente:', result);
            } else {
                const errorText = await response.text();
                console.error('❌ Error al actualizar menú:', response.status, errorText);
                throw new Error(`Error al actualizar menú: ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error('❌ Error al actualizar menú:', error);
            throw error;
        }
    }

    const btnAplicar = document.querySelector('.btn-aplicar');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', async function() {
            if (!window.restauranteActual) {
                alert('❌ No se han cargado los datos del restaurante');
                return;
            }

           
            const direccion = document.querySelector('input[placeholder="Ingrese la dirección"]')?.value || '';
            const telefono = document.querySelector('input[placeholder="Ingrese su número celular"]')?.value || '';
            const horario = document.querySelector('.horarios-inputs input')?.value || '';
            const instagram = document.querySelector('input[placeholder="Ingrese su instagram"]')?.value || '';
            const facebook = document.querySelector('input[placeholder="Ingrese su facebook"]')?.value || '';
            const etiquetasSeleccionadas = obtenerEtiquetasSeleccionadas();

      
            const img1Input = document.getElementById('imgGaleria1Input');
            const img2Input = document.getElementById('imgGaleria2Input');
            const img3Input = document.getElementById('imgGaleria3Input');
            const menuInput = document.getElementById('menuInput');

            console.log('🖼️ Verificando imágenes seleccionadas:');
            console.log('img1Input:', img1Input, 'files:', img1Input && img1Input.files);
            console.log('img2Input:', img2Input, 'files:', img2Input && img2Input.files);
            console.log('img3Input:', img3Input, 'files:', img3Input && img3Input.files);
            console.log('📄 Verificando menú seleccionado:', menuInput, 'files:', menuInput && menuInput.files);

            console.log('🏢 Datos del restaurante actual:', window.restauranteActual);

            try {
                await actualizarImagenesIndividuales(img1Input, img2Input, img3Input);
                
                await actualizarDatosRestaurante(direccion, telefono, horario, instagram, facebook, etiquetasSeleccionadas);
                
                if (menuInput && menuInput.files && menuInput.files[0] && window.restauranteActual.id_restaurantero) {
                    await actualizarMenu(menuInput, window.restauranteActual.id_restaurantero);
                }
                
                console.log('✅ Proceso de actualización completado');
                alert('✅ Datos del restaurante actualizados correctamente');
                
                await cargarDatosRestauranteUsuario();

            } catch (error) {
                console.error('❌ Error al guardar:', error);
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    alert('❌ Error de conexión: Verifique que el backend esté ejecutándose');
                } else if (error.message.includes('CORS')) {
                    alert('❌ Error CORS: El backend no permite conexiones desde este origen');
                } else {
                    alert(`❌ Error al actualizar: ${error.message}`);
                }
            }
        });
    }

});
