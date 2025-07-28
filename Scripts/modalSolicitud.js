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
      
      formData.append('restaurante', restaurante.value.trim());
      formData.append('propietario', propietario.value.trim());
      formData.append('correo', correo.value.trim());
      formData.append('numero', numero.value.replace(/\D/g, ''));
      formData.append('direccion', direccion.value.trim());
      formData.append('horario', horario.value.trim());
      formData.append('facebook', facebook.value.trim());
      formData.append('instagram', instagram.value.trim());
      formData.append('estado', 'pendiente');
      formData.append('etiqueta1', 'Seleccionar');
      formData.append('etiqueta2', 'Seleccionar');
      formData.append('etiqueta3', 'Seleccionar');

      if (imagen1?.files && imagen1.files.length === 1) {
        const imagen1Comprimida = await comprimirImagen(imagen1.files[0]);
        formData.append('imagen1', imagen1Comprimida, imagen1.files[0].name || 'imagen1.jpg');
      }
      if (imagen2?.files && imagen2.files.length === 1) {
        const imagen2Comprimida = await comprimirImagen(imagen2.files[0]);
        formData.append('imagen2', imagen2Comprimida, imagen2.files[0].name || 'imagen2.jpg');
      }
      if (imagen3?.files && imagen3.files.length === 1) {
        const imagen3Comprimida = await comprimirImagen(imagen3.files[0]);
        formData.append('imagen3', imagen3Comprimida, imagen3.files[0].name || 'imagen3.jpg');
      }

      const comprobanteArchivo = comprobante?.files[0];
      if (comprobanteArchivo) {
        if (comprobanteArchivo.type.startsWith('image/')) {
          const comprobanteComprimido = await comprimirImagen(comprobanteArchivo, 800, 0.4);
          formData.append('comprobante', comprobanteComprimido, comprobanteArchivo.name || 'comprobante.jpg');
        } else {
          formData.append('comprobante', comprobanteArchivo, comprobanteArchivo.name);
        }
      }

      const menuArchivo = menu?.files && menu.files.length > 0 ? menu.files[0] : null;
      if (menuArchivo) {
        if (menuArchivo.type.startsWith('image/')) {
          const menuComprimido = await comprimirImagen(menuArchivo, 800, 0.4);
          formData.append('menu', menuComprimido, menuArchivo.name || 'menu.jpg');
        } else {
          formData.append('menu', menuArchivo, menuArchivo.name);
        }
      }

      try {
        const response = await fetch('http://75.101.159.172:7070/solicitudes/with-files', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          try {
            console.log('Creando registro de estadísticas para:', correo.value.trim());
            
            const estadisticasPayload = {
              correo: correo.value.trim(),
              nacional: 0,
              extranjero: 0,
              descargas: 0,
              comida: 0,
              vista: 0,
              horario: 0,
              recomendacion: 0,
              ubicacion: 0
            };

            const estadisticasResponse = await fetch('http://75.101.159.172:7070/estadisticas', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(estadisticasPayload)
            });

            if (estadisticasResponse.ok) {
              console.log('✅ Registro de estadísticas creado exitosamente');
            } else {
              console.warn('⚠️ Error al crear registro de estadísticas:', estadisticasResponse.status);
            }
          } catch (estadisticasError) {
            console.error('❌ Error al crear estadísticas:', estadisticasError);
          }

          modal.style.display = "flex";
          form.reset();
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
