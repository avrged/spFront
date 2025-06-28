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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const restaurante = document.getElementById("restaurante");
    const propietario = document.getElementById("propietario");
    const correo = document.getElementById("correo");
    const numero = document.getElementById("numero");
    const direccion = document.getElementById("direccion");
    const horario = document.getElementById("horario");

    const imagen1 = document.getElementsByName("imagen1")[0];
    const imagen2 = document.getElementsByName("imagen2")[0];

    const errorRestaurante = document.getElementById("error-nombre-restaurante");
    const errorPropietario = document.getElementById("error-nombre-propietario");
    const errorCorreo = document.getElementById("error-correo");
    const errorNumero = document.getElementById("error-numero");
    const errorDireccion = document.getElementById("error-direccion");
    const errorHorario = document.getElementById("error-horario");
    const errorImagen1 = document.getElementById("error-images");
    const errorImagen2 = document.getElementById("error-comprobante");

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

    if (!imagen2.files || imagen2.files.length === 0) {
      errorImagen2.textContent = "*Suba un comprobante de domicilio.";
      formularioValido = false;
    } else {
      errorImagen2.textContent = "";
    }

    if (formularioValido) {
      modal.style.display = "flex";
      form.reset();
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
