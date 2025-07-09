document.addEventListener('DOMContentLoaded', function () {
    const botones = document.querySelectorAll('.sidebar-item');
    const vistas = {
        restaurantes: document.getElementById('vista-restaurantes'),
        etiquetas: document.getElementById('vista-etiquetas'),
        solicitudes: document.getElementById('vista-solicitudes')
    };

    botones.forEach(boton => {
        boton.addEventListener('click', function () {
            // Quitar clase activa de todos los botones
            botones.forEach(b => b.classList.remove('active'));
            // Agregar clase activa al botón clickeado
            this.classList.add('active');

            // Ocultar todas las vistas
            Object.values(vistas).forEach(vista => vista.style.display = 'none');
            // Mostrar la vista seleccionada
            const vistaSeleccionada = this.getAttribute('data-vista');
            if (vistas[vistaSeleccionada]) {
                vistas[vistaSeleccionada].style.display = 'block';
            }
        });
    });

    // Activar la primera vista por defecto
    if (botones.length > 0) {
        botones[0].click();
    }
});