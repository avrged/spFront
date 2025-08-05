
async function prefetchCantidadDescargas() {
    const restaurante = window.restauranteActual;
    const params = new URLSearchParams(window.location.search);
    const restauranteId = params.get('id');
    const idRestaurantero = restaurante?.id_restaurantero || restauranteId;
    if (!idRestaurantero) return;
    try {
        const resp = await fetch(`http://52.23.26.163:7070/descargas/restaurantero/${idRestaurantero}?_=${Date.now()}`);
        if (resp.ok) {
            const data = await resp.json();
            if (data && Array.isArray(data.data) && data.data.length > 0) {
                console.log('🟢 [PRE] Lista completa de descargas:', data.data);
                const first = data.data[0];
                console.log('🟢 [PRE] Primer objeto (más reciente) recibido del backend:', first);
            } else if (data && typeof data.data?.cantidad_descargas === 'number') {
                console.log('🟢 [PRE] Lista de descargas (objeto único):', data.data);
            }
        }
    } catch (e) {
        console.warn('[PRE] No se pudo obtener la cantidad de descargas actual');
    }
}
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

        
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

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
            
            if (restaurante && restaurante.menu) {
                console.log('📄 Descargando menú desde:', restaurante.menu);
                let menuUrlOriginal = restaurante.menu;
                let menuUrlAlterna = menuUrlOriginal;
                
                if (menuUrlOriginal.includes('52.23.26.163:7070')) {
                    menuUrlAlterna = menuUrlOriginal.replace('52.23.26.163:7070', '75.101.159.172:7070');
                    console.log('🔄 URL corregida para descarga:', menuUrlAlterna);
                } else if (!menuUrlOriginal.startsWith('http')) {
                    
                    menuUrlAlterna = `http://75.101.159.172:7070${menuUrlOriginal}`;
                }

                let descargado = false;
                let ultimoStatus = null;
                let urlsAProbar = [menuUrlOriginal];
                if (menuUrlAlterna !== menuUrlOriginal) {
                    urlsAProbar.push(menuUrlAlterna);
                }

                for (let url of urlsAProbar) {
                    try {
                        console.log('⬇️ Intentando descargar desde:', url);
                        const menuResponse = await fetch(url);
                        console.log('📥 Respuesta de descarga:', {
                            status: menuResponse.status,
                            statusText: menuResponse.statusText,
                            ok: menuResponse.ok
                        });
                        ultimoStatus = menuResponse.status;
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
                            descargado = true;
                            break;
                        }
                    } catch (downloadError) {
                        console.error('❌ Error en la descarga:', downloadError);
                        ultimoStatus = downloadError.message;
                    }
                }
                if (!descargado) {
                    alert('No se pudo descargar el menú. Por favor, contacta al restaurante.');
                }
            } else {
                console.warn('⚠️ No hay menú disponible para este restaurante');
                alert('Este restaurante no tiene menú disponible para descarga.');
            }

            
            const idRestaurantero = restaurante?.id_restaurantero || restauranteId;
            
            let origenEncuesta = origen.value;
            if (origenEncuesta.toLowerCase() === 'nacional') origenEncuesta = 'Nacional';
            if (origenEncuesta.toLowerCase() === 'extranjero') origenEncuesta = 'Extranjero';

            
            let opinionEncuesta = atraccion.value.trim().toLowerCase();
            if (opinionEncuesta === 'comida' || opinionEncuesta === 'la comida') opinionEncuesta = 'La comida';
            if (opinionEncuesta === 'ubicacion' || opinionEncuesta === 'la ubicacion') opinionEncuesta = 'La ubicacion';
            if (opinionEncuesta === 'recomendacion') opinionEncuesta = 'Recomendacion';
            if (opinionEncuesta === 'horario' || opinionEncuesta === 'el horario') opinionEncuesta = 'El horario';
            if (opinionEncuesta === 'vista' || opinionEncuesta === 'la vista') opinionEncuesta = 'La vista';


            if (idRestaurantero) {
                
                let cantidadDescargas = 1;
                try {
                    const resp = await fetch(`http://52.23.26.163:7070/descargas/restaurantero/${idRestaurantero}?_=${Date.now()}`);
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data && Array.isArray(data.data) && data.data.length > 0) {
                            const first = data.data[0];
                            console.log('🟢 Primer objeto (más reciente) recibido del backend:', first);
                            if (typeof first.cantidad_descargas === 'number') {
                                cantidadDescargas = first.cantidad_descargas;
                            }
                        } else if (data && typeof data.data?.cantidad_descargas === 'number') {
                            cantidadDescargas = data.data.cantidad_descargas;
                        }
                    }
                } catch (e) {
                    console.warn('No se pudo obtener la cantidad de descargas actual, se usará 0');
                }
                console.log('📊 Cantidad de descargas actual:', cantidadDescargas + 1);

                
                const encuestaBody = {
                    cantidad_descargas: cantidadDescargas + 1,
                    origen: origenEncuesta,
                    opinion: opinionEncuesta,
                    id_restaurantero: idRestaurantero
                };
                console.log('📊 Enviando encuesta con los siguientes datos:', encuestaBody);
                try {
                    const response = await fetch('http://52.23.26.163:7070/descargas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(encuestaBody)
                    });
                    if (response.ok) {
                        console.log('✅ Encuesta enviada correctamente');
                    } else {
                        const errorText = await response.text();
                        alert('Error al registrar la encuesta: ' + errorText);
                    }
                } catch (error) {
                    alert('Error al enviar la encuesta: ' + error.message);
                }
            } else {
                alert('No se pudo identificar el restaurante para registrar la encuesta.');
            }

            if (typeof closeEncuestaModal === "function") {
                closeEncuestaModal();
            } else if (typeof cerrarModalEncuesta === "function") {
                cerrarModalEncuesta();
            }
        } catch (error) {
            console.error('❌ Error al procesar la encuesta:', error);
            alert('Ocurrió un error al enviar la encuesta.');
        } finally {
            
            if (submitBtn) submitBtn.disabled = false;
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
window.prefetchCantidadDescargas = prefetchCantidadDescargas;