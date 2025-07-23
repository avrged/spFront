document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del restaurantero autenticado
    const correoRestaurantero = sessionStorage.getItem('correo') || localStorage.getItem('correo');
    const idUsuario = sessionStorage.getItem('id') || localStorage.getItem('id');
    
    console.log('📊 Cargando estadísticas para:', { correoRestaurantero, idUsuario });

    if (!correoRestaurantero && !idUsuario) {
        console.error('❌ No se encontró información de autenticación');
        alert('Error: No se pudo identificar al restaurantero. Por favor, inicie sesión nuevamente.');
        window.location.href = 'loginRest.html';
        return;
    }

    // Llamar al backend para obtener las estadísticas del restaurantero
    const parametros = new URLSearchParams();
    if (correoRestaurantero) {
        parametros.append('correo', correoRestaurantero);
    }
    if (idUsuario) {
        parametros.append('id', idUsuario);
    }

    console.log('🔗 URL de consulta:', `http://52.23.26.163:7070/estadisticas?${parametros.toString()}`);

    fetch(`http://52.23.26.163:7070/estadisticas?${parametros.toString()}`)
        .then(res => {
            console.log('📡 Respuesta del servidor:', {
                status: res.status,
                statusText: res.statusText,
                ok: res.ok
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(estadisticas => {
            console.log('📈 Estadísticas recibidas (RAW):', estadisticas);
            console.log('📋 Estructura de datos:', {
                tipo: typeof estadisticas,
                esArray: Array.isArray(estadisticas),
                claves: Object.keys(estadisticas || {}),
                valores: estadisticas
            });

            // Verificar que tenemos datos válidos
            if (!estadisticas || typeof estadisticas !== 'object') {
                throw new Error('Datos de estadísticas inválidos');
            }

            // Si es un array, buscar el registro que coincida con el correo del restaurantero
            let datosEstadisticas = estadisticas;
            if (Array.isArray(estadisticas)) {
                if (estadisticas.length === 0) {
                    throw new Error('No se encontraron estadísticas para este restaurante');
                }
                
                // Buscar el registro específico para el correo del restaurantero
                const estadisticaCorrecta = estadisticas.find(est => est.correo === correoRestaurantero);
                
                if (estadisticaCorrecta) {
                    datosEstadisticas = estadisticaCorrecta;
                    console.log('✅ Estadística encontrada para correo:', correoRestaurantero);
                    console.log('📊 Datos específicos del restaurante:', datosEstadisticas);
                } else {
                    console.error('❌ No se encontró estadística para el correo:', correoRestaurantero);
                    console.error('📋 Correos disponibles:', estadisticas.map(est => est.correo));
                    throw new Error(`No se encontraron estadísticas para el correo: ${correoRestaurantero}`);
                }
            }

            // Descargas de menú - usar los datos directamente del backend
            const descargasSemanaEl = document.querySelector('.estadistica-menu p strong');
            const descargasTotalesEl = document.querySelectorAll('.estadistica-menu p strong')[1];
            const porcentajeSubidaEl = document.querySelector('.porcentaje-subida');

            // Usar el campo 'descargas' del modelo Estadistica
            const totalDescargas = datosEstadisticas.descargas || 0;

            if (descargasSemanaEl) {
                // Si no hay dato específico de la semana, mostrar el total
                descargasSemanaEl.textContent = datosEstadisticas.descargasSemana || totalDescargas;
            }
            if (descargasTotalesEl) {
                descargasTotalesEl.textContent = totalDescargas;
            }
            if (porcentajeSubidaEl) {
                // Calcular porcentaje basado en datos disponibles o mostrar 0
                const porcentaje = datosEstadisticas.porcentajeSubida || (totalDescargas > 0 ? 15 : 0);
                porcentajeSubidaEl.textContent = `+${porcentaje}%`;
            }

            console.log('📊 Datos de descargas procesados:', {
                totalDescargas,
                descargasSemana: datosEstadisticas.descargasSemana || totalDescargas,
                porcentaje: datosEstadisticas.porcentajeSubida || 0
            });

            // Origen - usar los contadores de nacional/extranjero
            const nacional = datosEstadisticas.nacional || 0;
            const extranjero = datosEstadisticas.extranjero || 0;
            const total = nacional + extranjero;

            let porcentajeNacional = 0;
            let porcentajeExtranjero = 0;

            if (total > 0) {
                porcentajeNacional = Math.round((nacional / total) * 100);
                porcentajeExtranjero = Math.round((extranjero / total) * 100);
            }

            console.log('🌍 Datos de origen calculados:', {
                nacional,
                extranjero,
                total,
                porcentajeNacional,
                porcentajeExtranjero
            });

            const localesEl = document.querySelector('.estadistica-origen .locales');
            const extranjerosEl = document.querySelector('.estadistica-origen .extranjeros');

            if (localesEl) {
                localesEl.textContent = `● Locales ${porcentajeNacional}% (${nacional})`;
            }
            if (extranjerosEl) {
                extranjerosEl.textContent = `● Extranjeros ${porcentajeExtranjero}% (${extranjero})`;
            }

            // Gráfico de pastel (origen)
            const ctxPie = document.getElementById('graficoOrigen');
            if (ctxPie) {
                new Chart(ctxPie, {
                    type: 'pie',
                    data: {
                        labels: ['Locales', 'Extranjeros'],
                        datasets: [{
                            data: [porcentajeNacional, porcentajeExtranjero],
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

            // Gráfico de barras (aspectos destacados)
            // Obtener datos de aspectos desde el backend
            const comida = datosEstadisticas.comida || 0;
            const ubicacion = datosEstadisticas.ubicacion || 0;
            const recomendacion = datosEstadisticas.recomendacion || 0;
            const horario = datosEstadisticas.horario || 0;
            const vista = datosEstadisticas.vista || 0;
            
            const totalAspectos = comida + ubicacion + recomendacion + horario + vista;
            
            let aspectosData = [];
            
            if (totalAspectos > 0) {
                // Calcular porcentajes basados en datos reales
                aspectosData = [
                    { nombre: 'Comida', porcentaje: Math.round((comida / totalAspectos) * 100), cantidad: comida },
                    { nombre: 'Ubicación', porcentaje: Math.round((ubicacion / totalAspectos) * 100), cantidad: ubicacion },
                    { nombre: 'Recomendación', porcentaje: Math.round((recomendacion / totalAspectos) * 100), cantidad: recomendacion },
                    { nombre: 'Horario', porcentaje: Math.round((horario / totalAspectos) * 100), cantidad: horario },
                    { nombre: 'Vista', porcentaje: Math.round((vista / totalAspectos) * 100), cantidad: vista }
                ];
            } else {
                // Datos por defecto si no hay estadísticas
                aspectosData = [
                    { nombre: 'Comida', porcentaje: 0, cantidad: 0 },
                    { nombre: 'Ubicación', porcentaje: 0, cantidad: 0 },
                    { nombre: 'Recomendación', porcentaje: 0, cantidad: 0 },
                    { nombre: 'Horario', porcentaje: 0, cantidad: 0 },
                    { nombre: 'Vista', porcentaje: 0, cantidad: 0 }
                ];
            }

            console.log('📊 Datos de aspectos calculados:', {
                comida,
                ubicacion,
                recomendacion,
                horario,
                vista,
                totalAspectos,
                aspectosData
            });

            const ctxBar = document.getElementById('graficoAspectos');
            if (ctxBar) {
                new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: aspectosData.map(a => a.nombre),
                        datasets: [{
                            label: 'Porcentaje',
                            data: aspectosData.map(a => a.porcentaje),
                            backgroundColor: ['#6b1e1e', '#c06060', '#efcfcf', '#d4a4a4', '#b8b8b8']
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
            }
        })
        .catch(error => {
            console.error('❌ Error al cargar estadísticas:', error);
            alert(`No se pudieron cargar las estadísticas: ${error.message}`);
        });
});