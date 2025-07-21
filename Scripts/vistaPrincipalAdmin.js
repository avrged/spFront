document.addEventListener('DOMContentLoaded', function () {
    const botones = document.querySelectorAll('.sidebar-item');
    const vistas = {
        restaurantes: document.getElementById('vista-restaurantes'),
        solicitudes: document.getElementById('vista-solicitudes'),
        membresias: document.getElementById('vista-membresias')
    };

    botones.forEach(boton => {
        boton.addEventListener('click', function () {
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            Object.values(vistas).forEach(vista => vista.style.display = 'none');
            const vistaSeleccionada = this.getAttribute('data-vista');
            if (vistas[vistaSeleccionada]) {
                vistas[vistaSeleccionada].style.display = 'block';
                // Cargar datos reales según la vista seleccionada
                if (vistaSeleccionada === 'solicitudes') {
                    cargarSolicitudes();
                } else if (vistaSeleccionada === 'restaurantes') {
                    cargarRestaurantes();
                }
            }
        });
    });


    if (botones && botones.length > 0) {
        botones[0].click();
    }

    function cargarMembresias() {
        // Simulación, reemplaza con tu API real

        const tbody = document.querySelector('#vista-membresias tbody');
        tbody.innerHTML = '';
        membresias.forEach(m => {
            const tr = document.createElement('tr');
            let acciones = '';
            if (m.estado.toLowerCase() !== 'activa') {
                acciones += `<button class="btn-aceptar" title="Aceptar"><img src="../images/aceptar.png" alt="Aceptar"></button>`;
            }
            acciones += `<button class="btn-rechazar" title="Rechazar"><img src="../images/rechazar.png" alt="Rechazar"></button>`;
            tr.innerHTML = `
                <td>${m.restaurante}</td>
                <td>${m.propietario}</td>
                <td>${m.correo}</td>
                <td>${m.fecha}</td>
                <td>${m.estado.charAt(0).toUpperCase() + m.estado.slice(1)}</td>
                <td>${acciones}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const btnSidebarMembresias = document.querySelector('[data-vista="membresias"]');
    if (btnSidebarMembresias) {
        btnSidebarMembresias.addEventListener('click', cargarMembresias);
    }

    function agregarEventosTabla(selectorTabla, tipo, editable = false) {
        const tabla = document.querySelector(selectorTabla);
        if (!tabla) return;
        tabla.addEventListener('click', function (e) {
            if (e.target.closest('.btn-editar')) {
                const fila = e.target.closest('tr');
                if (!fila) return;
                const celda = fila.querySelector('td');
                if (!celda) return;
                if (editable) {
                    if (celda.querySelector('input')) return;
                    const valorActual = celda.textContent;
                    celda.innerHTML = '';
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = valorActual;
                    input.style.width = '80%';
                    celda.appendChild(input);
                    input.focus();
                    input.addEventListener('blur', function () {
                        celda.textContent = input.value || valorActual;
                    });
                    input.addEventListener('keydown', function (ev) {
                        if (ev.key === 'Enter') {
                            input.blur();
                        }
                    });
                } else {
                    const nombre = celda.textContent;
                    alert('Editar ' + tipo + ': ' + nombre);
                }
            }
            if (e.target.closest('.btn-eliminar')) {
                const fila = e.target.closest('tr');
                const nombre = fila ? fila.children[0].textContent : '';
                if (confirm('¿Seguro que deseas eliminar este ' + tipo + ': ' + nombre + '?')) {
                    fila.remove();
                }
            }
        });
    }

    const tablaRestaurantesAdmin = document.querySelector('#vista-restaurantes .tabla-admin');
    if (tablaRestaurantesAdmin) {
        tablaRestaurantesAdmin.addEventListener('click', async function (e) {
            if (e.target.closest('.btn-eliminar')) {
                const fila = e.target.closest('tr');
                const nombre = fila ? fila.children[0].textContent : '';
                const idRestaurante = fila ? fila.getAttribute('data-id-restaurante') : '';
                
                if (!confirm(`¿Seguro que deseas eliminar este restaurante: ${nombre}?`)) return;
                
                try {
                    // Aquí puedes agregar la llamada al backend para eliminar el restaurante
                    // const response = await fetch(`http://localhost:7070/restaurantes/${idRestaurante}`, {
                    //     method: 'DELETE'
                    // });
                    // if (response.ok) {
                        fila.remove();
                        alert(`Restaurante "${nombre}" eliminado correctamente`);
                    // } else {
                    //     alert('Error al eliminar el restaurante');
                    // }
                } catch (err) {
                    alert('Error de conexión al eliminar el restaurante');
                }
            }
        });
    }
    agregarEventosTabla('#vista-solicitudes .tabla-admin', 'solicitud de usuario');

    

    const tablaSolicitudes = document.querySelector('#vista-solicitudes .tabla-admin tbody');
    const tablaRestaurantesBody = document.querySelector('#vista-restaurantes .tabla-admin tbody');
    if (tablaSolicitudes && tablaRestaurantesBody) {
        tablaSolicitudes.addEventListener('click', async function (e) {
            // Ver imágenes
            const btnImg = e.target.closest('.btn-ver-imagenes');
            if (btnImg) {
                const imagenes = JSON.parse(btnImg.getAttribute('data-imagenes'));
                verImagenes(imagenes);
                return;
            }
            // Ver comprobante
            const btnComp = e.target.closest('.btn-ver-comprobante');
            if (btnComp) {
                const comprobante = btnComp.getAttribute('data-comprobante');
                verComprobante(comprobante);
                return;
            }
            // Aceptar solicitud
            if (e.target.closest('.btn-aceptar')) {
                const fila = e.target.closest('tr');
                if (!fila) return;
                
                const id = fila.getAttribute('data-id-solicitud');
                if (!id) {
                    alert('No se pudo obtener el ID de la solicitud.');
                    return;
                }
                
                if (!confirm('¿Seguro que deseas aceptar esta solicitud? El restaurante será agregado al sistema.')) return;
                
                try {
                    // Obtener los datos de la solicitud desde la fila de la tabla
                    const tds = fila.querySelectorAll('td');
                    const datosRestaurante = {
                        nombre: tds[0]?.textContent || '',
                        propietario: tds[1]?.textContent || '',
                        correo: tds[2]?.textContent || '',
                        numero: tds[3]?.textContent || '',
                        direccion: tds[4]?.textContent || '',
                        horario: tds[5]?.textContent || ''
                    };
                    
                    // Aprobar la solicitud en el backend
                    const response = await fetch(`http://localhost:7070/solicitudes/${id}/aprobar`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ estado: 'aprobado' })
                    });
                    
                    if (response.ok) {
                        // Eliminar la solicitud de la tabla
                        fila.remove();
                        
                        // Recargar la lista de restaurantes si esa vista está activa
                        const vistaRestaurantesActiva = document.getElementById('vista-restaurantes').style.display !== 'none';
                        if (vistaRestaurantesActiva) {
                            await cargarRestaurantes();
                        }
                        
                        alert(`✅ Solicitud aprobada exitosamente!\n\nRestaurante "${datosRestaurante.nombre}" ha sido agregado al sistema.`);
                    } else {
                        const errorText = await response.text();
                        const errorObj = JSON.parse(errorText);
                        
                        // Manejar errores específicos del backend
                        if (errorObj.message && errorObj.message.includes("doesn't have a default value")) {
                            alert(`❌ Error en el backend: Falta configurar valores por defecto en la base de datos.\n\nDetalles técnicos: ${errorObj.message}\n\n💡 Solución: El desarrollador del backend necesita asegurar que todos los campos requeridos se estén copiando correctamente de la solicitud al crear el restaurante.`);
                        } else {
                            alert(`❌ Error al aprobar la solicitud:\n\n${errorObj.message || errorText}`);
                        }
                    }
                } catch (err) {
                    console.error('Error de conexión:', err);
                    alert('❌ Error de conexión al procesar la solicitud. Verifica que el servidor esté funcionando.');
                }
            }
            // Rechazar solicitud
            if (e.target.closest('.btn-rechazar')) {
                const fila = e.target.closest('tr');
                if (!fila) return;
                const id = fila.getAttribute('data-id-solicitud');
                if (!id) {
                    alert('No se pudo obtener el ID de la solicitud.');
                    return;
                }
                if (!confirm('¿Seguro que deseas rechazar esta solicitud?')) return;
                try {
                    const response = await fetch(`http://localhost:7070/solicitudes/${id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        fila.remove();
                        alert('Solicitud rechazada y eliminada correctamente');
                    } else {
                        const errorText = await response.text();
                        alert('Error al rechazar: ' + errorText);
                    }
                } catch (err) {
                    alert('Error de conexión al rechazar');
                }
            }
        });
    }

    async function cargarSolicitudes() {
        try {
            const response = await fetch('http://localhost:7070/solicitudes');
            if (!response.ok) throw new Error('No se pudo obtener las solicitudes');
            const solicitudes = await response.json();

            const tbody = document.querySelector('#vista-solicitudes tbody');
            tbody.innerHTML = '';

            // Filtrar solo las solicitudes con estado 'pendiente'
            const solicitudesPendientes = solicitudes.filter(solicitud => 
                solicitud.estado && solicitud.estado.toLowerCase() === 'pendiente'
            );

            solicitudesPendientes.forEach(solicitud => {
                const imagenes = [solicitud.imagen1, solicitud.imagen2, solicitud.imagen3].filter(Boolean);
                const tr = document.createElement('tr');
                tr.setAttribute('data-id-solicitud', solicitud.id_solicitud || solicitud.id || '');
                tr.innerHTML = `
                    <td>${solicitud.restaurante || ''}</td>
                    <td>${solicitud.propietario || ''}</td>
                    <td>${solicitud.correo || ''}</td>
                    <td>${solicitud.numero || ''}</td>
                    <td>${solicitud.direccion || ''}</td>
                    <td>${solicitud.horario || ''}</td>
                    <td>
                        ${imagenes.length > 0 ? `<button class="btn-ver-imagenes" title="Ver imágenes" data-imagenes='${JSON.stringify(imagenes)}'>
                            <img src="../images/imagen.png" alt="Ver">
                        </button>` : 'Sin imágenes'}
                    </td>
                    <td>
                        ${solicitud.comprobante ? `<button class="btn-ver-comprobante" title="Ver comprobante" data-comprobante='${solicitud.comprobante}'>
                            <img src="../images/comprobante.png" alt="Ver">
                        </button>` : 'Sin comprobante'}
                    </td>
                    <td>
                        <button class="btn-aceptar" title="Aceptar"><img src="../images/aceptar.png" alt="Aceptar"></button>
                        <button class="btn-rechazar" title="Rechazar"><img src="../images/rechazar.png" alt="Rechazar"></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Mostrar mensaje si no hay solicitudes pendientes
            if (solicitudesPendientes.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
                        📋 No hay solicitudes pendientes
                    </td>
                `;
                tbody.appendChild(tr);
            }
        } catch (error) {
            alert("Error al cargar solicitudes.");
        }
    }

    async function cargarRestaurantes() {
        try {
            const response = await fetch('http://localhost:7070/restaurantes');
            if (!response.ok) throw new Error('No se pudo obtener los restaurantes');
            const restaurantes = await response.json();

            const tbody = document.querySelector('#vista-restaurantes tbody');
            tbody.innerHTML = '';

            restaurantes.forEach(restaurante => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id-restaurante', restaurante.idRestaurante || '');
                tr.innerHTML = `
                    <td>${restaurante.nombre || ''}</td>
                    <td>${restaurante.direccion || ''}</td>
                    <td>
                        <button class="btn-eliminar" title="Eliminar"><img src="../images/eliminar.png" alt="Eliminar"></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            alert("Error al cargar restaurantes.");
        }
    }

    // Modal para mostrar imágenes y comprobantes
    function crearModal(contenidoHtml) {
        let modal = document.getElementById('modal-visualizador');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-visualizador';
            modal.className = 'modal-visualizador';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `<div id="modal-contenido-visualizador" class="modal-contenido-visualizador">
            <button id="cerrar-modal-visualizador" class="cerrar-modal-visualizador">&times;</button>
            ${contenidoHtml}
        </div>`;
        modal.style.display = 'flex';
        document.getElementById('cerrar-modal-visualizador').onclick = function() {
            modal.style.display = 'none';
        };
        // Cerrar modal al hacer clic fuera del contenido
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Visualizar imágenes
    window.verImagenes = function(imagenes) {
        if (!Array.isArray(imagenes)) imagenes = [imagenes];
        let html = '<h3>Imágenes</h3><div style="display:flex;gap:10px;flex-wrap:wrap;">';
        imagenes.forEach(url => {
            html += `<img src="${url}" alt="Imagen" style="max-width:300px;max-height:300px;border:1px solid #ccc;">`;
        });
        html += '</div>';
        crearModal(html);
    }

    // Visualizar comprobante
    window.verComprobante = function(url) {
        let html = '<h3>Comprobante</h3>';
        // Si la url no es absoluta, prepender la ruta del backend
        if (url && !/^https?:\/\//.test(url) && url.endsWith('.pdf')) {
            // Si ya incluye /uploads/documents/ no lo dupliques
            if (!url.includes('/uploads/documents/')) {
                url = '/uploads/documents/' + url;
            }
            url = 'http://localhost:7070' + url;
        }
        if (url && url.endsWith('.pdf')) {
            html += `<iframe src="${url}" style="width:600px;height:600px;border:none;"></iframe>`;
        } else if (url) {
            html += `<a href="${url}" target="_blank">Abrir comprobante</a>`;
        } else {
            html += '<p>No hay comprobante disponible.</p>';
        }
        crearModal(html);
    }

});