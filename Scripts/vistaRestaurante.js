document.addEventListener('DOMContentLoaded', async function() {
    // Obtén el ID del restaurante de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        // Reemplaza esta línea por tu llamada real a la API o almacenamiento
        const response = await fetch(`../data/restaurantes.json`);
        const restaurantes = await response.json();
        const rest = restaurantes.find(r => r.id == id);
        if (!rest) return;

        // Llena los datos en la vista
        document.querySelector('.restaurante-nombre').textContent = rest.nombre;
        document.querySelector('.galeria-principal').src = rest.imagenPrincipal;
        const galeriaSecundaria = document.querySelector('.galeria-secundaria');
        galeriaSecundaria.innerHTML = rest.imagenesSecundarias.map(img =>
            `<img src="${img}" alt="Imagen restaurante">`
        ).join('');

        // Características/Etiquetas
        const caracteristicas = document.querySelector('.caracteristicas-lista');
        caracteristicas.innerHTML = rest.etiquetas.map(et =>
            `<div class="caracteristica-item">
                <img src="../images/etiqueta.png" alt="Etiqueta" class="icon-etiqueta">
                <span class="caracteristica">${et}</span>
            </div>`
        ).join('');

        // Horarios
        document.querySelector('.restaurante-horarios').innerHTML = `
            <h2>Horarios</h2>
            <b>Lunes a viernes</b> ${rest.horarioLV}<br>
            <b>Sábado y domingo</b> ${rest.horarioSD}
        `;

        // Contactos
        document.querySelector('.restaurante-contactos').innerHTML = `
            <h2>Contactos</h2>
            <div><img src="../images/llamada.png" alt="Tel" class="icon-16"> ${rest.telefono}</div>
            <div><img src="../images/facebook.png" alt="FB" class="icon-16"> ${rest.facebook}</div>
            <div><img src="../images/instagram.png" alt="IG" class="icon-16"> ${rest.instagram}</div>
        `;

        // Ubicación
        document.querySelector('.restaurante-ubicacion').innerHTML = `
            <h2>Ubicación</h2>
            ${rest.ubicacion}
        `;
    } catch (e) {
        // Manejo de error
    }
});