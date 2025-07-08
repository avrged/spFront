document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('encuestaForm');
    const atraccion = document.getElementById('atraccion');
    const origen = document.getElementById('origen');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        handleSuccessfulSubmit();
        if (typeof cerrarModalEncuesta === "function") {
            cerrarModalEncuesta();
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
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }

    function removeError(element) {
        element.classList.remove('error');
        const errorMessage = element.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function handleSuccessfulSubmit() {

    }

    function getOptionText(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        return selectedOption.text;
    }
});