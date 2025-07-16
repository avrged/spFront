document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");

    const errorCorreo = document.getElementById("error-correo");
    const errorContrasena = document.getElementById("error-contrasena");

    let formularioValido = true;

    errorCorreo.textContent = "";
    errorContrasena.textContent = "";

    correo.classList.remove("input-error");
    contrasena.classList.remove("input-error");

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

  });
});

function initializeLoginForm() {
  console.log('Buscando formulario de login...');
  
  const form = document.getElementById("loginForm");
  
  if (!form) {
    console.log("Formulario de login no encontrado");
    return;
  }

  console.log('Formulario encontrado, configurando validaciones...');

  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log('Formulario enviado, validando...');

    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");

    const errorCorreo = document.getElementById("error-correo");
    const errorContrasena = document.getElementById("error-contrasena");

    if (!correo || !contrasena || !errorCorreo || !errorContrasena) {
      console.log('Elementos no encontrados:', {
        correo: !!correo,
        contrasena: !!contrasena,
        errorCorreo: !!errorCorreo,
        errorContrasena: !!errorContrasena
      });
      return;
    }

    let formularioValido = true;

    errorCorreo.textContent = "";
    errorContrasena.textContent = "";

    correo.classList.remove("input-error");
    contrasena.classList.remove("input-error");

    if (correo.value.trim() === "") {
        errorCorreo.textContent = "*Este campo es obligatorio.";
        correo.classList.add("input-error");
        formularioValido = false;
    } else if (!isValidEmail(correo.value)) {
        errorCorreo.textContent = "*Ingrese un correo electrónico válido.";
        correo.classList.add("input-error");
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

    if (formularioValido) {
      // Detectar el rol según el archivo HTML actual
      let rol = '';
      const path = window.location.pathname;
      if (path.includes('loginAdmin')) {
        rol = 'administrador';
      } else if (path.includes('loginRest')) {
        rol = 'restaurantero';
      } else {
        // fallback: intentar leer de un input oculto o default a restaurantero
        rol = 'restaurantero';
      }

      fetch('http://localhost:7070/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correo.value,
          contrasena: contrasena.value,
          rol: rol
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.rol === 'administrador') {
            window.location.href = 'vistaPrincipalAdmin.html';
          } else {
            window.location.href = 'vistaPrincipalRestaurantero.html';
          }
        } else {
          errorContrasena.textContent = data.message || "Credenciales incorrectas";
        }
      })
      .catch(() => {
        errorContrasena.textContent = "Error de conexión con el servidor";
      });
    } else {
      console.log('Formulario inválido, errores mostrados');
    }
  });

  console.log('Validaciones configuradas correctamente');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando login...');
  initializeLoginForm();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Documento ya cargado, inicializando login...');
  initializeLoginForm();
}