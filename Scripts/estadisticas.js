document.addEventListener('DOMContentLoaded', function() {
    // Obtén el id del restaurante desde la URL
    const params = new URLSearchParams(window.location.search);
    const restauranteId = params.get('id');

    // Llama al backend para obtener las estadísticas
    fetch(`/api/estadisticas?id=${encodeURIComponent(restauranteId)}`)
        .then(res => res.json())
        .then(estadisticas => {
            // Descargas de menú
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
        })
        .catch(() => {
            alert('No se pudieron cargar las estadísticas.');
        });
});