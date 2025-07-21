document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="file"]').forEach(function(input) {
        input.addEventListener('change', function(event) {
            const fileList = event.target.files;
            let fileNameSpan = input.nextElementSibling;
            if (!fileNameSpan || !fileNameSpan.classList.contains('file-name')) {
                fileNameSpan = document.createElement('span');
                fileNameSpan.className = 'file-name';
                input.parentNode.insertBefore(fileNameSpan, input.nextSibling);
            }
            if (fileList.length > 0) {
                if (input.hasAttribute('multiple')) {
                    const names = Array.from(fileList).map(f => f.name).join(', ');
                    fileNameSpan.textContent = `Archivos seleccionados: ${names}`;
                } else {
                    fileNameSpan.textContent = `Archivo seleccionado: ${fileList[0].name}`;
                }
            } else {
                fileNameSpan.textContent = '';
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");
  const modal = document.getElementById("modal");
  const cerrarModal = document.getElementById("cerrarModal");

  function validarCampoVacio(campo, spanError, mensaje) {
    if (campo.value.trim() === "") {
      campo.classList.add("input-error");
      spanError.textContent = mensaje;
      return false;
    } else {
      campo.classList.remove("input-error");
      spanError.textContent = "";
      return true;
    }
  }

  // Función para comprimir imágenes (compresión más agresiva)
  function comprimirImagen(file, maxWidth = 400, quality = 0.3) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a blob comprimido
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const restaurante = document.getElementById("restaurante");
    const propietario = document.getElementById("propietario");
    const correo = document.getElementById("correo");
    const numero = document.getElementById("numero");
    const direccion = document.getElementById("direccion");
    const horario = document.getElementById("horario");

    const imagen1 = document.getElementsByName("imagen1")[0];
    const comprobante = document.getElementsByName("comprobante")[0];

    const errorRestaurante = document.getElementById("error-nombre-restaurante");
    const errorPropietario = document.getElementById("error-nombre-propietario");
    const errorCorreo = document.getElementById("error-correo");
    const errorNumero = document.getElementById("error-numero");
    const errorDireccion = document.getElementById("error-direccion");
    const errorHorario = document.getElementById("error-horario");
    const errorImagen1 = document.getElementById("error-images");
    const errorComprobante = document.getElementById("error-comprobante");

    let formularioValido = true;

    formularioValido &= validarCampoVacio(restaurante, errorRestaurante, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(propietario, errorPropietario, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(correo, errorCorreo, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(numero, errorNumero, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(direccion, errorDireccion, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(horario, errorHorario, "*Este campo es obligatorio.");

    if (!imagen1.files || imagen1.files.length !== 3) {
      errorImagen1.textContent = "*Seleccione tres imágenes.";
      formularioValido = false;
    } else {
      let formatosValidos = true;
      for (let i = 0; i < imagen1.files.length; i++) {
      const tipo = imagen1.files[i].type;
      if (tipo !== "image/png" && tipo !== "image/jpeg") {
        formatosValidos = false;
        break;
      }
      }
      if (!formatosValidos) {
      errorImagen1.textContent = "*Las imágenes deben ser PNG o JPEG.";
      formularioValido = false;
      } else {
      errorImagen1.textContent = "";
      }
    }

    if (!comprobante.files || comprobante.files.length === 0) {
      errorComprobante.textContent = "*Suba un comprobante de domicilio.";
      formularioValido = false;
    } else {
      errorComprobante.textContent = "";
    }

    if (formularioValido) {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('restaurante', document.getElementById('restaurante').value.trim());
      formData.append('correo', document.getElementById('correo').value.trim());
      formData.append('direccion', document.getElementById('direccion').value.trim());
      formData.append('propietario', document.getElementById('propietario').value.trim());
      formData.append('numero', document.getElementById('numero').value.replace(/\D/g, ''));
      formData.append('horario', document.getElementById('horario').value.trim());
      // formData.append('id_restaurantero', '55'); // No enviamos id_restaurantero para solicitudes nuevas
      formData.append('estado', 'pendiente');
      
      // Archivos (comprimidos)
      const imagen1Input = document.getElementsByName("imagen1")[0];
      const comprobanteInput = document.getElementsByName("comprobante")[0];
      
      // Agregar las 3 imágenes comprimidas
      if (imagen1Input?.files && imagen1Input.files.length >= 3) {
        try {
          console.log('Comprimiendo imágenes...');
          const imagen1Comprimida = await comprimirImagen(imagen1Input.files[0]);
          const imagen2Comprimida = await comprimirImagen(imagen1Input.files[1]);
          const imagen3Comprimida = await comprimirImagen(imagen1Input.files[2]);
          
          formData.append('imagen1', imagen1Comprimida, 'imagen1.jpg');
          formData.append('imagen2', imagen2Comprimida, 'imagen2.jpg');
          formData.append('imagen3', imagen3Comprimida, 'imagen3.jpg');
          console.log('Imágenes comprimidas exitosamente');
        } catch (error) {
          console.error('Error al comprimir imágenes:', error);
          alert('Error al procesar las imágenes');
          return;
        }
      }
      
      // Agregar comprobante (también comprimido si es imagen)
      const comprobante = comprobanteInput?.files[0];
      if (comprobante) {
        // Si el comprobante es una imagen, comprimirla también
        if (comprobante.type.startsWith('image/')) {
          try {
            console.log('Comprimiendo comprobante...');
            const comprobanteComprimido = await comprimirImagen(comprobante, 800, 0.4);
            formData.append('comprobante', comprobanteComprimido, 'comprobante.jpg');
            console.log('Comprobante comprimido exitosamente');
          } catch (error) {
            console.error('Error al comprimir comprobante:', error);
            // Si falla la compresión, usar el archivo original
            formData.append('comprobante', comprobante);
          }
        } else {
          // Si no es imagen, usar directamente
          formData.append('comprobante', comprobante);
        }
      }

      try {
        console.log('Enviando solicitud...');
        console.log('Datos del FormData:');
        let totalSize = 0;
        for (let [key, value] of formData.entries()) {
          if (value instanceof File || value instanceof Blob) {
            console.log(`${key}: [File] ${value.name || 'blob'} (${value.size} bytes)`);
            totalSize += value.size;
          } else {
            console.log(`${key}: "${value}"`);
            totalSize += new Blob([value]).size;
          }
        }
        console.log(`Tamaño total aproximado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        
        const response = await fetch('http://localhost:7070/solicitudes/with-files', {
          method: 'POST',
          body: formData // Sin Content-Type header - el navegador lo establece automáticamente para FormData
        });
        
        if (response.ok) {
          modal.style.display = "flex";
          form.reset();
          console.log('Solicitud enviada exitosamente');
        } else {
          const errorText = await response.text();
          console.error('Error del servidor:', response.status, errorText);
          alert(`Error al enviar la solicitud: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert("Error de conexión.");
      }
    }
  });

  cerrarModal.addEventListener("click", function () {
    modal.style.display = "none";
    window.location.href = "index.html";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      window.location.href = "index.html";
    }
  });
});
