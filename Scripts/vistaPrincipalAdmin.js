document.addEventListener('DOMContentLoaded', function () {
    const botones = document.querySelectorAll('.sidebar-item');
    const vistas = {
        restaurantes: document.getElementById('vista-restaurantes'),
        etiquetas: document.getElementById('vista-etiquetas'),
        solicitudes: document.getElementById('vista-solicitudes')
    };

    botones.forEach(boton => {
        boton.addEventListener('click', function () {
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            Object.values(vistas).forEach(vista => vista.style.display = 'none');
            const vistaSeleccionada = this.getAttribute('data-vista');
            if (vistas[vistaSeleccionada]) {
                vistas[vistaSeleccionada].style.display = 'block';
            }
        });
    });

    if (botones.length > 0) {
        botones[0].click();
    }
});