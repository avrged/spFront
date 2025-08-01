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
  const form = document.getElementById("loginForm");
  
  if (!form) {
    return;
  }

  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");

    const errorCorreo = document.getElementById("error-correo");
    const errorContrasena = document.getElementById("error-contrasena");

    if (!correo || !contrasena || !errorCorreo || !errorContrasena) {
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


      let rol = 'restaurantero'; 
      let parent = newForm.parentElement;
      while (parent) {
        if (parent.id === 'loginAdminContent') {
          rol = 'administrador';
          break;
        } else if (parent.id === 'loginRestContent') {
          rol = 'restaurantero';
          break;
        }
        parent = parent.parentElement;
      }

      fetch('http://75.101.159.172:7070/login', {
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
          let usuarioData = null;
          
          if (data.usuario) {
            usuarioData = data.usuario;
          }
          else if (data.id) {
            usuarioData = {
              id: data.id,
              correo: data.correo || correo.value,
              rol: data.rol,
              nombre: data.nombre || '',
              telefono: data.telefono || ''
            };
          }
          else {
            usuarioData = {
              id: data.id || data.userId || Date.now(),
              correo: correo.value,
              rol: data.rol || rol,
              nombre: data.nombre || '',
              telefono: data.telefono || ''
            };
          }
          
          if (usuarioData) {
            sessionStorage.setItem('id', usuarioData.id);
            sessionStorage.setItem('correo', usuarioData.correo);
            sessionStorage.setItem('rol', usuarioData.rol);
            sessionStorage.setItem('nombre', usuarioData.nombre);
            sessionStorage.setItem('telefono', usuarioData.telefono || '');
            
            console.log('✅ Datos guardados en sessionStorage:', {
              id: usuarioData.id,
              correo: usuarioData.correo,
              rol: usuarioData.rol,
              nombre: usuarioData.nombre,
              telefono: usuarioData.telefono
            });
          } else {
            console.warn('⚠️ No se pudieron extraer datos del usuario, guardando datos básicos');
            sessionStorage.setItem('correo', correo.value);
            sessionStorage.setItem('rol', data.rol || rol);
            sessionStorage.setItem('loginSuccess', 'true');
          }
          
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