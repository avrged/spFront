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

        // Obtén el id del restaurante desde la URL
        const params = new URLSearchParams(window.location.search);
        const restauranteId = params.get('id');

        // Prepara los datos a enviar
        const data = {
            atraccion: atraccion.value,
            origen: origen.value,
            restauranteId: restauranteId
        };

        try {
            // Envía la encuesta al backend
            const response = await fetch('/api/encuesta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (result.pdfUrl) {
                // Descarga el PDF como archivo
                const link = document.createElement('a');
                link.href = result.pdfUrl;
                link.download = `menu_${restauranteId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            if (typeof cerrarModalEncuesta === "function") {
                cerrarModalEncuesta();
            }
        } catch (error) {
            alert('Ocurrió un error al enviar la encuesta o descargar el menú.');
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