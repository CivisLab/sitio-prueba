// CivisLab: el pago simulado de Profesional. No hay red: ni fetch, ni formularios, ni almacenamiento.
// El plan cambia solo en esta pantalla.
(function () {
  "use strict";
  var raiz = document.getElementById("pago-sim");
  if (!raiz) return;
  var $ = function (id) { return document.getElementById(id); };
  var DATOS = JSON.parse($("sim-datos-wompi").textContent);
  var dias = parseInt(raiz.getAttribute("data-dias"), 10), meses = parseInt(raiz.getAttribute("data-meses"), 10);
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fecha(d) { return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }); }
  var vence = null;
  if (dias || meses) {
    vence = new Date();
    if (meses) vence.setMonth(vence.getMonth() + meses); else vence.setDate(vence.getDate() + dias);
    $("sim-hasta").textContent = " hasta el " + fecha(vence);
  }

  function paso(n) {
    [1, 2, 3].forEach(function (k) { $("paso-" + k).hidden = k !== n; });
    document.querySelectorAll(".sim-pasos li").forEach(function (li) {
      var k = parseInt(li.getAttribute("data-paso"), 10);
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("hecho", k < n);
    });
    var h = $("paso-" + n).querySelector("h2:not([hidden])");
    if (h && n !== 3) h.focus();
    raiz.scrollIntoView({ block: "start", behavior: quieto ? "auto" : "smooth" });
  }
  function elegido(nombre) { var r = document.querySelector('input[name="' + nombre + '"]:checked'); return r ? r.value : null; }
  function pintarDatos() { $("sim-datos").innerHTML = DATOS[elegido("medio")][elegido("resultado")]; }
  function referencia() {
    var a = new Uint8Array(4); crypto.getRandomValues(a);
    return "SIM-" + Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("").toUpperCase();
  }

  var acepto = $("sim-acepto"), continuar = $("sim-continuar");
  continuar.disabled = false;
  acepto.addEventListener("change", function () { if (acepto.checked) $("sim-falta").hidden = true; });
  continuar.addEventListener("click", function () {
    if (!acepto.checked) { $("sim-falta").hidden = false; acepto.focus(); return; }
    paso(2);
  });
  $("sim-atras").addEventListener("click", function () { paso(1); });
  document.querySelectorAll('input[name="medio"], input[name="resultado"]').forEach(function (r) {
    r.addEventListener("change", pintarDatos);
  });

  $("sim-pagar").addEventListener("click", function () {
    var medio = elegido("medio"), resultado = elegido("resultado");
    paso(3);
    $("sim-procesa").hidden = false; $("sim-aprobado").hidden = true; $("sim-rechazado").hidden = true;
    setTimeout(function () {
      $("sim-procesa").hidden = true;
      var ok = resultado === "aprobado", caja = $(ok ? "sim-aprobado" : "sim-rechazado");
      if (ok) {
        $("sim-plan").textContent = "Profesional";
        $("sim-hasta-2").textContent = vence ? " hasta el " + fecha(vence) : "";
        $("sim-ref").textContent = referencia();
        $("sim-como").textContent = DATOS[medio].titulo + (medio === "tarjeta" ? " terminada en " + DATOS[medio].ultimos : "");
      } else {
        $("sim-plan").textContent = "Libre";
      }
      caja.hidden = false;
      caja.querySelector("h2").focus();
    }, quieto ? 400 : 1400);
  });
  document.querySelectorAll("[data-otra]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelector('input[name="resultado"][value="' + b.getAttribute("data-otra") + '"]').checked = true;
      $("sim-plan").textContent = "Libre";
      pintarDatos(); paso(2);
    });
  });
})();
