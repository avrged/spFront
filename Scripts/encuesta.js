function initEncuestaForm() {
    const form = document.getElementById('encuestaForm');
    const atraccion = document.getElementById('atraccion');
    const origen = document.getElementById('origen');

    if (!form || !atraccion || !origen) {
        return;
    }

    form.addEventListener('submit', async function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
        e.preventDefault();

        const restaurante = window.restauranteActual;
        const params = new URLSearchParams(window.location.search);
        const restauranteId = params.get('id');
        const correo = params.get('correo');

        const data = {
            atraccion: atraccion.value,
            origen: origen.value,
            restauranteId: restauranteId || restaurante?.id,
            correoRestaurante: correo || restaurante?.correo,
            nombreRestaurante: restaurante?.restaurante
        };

        try {
            
            try {
                const estadisticasPayload = {
                    correo: correo || restaurante?.correo,
                    accion: 'incrementar'
                };

                if (origen.value === 'nacional') {
                    estadisticasPayload.incrementar_nacional = 1;
                } else if (origen.value === 'extranjero') {
                    estadisticasPayload.incrementar_extranjero = 1;
                }

                estadisticasPayload.incrementar_descargas = 1;

                const getResponse = await fetch(`http://75.101.159.172:7070/estadisticas?correo=${encodeURIComponent(correo || restaurante?.correo)}`);
                
                if (!getResponse.ok) {
                    const errorText = await getResponse.text();
                    throw new Error(`Error al obtener estadística: ${getResponse.status} - ${errorText}`);
                }
                
                const responseText = await getResponse.text();
                
                let estadisticaExistente;
                try {
                    estadisticaExistente = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error(`Respuesta no es JSON válido: ${responseText.substring(0, 100)}`);
                }
                
                let estadisticaId;
                let valoresActuales = {
                    nacional: 0,
                    extranjero: 0,
                    descargas: 0,
                    comida: 0,
                    vista: 0,
                    horario: 0,
                    recomendacion: 0,
                    ubicacion: 0
                };
                
                const correoObjectivo = correo || restaurante?.correo;
                console.log('🎯 Buscando estadística para correo:', correoObjectivo);
                
                if (Array.isArray(estadisticaExistente)) {
                    const estadisticaCorrecta = estadisticaExistente.find(est => est.correo === correoObjectivo);
                    
                    if (estadisticaCorrecta) {
                        estadisticaId = estadisticaCorrecta.id_estadistica;
                        valoresActuales.correoOriginal = estadisticaCorrecta.correo; 
                        valoresActuales.nacional = estadisticaCorrecta.nacional || 0;
                        valoresActuales.extranjero = estadisticaCorrecta.extranjero || 0;
                        valoresActuales.descargas = estadisticaCorrecta.descargas || 0;
                        valoresActuales.comida = estadisticaCorrecta.comida || 0;
                        valoresActuales.vista = estadisticaCorrecta.vista || 0;
                        valoresActuales.horario = estadisticaCorrecta.horario || 0;
                        valoresActuales.recomendacion = estadisticaCorrecta.recomendacion || 0;
                        valoresActuales.ubicacion = estadisticaCorrecta.ubicacion || 0;
                        console.log('✅ Estadística encontrada para correo:', correoObjectivo);
                    } else {
                        console.error('❌ No se encontró estadística para el correo:', correoObjectivo);
                        console.error('📋 Correos disponibles:', estadisticaExistente.map(est => est.correo));
                        throw new Error(`No se encontró estadística para el correo: ${correoObjectivo}`);
                    }
                } else if (estadisticaExistente.id_estadistica) {
                    if (estadisticaExistente.correo === correoObjectivo) {
                        estadisticaId = estadisticaExistente.id_estadistica;
                        valoresActuales.correoOriginal = estadisticaExistente.correo;
                        valoresActuales.nacional = estadisticaExistente.nacional || 0;
                        valoresActuales.extranjero = estadisticaExistente.extranjero || 0;
                        valoresActuales.descargas = estadisticaExistente.descargas || 0;
                        valoresActuales.comida = estadisticaExistente.comida || 0;
                        valoresActuales.vista = estadisticaExistente.vista || 0;
                        valoresActuales.horario = estadisticaExistente.horario || 0;
                        valoresActuales.recomendacion = estadisticaExistente.recomendacion || 0;
                        valoresActuales.ubicacion = estadisticaExistente.ubicacion || 0;
                        console.log('✅ Estadística directa encontrada para correo:', correoObjectivo);
                    } else {
                        console.error('❌ El correo no coincide:', {
                            esperado: correoObjectivo,
                            recibido: estadisticaExistente.correo
                        });
                        throw new Error(`Correo no coincide. Esperado: ${correoObjectivo}, Recibido: ${estadisticaExistente.correo}`);
                    }
                } else {
                    console.error('❌ Estructura de estadística no reconocida:', estadisticaExistente);
                    throw new Error('No se encontró id_estadistica en la respuesta');
                }

                if (!estadisticaId) {
                    throw new Error('ID de estadística es null o undefined');
                }

                console.log('📊 Valores actuales:', valoresActuales);

                const nuevosValores = {
                    correo: valoresActuales.correoOriginal || (correo || restaurante?.correo),
                    nacional: valoresActuales.nacional,
                    extranjero: valoresActuales.extranjero,
                    descargas: valoresActuales.descargas + 1, 
                    comida: valoresActuales.comida,
                    vista: valoresActuales.vista,
                    horario: valoresActuales.horario,
                    recomendacion: valoresActuales.recomendacion,
                    ubicacion: valoresActuales.ubicacion
                };

                if (origen.value === 'nacional') {
                    nuevosValores.nacional = valoresActuales.nacional + 1;
                } else if (origen.value === 'extranjero') {
                    nuevosValores.extranjero = valoresActuales.extranjero + 1;
                }

                if (atraccion.value === 'comida') {
                    nuevosValores.comida = valoresActuales.comida + 1;
                } else if (atraccion.value === 'vista') {
                    nuevosValores.vista = valoresActuales.vista + 1;
                } else if (atraccion.value === 'horario') {
                    nuevosValores.horario = valoresActuales.horario + 1;
                } else if (atraccion.value === 'recomendacion') {
                    nuevosValores.recomendacion = valoresActuales.recomendacion + 1;
                } else if (atraccion.value === 'ubicacion') {
                    nuevosValores.ubicacion = valoresActuales.ubicacion + 1;
                }

                console.log('📈 Valores incrementados:', {
                    antes: valoresActuales,
                    despues: nuevosValores,
                    incremento_origen: origen.value,
                    incremento_atraccion: atraccion.value
                });

                console.log('🆔 ID de estadística encontrado:', estadisticaId);
                console.log('🔗 URL PUT final:', `http://75.101.159.172:7070/estadisticas/${estadisticaId}`);

                const encuestaResponse = await fetch(`http://75.101.159.172:7070/estadisticas/${estadisticaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevosValores)
                });

                console.log('📈 Respuesta del servidor de estadísticas:', {
                    status: encuestaResponse.status,
                    statusText: encuestaResponse.statusText,
                    ok: encuestaResponse.ok
                });

                if (encuestaResponse.ok) {
                    const resultado = await encuestaResponse.text();
                    console.log('✅ Respuesta PUT cruda:', resultado);
                    
                    try {
                        const resultadoParsed = JSON.parse(resultado);
                        console.log('✅ Estadísticas actualizadas:', resultadoParsed);
                    } catch (parseError) {
                        console.log('✅ Respuesta PUT (texto):', resultado);
                    }
                } else {
                    try {
                        const errorText = await encuestaResponse.text();
                        console.error('❌ Error del servidor (estadísticas):', {
                            status: encuestaResponse.status,
                            error: errorText
                        });
                    } catch (e) {
                        console.warn('⚠️ Error al actualizar estadísticas:', encuestaResponse.status);
                    }
                }
            } catch (estadisticasError) {
                console.error('❌ Error al enviar estadísticas:', estadisticasError);
            }

            if (restaurante && restaurante.menu) {
                console.log('📄 Descargando menú desde:', restaurante.menu);
                
                let menuUrl = restaurante.menu;
                
                if (menuUrl.includes('localhost:7070')) {
                    menuUrl = menuUrl.replace('localhost:7070', '75.101.159.172:7070');
                    console.log('🔄 URL corregida para descarga:', menuUrl);
                }
                
                if (!menuUrl.startsWith('http')) {
                    menuUrl = `http://75.101.159.172:7070${menuUrl}`;
                }
                
                try {
                    console.log('⬇️ Intentando descargar desde:', menuUrl);
                    
                    const menuResponse = await fetch(menuUrl);
                    
                    console.log('📥 Respuesta de descarga:', {
                        status: menuResponse.status,
                        statusText: menuResponse.statusText,
                        ok: menuResponse.ok
                    });
                    
                    if (menuResponse.ok) {
                        const blob = await menuResponse.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `menu_${restaurante.restaurante || 'restaurante'}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        window.URL.revokeObjectURL(downloadUrl);
                        
                        console.log('✅ Menú descargado exitosamente');
                    } else {
                        console.error('❌ Error al descargar el menú:', menuResponse.status);
                        alert('No se pudo descargar el menú. Por favor, contacta al restaurante.');
                    }
                } catch (downloadError) {
                    console.error('❌ Error en la descarga:', downloadError);
                    
                    if (downloadError.message.includes('CORS') || downloadError.message.includes('NetworkError')) {
                        alert('Error de conexión al descargar el menú. El servidor puede no estar disponible.');
                    } else {
                        alert('Error al descargar el menú.');
                    }
                }
            } else {
                console.warn('⚠️ No hay menú disponible para este restaurante');
                alert('Este restaurante no tiene menú disponible para descarga.');
            }

            if (typeof closeEncuestaModal === "function") {
                closeEncuestaModal();
            } else if (typeof cerrarModalEncuesta === "function") {
                cerrarModalEncuesta();
            }
            
        } catch (error) {
            console.error('❌ Error al procesar la encuesta:', error);
            alert('Ocurrió un error al enviar la encuesta.');
        }
    });

    function validateForm() {
        let isValid = true;
        if (!atraccion.value) {
            showError(atraccion, 'Por favor selecciona una respuesta');
            isValid = false;
        } else {
            removeError(atraccion);
        }
        if (!origen.value) {
            showError(origen, 'Por favor selecciona una respuesta');
            isValid = false;
        } else {
            removeError(origen);
        }
        return isValid;
    }

    function showError(element, message) {
        removeError(element);
        element.classList.add('error');
        let errorSpan = null;
        if (element.id === 'atraccion') {
            errorSpan = document.getElementById('error-atraccion');
        } else if (element.id === 'origen') {
            errorSpan = document.getElementById('error-origen');
        }
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }

    function removeError(element) {
        element.classList.remove('error');
        let errorSpan = null;
        if (element.id === 'atraccion') {
            errorSpan = document.getElementById('error-atraccion');
        } else if (element.id === 'origen') {
            errorSpan = document.getElementById('error-origen');
        }
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    }

    function handleSuccessfulSubmit() {
    }

    function getOptionText(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        return selectedOption.text;
    }
}

function descargarMenuPDF(restauranteId) {
    const pdfUrl = `../menus/menu_${restauranteId}.pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `menu_${restauranteId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.initEncuestaForm = initEncuestaForm;