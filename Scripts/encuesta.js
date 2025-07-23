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

        // Obtener información del restaurante actual
        const restaurante = window.restauranteActual;
        const params = new URLSearchParams(window.location.search);
        const restauranteId = params.get('id');
        const correo = params.get('correo');

        console.log('📋 Enviando encuesta para restaurante:', {
            id: restauranteId,
            correo: correo,
            restaurante: restaurante?.restaurante,
            menu: restaurante?.menu
        });

        // Prepara los datos a enviar
        const data = {
            atraccion: atraccion.value,
            origen: origen.value,
            restauranteId: restauranteId || restaurante?.id,
            correoRestaurante: correo || restaurante?.correo,
            nombreRestaurante: restaurante?.restaurante
        };

        try {
            // Primero, enviar la encuesta (esto se puede enviar a tu endpoint de encuestas)
            console.log('📤 Enviando datos de encuesta:', data);
            
            // Aquí puedes enviar la encuesta a tu backend si tienes un endpoint para eso
            // const encuestaResponse = await fetch('http://52.23.26.163:7070/encuestas', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });

            // Después de enviar la encuesta, descargar el menú
            if (restaurante && restaurante.menu) {
                console.log('📄 Descargando menú desde:', restaurante.menu);
                
                // Si el menú es una URL completa, usarla directamente
                let menuUrl = restaurante.menu;
                
                // Si no es una URL completa, construir la URL del backend
                if (!menuUrl.startsWith('http')) {
                    menuUrl = `http://52.23.26.163:7070${menuUrl}`;
                }
                
                // Descargar el archivo
                try {
                    const menuResponse = await fetch(menuUrl);
                    if (menuResponse.ok) {
                        const blob = await menuResponse.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `menu_${restaurante.restaurante || 'restaurante'}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Limpiar la URL del objeto
                        window.URL.revokeObjectURL(downloadUrl);
                        
                        console.log('✅ Menú descargado exitosamente');
                    } else {
                        console.error('❌ Error al descargar el menú:', menuResponse.status);
                        alert('No se pudo descargar el menú. Por favor, contacta al restaurante.');
                    }
                } catch (downloadError) {
                    console.error('❌ Error en la descarga:', downloadError);
                    alert('Error al descargar el menú.');
                }
            } else {
                console.warn('⚠️ No hay menú disponible para este restaurante');
                alert('Este restaurante no tiene menú disponible para descarga.');
            }

            // Cerrar el modal de la encuesta
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