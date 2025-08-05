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

  // Función para obtener el último id_restaurantero
  // Función para obtener el último usuario tipo restaurantero
  async function obtenerUltimoRestaurantero() {
    const response = await fetch('http://localhost:7070/restauranteros');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    // Filtrar solo usuarios tipo restaurantero
    const restauranteros = data
      .map(r => r.usuario || r)
      .filter(u => u.tipo === 'restaurantero');
    if (restauranteros.length === 0) return null;
    // Tomar el de mayor id_usuario
    return restauranteros.reduce((max, u) => u.id_usuario > max.id_usuario ? u : max, restauranteros[0]);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const restaurante = document.getElementById("restaurante");
    // const correo = document.getElementById("correo");
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
    // const errorPropietario = document.getElementById("error-nombre-propietario");
    // const errorCorreo = document.getElementById("error-correo");
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

      
      const ultimoRestaurantero = await obtenerUltimoRestaurantero();
      if (!ultimoRestaurantero) {
        alert("No se pudo obtener el usuario restaurantero.");
        return;
      }
      
      
      if (!restaurante.value.trim()) {
        alert("El nombre del restaurante es obligatorio.");
        return;
      }
      
      
      console.log('Datos del restaurantero usados para el registro:', {
        id_usuario: ultimoRestaurantero.id_usuario,
        nombre: ultimoRestaurantero.nombre,
        correo: ultimoRestaurantero.correo,
        contrasena: ultimoRestaurantero.contrasena,
        tipo: ultimoRestaurantero.tipo
      });

      
      const formData = new FormData();
      formData.append('nombreRestaurante', restaurante.value.trim());
      formData.append('propietario', ultimoRestaurantero.nombre);
      formData.append('correoElectronico', ultimoRestaurantero.correo);
      formData.append('numeroCelular', numero.value.trim());
      formData.append('horarios', horario.value.trim());
      formData.append('idRestaurantero', ultimoRestaurantero.id_usuario);
      formData.append('direccion', direccion.value.trim());
      formData.append('facebook', facebook.value.trim());
      formData.append('instagram', instagram.value.trim());
      
      console.log('Verificando campos antes de enviar:');
      console.log('Nombre restaurante:', restaurante.value.trim());
      console.log('Dirección:', direccion.value.trim());
      console.log('Horarios:', horario.value.trim());
      console.log('Número:', numero.value.trim());
      console.log('Facebook:', facebook.value.trim());
      console.log('Instagram:', instagram.value.trim());
      console.log('ID Restaurantero:', ultimoRestaurantero.id_usuario);
      console.log("Facebook:", facebook.value.trim());
      
      if (imagen1?.files[0]) formData.append('imagenPrincipal', imagen1.files[0]);
      if (imagen2?.files[0]) formData.append('imagenSecundaria', imagen2.files[0]);
      if (imagen3?.files[0]) formData.append('imagenPlatillo', imagen3.files[0]);
      if (comprobante?.files[0]) formData.append('comprobanteDomicilio', comprobante.files[0]);
      if (menu?.files[0]) formData.append('menuRestaurante', menu.files[0]);

      
      console.log('=== DATOS A ENVIAR ===');
      const datosParaConsola = {};
      formData.forEach((value, key) => {
        if (value instanceof File) {
          datosParaConsola[key] = `${value.name} (${value.size} bytes)`;
        } else {
          datosParaConsola[key] = value;
        }
      });
      console.table(datosParaConsola);
      
      
      console.log('Campo nombreRestaurante:', formData.get('nombreRestaurante'));
      console.log('Longitud del nombre:', formData.get('nombreRestaurante')?.length);

      
      try {
        console.log('Enviando solicitud al endpoint:', 'http://localhost:7070/registro-restaurante');
        
        const response = await fetch('http://localhost:7070/registro-restaurante', {
          method: 'POST',
          body: formData
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
          const responseData = await response.json();
          console.log('Datos de respuesta del servidor:', responseData);
          modal.style.display = "flex";
          form.reset();
        } else {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
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
