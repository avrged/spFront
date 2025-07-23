// Script para mostrar los datos del restaurante aprobado al restaurantero logueado

document.addEventListener('DOMContentLoaded', async function () {
    // Obtener el correo del usuario logueado desde sessionStorage
    const correoUsuario = sessionStorage.getItem('correo');
    if (!correoUsuario) return;

    try {
        // Obtener todas las solicitudes
        const response = await fetch('http://localhost:7070/solicitudes');
        if (!response.ok) throw new Error('No se pudo obtener las solicitudes');
        const solicitudes = await response.json();

        // Buscar la solicitud aprobada que coincida con el correo
        const solicitudAprobada = solicitudes.find(s => s.estado && s.estado.toLowerCase() === 'aprobado' && s.correo && s.correo.toLowerCase() === correoUsuario.toLowerCase());

        if (solicitudAprobada) {
            // Mostrar el nombre del restaurante
            const nombreRestEl = document.getElementById('nombre-restaurante');
            if (nombreRestEl) {
                nombreRestEl.textContent = solicitudAprobada.restaurante || '';
            }

            // Mostrar imágenes (asumiendo que hay elementos con ids imagen1, imagen2, imagen3)
            const img1 = document.getElementById('imagen1');
            const img2 = document.getElementById('imagen2');
            const img3 = document.getElementById('imagen3');
            if (img1 && solicitudAprobada.imagen1) img1.src = solicitudAprobada.imagen1;
            if (img2 && solicitudAprobada.imagen2) img2.src = solicitudAprobada.imagen2;
            if (img3 && solicitudAprobada.imagen3) img3.src = solicitudAprobada.imagen3;

            // Mostrar redes sociales
            const facebookEl = document.getElementById('facebook-restaurante');
            const instagramEl = document.getElementById('instagram-restaurante');
            if (facebookEl) facebookEl.textContent = solicitudAprobada.facebook || '';
            if (instagramEl) instagramEl.textContent = solicitudAprobada.instagram || '';

            // Mostrar horario
            const horarioEl = document.getElementById('horario-restaurante');
            if (horarioEl) horarioEl.textContent = solicitudAprobada.horario || '';

            // Mostrar dirección
            const direccionEl = document.getElementById('direccion-restaurante');
            if (direccionEl) direccionEl.textContent = solicitudAprobada.direccion || '';

            // Mostrar menú (asumiendo que hay un enlace o botón con id menu-restaurante)
            const menuEl = document.getElementById('menu-restaurante');
            if (menuEl && solicitudAprobada.menu) menuEl.href = solicitudAprobada.menu;
        }
    } catch (error) {
        console.error('Error al cargar los datos del restaurante:', error);
    }
});
