function initializeRegistroForm() {
  const form = document.getElementById("registroForm");
  let isSubmitting = false;
  
  if (!form) {
    console.log("Formulario de registro no encontrado");
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    
    if (isSubmitting) {
      console.log("Ya se está procesando una solicitud de registro");
      return;
    }
    
    isSubmitting = true;

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

    if (confirmar.value.trim() === "") {
        errorConfirmar.textContent = "*Este campo es obligatorio.";
        confirmar.classList.add("input-error");
        formularioValido = false;
    } else if (contrasena.value !== confirmar.value) {
        errorConfirmar.textContent = "*Las contraseñas no coinciden.";
        confirmar.classList.add("input-error");
        formularioValido = false;
    }



    if (formularioValido) {
        try {
            console.log("Enviando solicitud de registro...");
            
            const response = await fetch('http://localhost:7070/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.value,
                    correo: correo.value,
                    contrasena: contrasena.value,
                    tipo: 'restaurantero'
                })
            });

            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok && data.success) {
                console.log("Registro exitoso, redirigiendo...");
                window.location.href = "solicitudRestaurante.html";
            } else if (data.message) {
                console.error("Error del servidor:", data.message);
                alert(data.message);
            } else {
                console.error("Error desconocido en el registro");
                alert("Error en el registro");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor");
        } finally {
            
            isSubmitting = false;
        }
    } else {
        
        isSubmitting = false;
    }
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Asegurar que solo se ejecute una vez
document.addEventListener('DOMContentLoaded', function() {
  initializeRegistroForm();
});