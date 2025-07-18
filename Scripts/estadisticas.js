document.addEventListener('DOMContentLoaded', function() {
    // Simulación de datos obtenidos de la base de datos
    const estadisticas = {
        descargasSemana: 12,
        descargasTotales: 120,
        porcentajeSubida: 8,
        origen: { locales: 70, extranjeros: 30 },
        aspectos: [
            { nombre: 'Ambiente', porcentaje: 45 },
            { nombre: 'Comida', porcentaje: 35 },
            { nombre: 'Higiene', porcentaje: 20 }
        ]
    };

    document.querySelector('.estadistica-menu p strong').textContent = estadisticas.descargasSemana;
    document.querySelectorAll('.estadistica-menu p strong')[1].textContent = estadisticas.descargasTotales;
    document.querySelector('.porcentaje-subida').textContent = `+${estadisticas.porcentajeSubida}%`;

    // Origen
    document.querySelector('.estadistica-origen .locales').textContent = `● Locales ${estadisticas.origen.locales}%`;
    document.querySelector('.estadistica-origen .extranjeros').textContent = `● Extranjeros ${estadisticas.origen.extranjeros}%`;

    // Gráfico de pastel (origen)
    const ctxPie = document.getElementById('graficoOrigen').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Locales', 'Extranjeros'],
            datasets: [{
                data: [estadisticas.origen.locales, estadisticas.origen.extranjeros],
                backgroundColor: ['#6b1e1e', '#e07878']
            }]
        },
        options: {
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });

    // Gráfico de barras (aspectos destacados)
    const ctxBar = document.getElementById('graficoAspectos').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: estadisticas.aspectos.map(a => a.nombre),
            datasets: [{
                label: 'Porcentaje',
                data: estadisticas.aspectos.map(a => a.porcentaje),
                backgroundColor: ['#6b1e1e', '#c06060', '#efcfcf']
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
});