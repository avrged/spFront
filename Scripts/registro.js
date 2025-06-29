document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const confirmar = document.getElementById("confirmar");


    const errorNombre = document.getElementById("error-nombre");
    const errorCorreo = document.getElementById("error-correo");
    const errorContrasena = document.getElementById("error-contrasena");
    const errorConfirmar = document.getElementById("error-confirmar");

    let formularioValido = true;

    errorNombre.textContent = "";
    errorCorreo.textContent = "";
    errorContrasena.textContent = "";
    errorConfirmar.textContent = "";

    nombre.classList.remove("input-error");
    correo.classList.remove("input-error");
    contrasena.classList.remove("input-error");
    confirmar.classList.remove("input-error");


    if (nombre.value.trim() === "") {
        errorNombre.textContent = "*Este campo es obligatorio.";
        nombre.classList.add("input-error");
        formularioValido = false;
    }

    if (correo.value.trim() === "") {
        errorCorreo.textContent = "*Este campo es obligatorio.";
        correo.classList.add("input-error");
        formularioValido = false;
    }

    if (contrasena.value.trim() === "") {
        errorContrasena.textContent = "*Este campo es obligatorio.";
        contrasena.classList.add("input-error");
        formularioValido = false;
    }

    if (confirmar.value.trim() === "") {
        errorConfirmar.textContent = "*Este campo es obligatorio.";
        confirmar.classList.add("input-error");
        formularioValido = false;
    }

    if (formularioValido) {
        window.location.href = "solicitudRestaurante.html";
    }

  });
});