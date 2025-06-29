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

    const correo = document.getElementById("correo");
    const numero = document.getElementById("numero");
    const contrasena = document.getElementById("contrasena");
    const motivo = document.getElementById("motivo");


    const errorContrasena = document.getElementById("error-contrasena");
    const errorMotivo = document.getElementById("error-motivo");
    const errorCorreo = document.getElementById("error-correo");
    const errorNumero = document.getElementById("error-numero");


    let formularioValido = true;

    formularioValido &= validarCampoVacio(contrasena, errorContrasena, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(motivo, errorMotivo, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(correo, errorCorreo, "*Este campo es obligatorio.");
    formularioValido &= validarCampoVacio(numero, errorNumero, "*Este campo es obligatorio.");

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
