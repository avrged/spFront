document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.line-parent');
    if (!container) return;

    try {
        console.log('Intentando cargar solicitudes...');
        
        // Hacer petición directa sin usar SazonAPI
        const response = await fetch('http://localhost:7070/solicitudes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const solicitudes = await response.json();
        console.log('Solicitudes recibidas:', solicitudes);

        container.innerHTML = '';

        // Filtrar solo las solicitudes aprobadas
        const solicitudesAprobadas = solicitudes.filter(solicitud => 
            solicitud.estado === 'aprobado' || 
            solicitud.estado === 'Aprobado' ||
            solicitud.estado === 'APROBADO'
        );

        console.log('Solicitudes aprobadas:', solicitudesAprobadas);

        if (solicitudesAprobadas.length === 0) {
            container.innerHTML = '<p>No hay restaurantes aprobados disponibles.</p>';
            return;
        }

        solicitudesAprobadas.forEach(solicitud => {
            const card = document.createElement('div');
            card.className = 'restaurante-card';
            card.onclick = () => window.location.href = `vistaRestaurante.html?id=${solicitud.id}`;

            card.innerHTML = `
                <img class="restaurante-img" src="${solicitud.imagen1 || '../images/img_rest2.jpg'}" alt="Restaurante ${solicitud.restaurante}">
                <div class="restaurante-info">
                    <h3 class="restaurante-nombre">${solicitud.restaurante}</h3>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        container.innerHTML = '<p>Error al cargar restaurantes. Revisa la consola para más detalles.</p>';
    }
});