document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    try {
        const restaurantes = await SazonAPI.getAllRestauranteros();

        container.innerHTML = '';

        restaurantes.forEach(rest => {
            const card = document.createElement('div');
            card.className = 'restaurante-card';
            card.onclick = () => window.location.href = `vistaRestaurante.html?id=${rest.id}`;

            card.innerHTML = `
                <img class="restaurante-img" src="${rest.imagenPrincipal || '../images/img_rest2.jpg'}" alt="Restaurante ${rest.nombre}">
                <div class="restaurante-info">
                    <h3 class="restaurante-nombre">${rest.nombre}</h3>
                    <div class="restaurante-tipos">
                        <span>${rest.tipoComida || ''}</span><br>
                    </div>
                    <div class="restaurante-horario">
                        <span>${rest.horario || ''}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>Error al cargar restaurantes.</p>';
    }
});