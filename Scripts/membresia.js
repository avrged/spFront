document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("membresiaForm");

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

    // Usa && para validación
    let formularioValido = true;
    formularioValido = validarCampoVacio(contrasena, errorContrasena, "*Este campo es obligatorio.") && formularioValido;
    formularioValido = validarCampoVacio(motivo, errorMotivo, "*Este campo es obligatorio.") && formularioValido;
    formularioValido = validarCampoVacio(correo, errorCorreo, "*Este campo es obligatorio.") && formularioValido;
    formularioValido = validarCampoVacio(numero, errorNumero, "*Este campo es obligatorio.") && formularioValido;

    if (formularioValido && typeof cerrarModalMembresia === "function") {
      cerrarModalMembresia();
      form.reset();
      mostrarAlerta();
    }
  });

  const modalAviso = document.getElementById("modalAviso");
  const cerrarAviso = document.getElementById("cerrarAviso");

  function mostrarAlerta() {
    if (modalAviso) {
      modalAviso.style.display = "flex";
    }
  }

  if (cerrarAviso && modalAviso) {
    cerrarAviso.onclick = function() {
      modalAviso.style.display = "none";
    };
    modalAviso.onclick = function(e) {
      if (e.target === modalAviso) modalAviso.style.display = "none";
    };
  }
});
