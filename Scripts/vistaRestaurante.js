document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        // Llama al backend para obtener los datos del restaurante
        const response = await fetch(`/api/restaurantes/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('No se pudo cargar la información');
        const restaurante = await response.json();

        // Llena los datos en la vista
        document.querySelector('.restaurante-nombre').textContent = restaurante.nombre;
        document.querySelector('.galeria-principal').src = restaurante.imagenPrincipal;
        const galeriaSecundaria = document.querySelector('.galeria-secundaria');
        galeriaSecundaria.innerHTML = (restaurante.imagenesSecundarias || []).map(img =>
            `<img src='${img}' alt='Imagen restaurante' />`
        ).join('');

        // Características/Etiquetas
        const caracteristicas = document.querySelector('.caracteristicas-lista');
        caracteristicas.innerHTML = (restaurante.etiquetas || []).map(et =>
            `<div class='caracteristica-item'>
                <img src='../images/etiqueta.png' alt='Etiqueta' class='icon-etiqueta' />
                <span class='caracteristica'>${et}</span>
            </div>`
        ).join('');

        // Horarios
        document.querySelector('.restaurante-horarios').innerHTML = `
            <h2>Horarios</h2>
            <b>Lunes a viernes</b> ${restaurante.horarioLV || ''}<br />
            <b>Sábado y domingo</b> ${restaurante.horarioSD || ''}
        `;

        // Contactos
        document.querySelector('.restaurante-contactos').innerHTML = `
            <h2>Contactos</h2>
            <div><img src='../images/llamada.png' alt='Tel' class='icon-16' /> ${restaurante.telefono || ''}</div>
            <div><img src='../images/facebook.png' alt='FB' class='icon-16' /> ${restaurante.facebook || ''}</div>
            <div><img src='../images/instagram.png' alt='IG' class='icon-16' /> ${restaurante.instagram || ''}</div>
        `;

        // Ubicación
        document.querySelector('.restaurante-ubicacion').innerHTML = `
            <h2>Ubicación</h2>
            ${restaurante.ubicacion || ''}
        `;
    } catch (error) {
        alert('No se pudo cargar la información del restaurante.');
    }
});