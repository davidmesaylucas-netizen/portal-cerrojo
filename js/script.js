// Cerrojo - JavaScript puro, sin alert().
// Bloque 1: validación del formulario de contacto (solo actúa en contacto.html).
(function () {
  "use strict";
  var form = document.getElementById("form-contacto");
  if (!form) { return; }

  var campos = {
    nombre:  { el: document.getElementById("nombre"),  err: document.getElementById("error-nombre") },
    email:   { el: document.getElementById("email"),   err: document.getElementById("error-email") },
    servicio:{ el: document.getElementById("servicio"),err: document.getElementById("error-servicio") },
    mensaje: { el: document.getElementById("mensaje"), err: document.getElementById("error-mensaje") },
    acepto:  { el: document.getElementById("acepto"),  err: document.getElementById("error-acepto") }
  };
  var exito = document.getElementById("mensaje-exito");
  var contador = document.getElementById("contador");
  var patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Devuelve el texto del error o "" si el campo es válido.
  function validar(nombre) {
    var v = campos[nombre].el;
    if (nombre === "nombre") {
      if (v.value.trim().length < 3) { return "El nombre debe tener al menos 3 caracteres."; }
    } else if (nombre === "email") {
      if (!patronEmail.test(v.value.trim())) { return "Escribe un correo válido, por ejemplo nombre@dominio.com."; }
    } else if (nombre === "servicio") {
      if (v.value === "") { return "Elige el servicio que te interesa."; }
    } else if (nombre === "mensaje") {
      if (v.value.trim().length < 20) { return "El mensaje debe tener al menos 20 caracteres (llevas " + v.value.trim().length + ")."; }
    } else if (nombre === "acepto") {
      if (!v.checked) { return "Debes aceptar el tratamiento de tus datos para continuar."; }
    }
    return "";
  }

  // Muestra u oculta el error de un campo y marca el estado con clases de Bootstrap.
  function pintar(nombre) {
    var c = campos[nombre];
    var texto = validar(nombre);
    c.err.textContent = texto;
    c.el.classList.toggle("is-invalid", texto !== "");
    c.el.classList.toggle("is-valid", texto === "");
    c.el.setAttribute("aria-invalid", texto !== "" ? "true" : "false");
    return texto === "";
  }

  Object.keys(campos).forEach(function (nombre) {
    var el = campos[nombre].el;
    var evento = (el.type === "checkbox" || el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(evento, function () { exito.hidden = true; pintar(nombre); });
    el.addEventListener("blur", function () { pintar(nombre); });
  });

  campos.mensaje.el.addEventListener("input", function () {
    contador.textContent = campos.mensaje.el.value.trim().length + " caracteres (mínimo 20)";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var todoOk = true;
    var primero = null;
    Object.keys(campos).forEach(function (nombre) {
      if (!pintar(nombre)) { todoOk = false; if (!primero) { primero = campos[nombre].el; } }
    });
    if (!todoOk) { exito.hidden = true; primero.focus(); return; }
    // Aquí no se envía a ningún servidor: solo se confirma en pantalla.
    exito.hidden = false;
    exito.textContent = "¡Gracias, " + campos.nombre.el.value.trim() + "! Recibimos tu solicitud y te responderemos al correo indicado.";
    form.reset();
    contador.textContent = "0 caracteres (mínimo 20)";
    Object.keys(campos).forEach(function (n) {
      campos[n].el.classList.remove("is-valid", "is-invalid");
      campos[n].el.removeAttribute("aria-invalid");
    });
  });
})();

// Bloque 2: autodiagnóstico de la portada (solo actúa en index.html).
(function () {
  "use strict";
  var contenedor = document.getElementById("diagnostico");
  if (!contenedor) { return; }

  var casillas = contenedor.querySelectorAll("input[type=checkbox]");
  var barra = document.getElementById("barra-diagnostico");
  var relleno = document.getElementById("barra-relleno");
  var cuenta = document.getElementById("diag-cuenta");
  var mensaje = document.getElementById("diag-mensaje");
  var paso = document.getElementById("diag-paso");

  // Siguiente paso sugerido según la primera casilla sin marcar.
  var pasos = [
    "Siguiente paso: usa una contraseña distinta en cada cuenta (un gestor de contraseñas ayuda).",
    "Siguiente paso: activa la verificación en dos pasos en tu correo.",
    "Siguiente paso: haz una copia de seguridad y prueba restaurarla.",
    "Siguiente paso: activa las actualizaciones automáticas en tus equipos.",
    "Siguiente paso: enseña a tu equipo a reconocer correos sospechosos."
  ];
  var mensajes = [
    "Hay varias puertas abiertas, pero se pueden cerrar de a una.",
    "Hay varias puertas abiertas, pero se pueden cerrar de a una.",
    "Vas por buen camino, aunque todavía quedan puertas sin cerrar.",
    "Vas por buen camino, aunque todavía quedan puertas sin cerrar.",
    "Casi todo está cerrado. Te falta una puerta.",
    "Tienes los cinco hábitos básicos. Una revisión externa puede encontrar lo que no ves."
  ];

  function actualizar() {
    var total = 0;
    var primeraFaltante = -1;
    casillas.forEach(function (c, i) {
      if (c.checked) { total++; } else if (primeraFaltante === -1) { primeraFaltante = i; }
    });
    relleno.style.width = (total * 20) + "%";
    barra.setAttribute("aria-valuenow", String(total));
    cuenta.textContent = total + " de 5 hábitos";
    mensaje.textContent = total === 0 ? "Marca lo que ya haces para ver tu resultado." : mensajes[total];
    paso.textContent = primeraFaltante === -1 ? "" : pasos[primeraFaltante];
  }

  casillas.forEach(function (c) { c.addEventListener("change", actualizar); });
  actualizar();
})();

// Bloque 3: transición suave al cambiar de página (se desactiva si el usuario pidió reducir el movimiento).
(function () {
  "use strict";
  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Si se vuelve con el botón "atrás", se quita el estado de salida.
  window.addEventListener("pageshow", function () { document.body.classList.remove("saliendo"); });
  if (reducir) { return; }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) { return; }
    if (a.target === "_blank" || a.hasAttribute("download")) { return; }
    var destino = a.getAttribute("href");
    if (!destino || destino.charAt(0) === "#" || /^(https?:|mailto:|tel:)/i.test(destino)) { return; }
    e.preventDefault();
    document.body.classList.add("saliendo");
    window.setTimeout(function () { window.location.href = a.href; }, 220);
  });
})();
