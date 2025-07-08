function initializeMembresiaForm() {
  const form = document.getElementById("membresiaForm");
  if (!form) {
    console.log("Formulario de membresía no encontrado");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo");
    const numero = document.getElementById("numero");
    const contrasena = document.getElementById("contrasena");
    const motivo = document.getElementById("motivo");

    const errorCorreo = document.getElementById("error-correo");
    const errorNumero = document.getElementById("error-numero");
    const errorContrasena = document.getElementById("error-contrasena");
    const errorMotivo = document.getElementById("error-motivo");

    let formularioValido = true;

    errorCorreo.textContent = "";
    errorNumero.textContent = "";
    errorContrasena.textContent = "";
    errorMotivo.textContent = "";

    correo.classList.remove("input-error");
    numero.classList.remove("input-error");
    contrasena.classList.remove("input-error");
    motivo.classList.remove("input-error");

    if (correo.value.trim() === "") {
      errorCorreo.textContent = "*Este campo es obligatorio.";
      correo.classList.add("input-error");
      formularioValido = false;
    } else if (!isValidEmail(correo.value)) {
      errorCorreo.textContent = "*Ingrese un correo electrónico válido.";
      correo.classList.add("input-error");
      formularioValido = false;
    }

    if (numero.value.trim() === "") {
      errorNumero.textContent = "*Este campo es obligatorio.";
      numero.classList.add("input-error");
      formularioValido = false;
    }

    if (contrasena.value.trim() === "") {
      errorContrasena.textContent = "*Este campo es obligatorio.";
      contrasena.classList.add("input-error");
      formularioValido = false;
    } else if (contrasena.value.length < 6) {
      errorContrasena.textContent = "*La contraseña debe tener al menos 6 caracteres.";
      contrasena.classList.add("input-error");
      formularioValido = false;
    }

    if (motivo.value.trim() === "") {
      errorMotivo.textContent = "*Este campo es obligatorio.";
      motivo.classList.add("input-error");
      formularioValido = false;
    }

    if (formularioValido) {
      closeMembresiaModal();
      setTimeout(() => {
        mostrarAlerta();
        form.reset();
      }, 350);
    }
  });

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Alerta de éxito (opcional)
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMembresiaForm);
} else {
  initializeMembresiaForm();
}
