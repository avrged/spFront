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
      const formData = new FormData(form);

      try {
        const response = await fetch('http://localhost:7070/solicitudes', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          modal.style.display = "flex";
          form.reset();
        } else {
          alert("Error al enviar la solicitud.");
        }
      } catch (error) {
        alert("Error de conexión.");
      }
    }
  });

  cerrarModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
