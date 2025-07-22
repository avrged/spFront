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

  // Función para comprimir imágenes
  function comprimirImagen(file, maxWidth = 400, quality = 0.3) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
    const facebook = document.getElementById("facebook");
    const instagram = document.getElementById("instagram");
    const direccion = document.getElementById("direccion");
    const horario = document.getElementById("horario");

    const imagen1 = document.getElementsByName("imagen1")[0];
    const imagen2 = document.getElementsByName("imagen2")[0];
    const imagen3 = document.getElementsByName("imagen3")[0];
    const comprobante = document.getElementsByName("comprobante")[0];
    const menu = document.getElementsByName("menu")[0];

    const errorRestaurante = document.getElementById("error-nombre-restaurante");
    const errorPropietario = document.getElementById("error-nombre-propietario");
    const errorCorreo = document.getElementById("error-correo");
    const errorNumero = document.getElementById("error-numero");
    const errorFacebook = document.getElementById("error-facebook");
    const errorInstagram = document.getElementById("error-instagram");
    const errorDireccion = document.getElementById("error-direccion");
    const errorHorario = document.getElementById("error-horario");
    const errorImagen1 = document.getElementById("error-imagen1");
    const errorImagen2 = document.getElementById("error-imagen2");
    const errorImagen3 = document.getElementById("error-imagen3");
    const errorComprobante = document.getElementById("error-comprobante");
    const errorMenu = document.getElementById("error-menu");

    let formularioValido = true;

    formularioValido &= validarCampoVacio(restaurante, errorRestaurante, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(propietario, errorPropietario, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(correo, errorCorreo, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(numero, errorNumero, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(direccion, errorDireccion, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(horario, errorHorario, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(facebook, errorFacebook, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(instagram, errorInstagram, "*Este campo es obligatorio.");

    // Validación individual de imágenes
    function validarImagen(input, errorSpan) {
      if (!input.files || input.files.length !== 1) {
        errorSpan.textContent = "*Seleccione una imagen.";
        formularioValido = false;
      } else {
        const tipo = input.files[0].type;
        if (tipo !== "image/png" && tipo !== "image/jpeg") {
          errorSpan.textContent = "*La imagen debe ser PNG o JPEG.";
          formularioValido = false;
        } else {
          errorSpan.textContent = "";
        }
      }
    }
    validarImagen(imagen1, errorImagen1);
    validarImagen(imagen2, errorImagen2);
    validarImagen(imagen3, errorImagen3);

    if (!comprobante.files || comprobante.files.length === 0) {
      errorComprobante.textContent = "*Suba un comprobante de domicilio.";
      formularioValido = false;
    } else {
      errorComprobante.textContent = "";
    }

    if (!menu.files || menu.files.length === 0) {
      errorMenu.textContent = "*Suba el menú del restaurante.";
      formularioValido = false;
    } else {
      errorMenu.textContent = "";
    }

    if (formularioValido) {
      const formData = new FormData();
      
      formData.append('restaurante', document.getElementById('restaurante').value.trim());
      formData.append('correo', document.getElementById('correo').value.trim());
      formData.append('direccion', document.getElementById('direccion').value.trim());
      formData.append('propietario', document.getElementById('propietario').value.trim());
      formData.append('numero', document.getElementById('numero').value.replace(/\D/g, ''));
      formData.append('facebook', document.getElementById('facebook').value.trim());
      formData.append('instagram', document.getElementById('instagram').value.trim());
      formData.append('horario', document.getElementById('horario').value.trim());
      formData.append('estado', 'pendiente');
      
      // Procesar cada imagen individual
      if (imagen1?.files && imagen1.files.length === 1) {
        const imagen1Comprimida = await comprimirImagen(imagen1.files[0]);
        formData.append('imagen1', imagen1Comprimida, 'imagen1.jpg');
      }
      if (imagen2?.files && imagen2.files.length === 1) {
        const imagen2Comprimida = await comprimirImagen(imagen2.files[0]);
        formData.append('imagen2', imagen2Comprimida, 'imagen2.jpg');
      }
      if (imagen3?.files && imagen3.files.length === 1) {
        const imagen3Comprimida = await comprimirImagen(imagen3.files[0]);
        formData.append('imagen3', imagen3Comprimida, 'imagen3.jpg');
      }
      
      const comprobanteArchivo = comprobante?.files[0];
      if (comprobanteArchivo) {
        if (comprobanteArchivo.type.startsWith('image/')) {
          const comprobanteComprimido = await comprimirImagen(comprobanteArchivo, 800, 0.4);
          formData.append('comprobante', comprobanteComprimido, 'comprobante.jpg');
        } else {
          formData.append('comprobante', comprobanteArchivo);
        }
      }

      if (menu?.files && menu.files.length > 0) {
        const menuComprimido = await comprimirImagen(menu.files[0], 800, 0.4);
        formData.append('menu', menuComprimido, 'menu.jpg');
      }

      try {
        console.log('Enviando solicitud...');
        
        const response = await fetch('http://localhost:7070/solicitudes/with-files', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          // Obtener respuesta del backend para extraer URLs de imágenes y comprobante si las devuelve
          let data = {};
          try {
            data = await response.json();
          } catch (e) {
            // Si no es JSON, continuar igual
          }

          const datosRestaurante = {
            nombre: document.getElementById('restaurante').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            horario: document.getElementById('horario').value.trim(),
            telefono: document.getElementById('numero').value.replace(/\D/g, ''),
            imagen1: data.imagen1 || '',
            imagen2: data.imagen2 || '',
            imagen3: data.imagen3 || '',
            // Puedes agregar más campos si tu tabla restaurante los requiere
          };

          try {
            await fetch('http://localhost:7070/restaurantes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datosRestaurante)
            });
            console.log('Datos de restaurante enviados a la tabla restaurante');
          } catch (e) {
            console.error('Error al guardar en restaurante:', e);
          }

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
