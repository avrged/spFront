document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('label.imagen-slot input[type="file"][accept*="image"]').forEach(function(input) {
        input.addEventListener('change', function(event) {
            const fileList = event.target.files;
            const label = input.closest('label.imagen-slot');
            const placeholderImg = label ? label.querySelector('img') : null;
            if (fileList.length > 0 && placeholderImg) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    placeholderImg.src = e.target.result;
                    placeholderImg.style.objectFit = 'cover';
                    placeholderImg.style.width = '100%';
                    placeholderImg.style.height = '100%';
                };
                reader.readAsDataURL(fileList[0]);
            }
        });
    });

    document.querySelectorAll('label.btn-menu input[type="file"][accept="application/pdf"]').forEach(function(input) {
        input.addEventListener('change', function(event) {
            const fileList = event.target.files;
            const label = input.closest('label.btn-menu');
            Array.from(label.children).forEach(function(child) {
                if (child.tagName === 'IMG') {
                    child.style.display = (fileList.length > 0) ? 'none' : '';
                }
            });
            let fileNameSpan = label.querySelector('.file-name');
            if (!fileNameSpan) {
                fileNameSpan = document.createElement('span');
                fileNameSpan.className = 'file-name';
                fileNameSpan.style.marginLeft = '10px';
                fileNameSpan.style.fontWeight = 'normal';
                label.appendChild(fileNameSpan);
            }
            if (fileList.length > 0) {
                fileNameSpan.textContent = `Archivo seleccionado: ${fileList[0].name}`;
                fileNameSpan.style.display = 'inline-block';
            } else {
                fileNameSpan.textContent = '';
                fileNameSpan.style.display = 'none';
                Array.from(label.children).forEach(function(child) {
                    if (child.tagName === 'IMG') {
                        child.style.display = '';
                    }
                });
            }
        });
    });
    // --- Lógica de membresía ---
    // Simula el estado de membresía: "inactiva", "pendiente", "activa"
    // En producción, obtén este valor del backend
    const estadoMembresia = window.estadoMembresiaRestaurante || "activa"; // Cambia según pruebas

    const btnHeaderSubscripcion = document.getElementById('btnHeaderSubscripcion');
    const btnEstadisticas = document.getElementById('btnEstadisticas');
    const mensaje = document.getElementById('membresiaMensaje');

    if (btnEstadisticas && mensaje) {
        if (estadoMembresia === "activa") {
            btnEstadisticas.style.display = "inline-block";
            btnEstadisticas.disabled = false;
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "none";
        } else if (estadoMembresia === "pendiente") {
            btnEstadisticas.style.display = "none";
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "inline-block";
        } else {
            btnEstadisticas.style.display = "none";
            mensaje.textContent = "";
            if (btnHeaderSubscripcion) btnHeaderSubscripcion.style.display = "inline-block";
        }
    }
});
