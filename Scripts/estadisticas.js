document.addEventListener('DOMContentLoaded', function() {
    const idRestaurantero = sessionStorage.getItem('id_restaurantero') || localStorage.getItem('id_restaurantero');
    if (!idRestaurantero) {
        alert('Error: No se pudo identificar el restaurantero. Por favor, inicie sesión nuevamente.');
        window.location.href = 'loginRest.html';
        return;
    }

    fetch(`http://52.23.26.163:7070/descargas/restaurantero/${idRestaurantero}`)
        .then(res => res.json())
        .then(data => {
            let maxDescargas = 0;
            let nacional = 0;
            let extranjero = 0;
            
            const opinionCount = {};
            if (data && Array.isArray(data.data) && data.data.length > 0) {
                maxDescargas = Math.max(...data.data.map(d => d.cantidad_descargas || 0));
                
                data.data.forEach(d => {
                    if ((d.origen || '').toLowerCase() === 'nacional') nacional++;
                    if ((d.origen || '').toLowerCase() === 'extranjero') extranjero++;
                    
                    if (d.opinion) {
                        const op = d.opinion.trim();
                        opinionCount[op] = (opinionCount[op] || 0) + 1;
                    }
                });
            } else if (data && typeof data.data?.cantidad_descargas === 'number') {
                maxDescargas = data.data.cantidad_descargas;
                if ((data.data.origen || '').toLowerCase() === 'nacional') nacional = 1;
                if ((data.data.origen || '').toLowerCase() === 'extranjero') extranjero = 1;
                if (data.data.opinion) {
                    const op = data.data.opinion.trim();
                    opinionCount[op] = (opinionCount[op] || 0) + 1;
                }
            }
            
            const descargasMenuEl = document.querySelector('.estadistica-menu p strong');
            if (descargasMenuEl) {
                descargasMenuEl.textContent = maxDescargas;
            }
            
            const localesEl = document.querySelector('.estadistica-origen .locales');
            const extranjerosEl = document.querySelector('.estadistica-origen .extranjeros');
            if (localesEl) {
                localesEl.textContent = `● Locales (${nacional})`;
            }
            if (extranjerosEl) {
                extranjerosEl.textContent = `● Extranjeros (${extranjero})`;
            }
            
            const sorted = Object.entries(opinionCount)
                .sort((a, b) => b[1] - a[1]);
            const aspectosCanvas = document.getElementById('graficoAspectos');
            if (aspectosCanvas) {
                if (sorted.length > 0) {
                    new Chart(aspectosCanvas, {
                        type: 'bar',
                        data: {
                            labels: sorted.map(([op]) => op),
                            datasets: [{
                                label: 'Veces mencionado',
                                data: sorted.map(([, count]) => count),
                                backgroundColor: ['#6b1e1e', '#a97c7c', '#e07878'],
                                borderRadius: 6
                            }]
                        },
                        options: {
                            indexAxis: 'y',
                            plugins: {
                                legend: { display: false },
                                title: { display: false }
                            },
                            scales: {
                                x: { beginAtZero: true, ticks: { precision:0 } },
                                y: { ticks: { color: '#6b1e1e', font: { weight: 'bold' } } }
                            }
                        }
                    });
                } else {
                    aspectosCanvas.parentElement.innerHTML = '<div style="text-align:center;color:#a97c7c;">Sin datos de opiniones.</div>';
                }
            }
            
            const ctxPie = document.getElementById('graficoOrigen');
            if (ctxPie) {
                new Chart(ctxPie, {
                    type: 'pie',
                    data: {
                        labels: ['Locales', 'Extranjeros'],
                        datasets: [{
                            data: [nacional, extranjero],
                            backgroundColor: ['#6b1e1e', '#e07878']
                        }]
                    },
                    options: {
                        plugins: {
                            legend: { display: true, position: 'bottom' }
                        }
                    }
                });
            }
            console.log('Cantidad máxima de descargas:', maxDescargas);
            console.log('Locales:', nacional, 'Extranjeros:', extranjero);
        })
        .catch(err => {
            console.error('Error al obtener descargas:', err);
            alert('No se pudieron cargar las descargas.');
        });
});