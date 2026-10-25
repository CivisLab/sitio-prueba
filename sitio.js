// CivisLab: buscador del explorador de municipios y formulario «Hablemos». Mejora
// progresiva: sin este archivo, el buscador lleva a la lista de municipios y el formulario
// muestra el correo para copiar.
(function () {
  "use strict";
  var norm = function (s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  };

  var busca = document.getElementById("buscador");
  if (busca) {
    var lista = document.getElementById("municipios-lista");
    var entrada = document.getElementById("buscar-municipio");
    var aviso = document.getElementById("buscar-aviso");
    var opciones = Array.prototype.map.call(lista.options, function (o) {
      return { n: norm(o.value), href: o.getAttribute("data-href") };
    });
    var ir = function () {
      var q = norm(entrada.value);
      if (!q) return false;
      var exacto = opciones.filter(function (o) { return o.n === q; })[0];
      var parcial = opciones.filter(function (o) { return o.n.indexOf(q) !== -1; });
      var destino = exacto || (parcial.length === 1 ? parcial[0] : null);
      if (destino) { window.location.href = destino.href; return true; }
      aviso.textContent = parcial.length
        ? parcial.length + " municipios coinciden: escriba un poco más o elija uno de la lista."
        : "Ningún municipio de Antioquia se llama así. Revise la lista completa, más abajo.";
      return false;
    };
    // Sin texto, el formulario sigue a la lista de municipios; con texto, decide ir().
    busca.addEventListener("submit", function (ev) { if (norm(entrada.value)) { ev.preventDefault(); ir(); } });
    entrada.addEventListener("change", function () {
      var q = norm(entrada.value);
      if (opciones.some(function (o) { return o.n === q; })) ir();
    });
  }

  var form = document.getElementById("solicitud");
  if (form) {
    var casillaSensible = document.getElementById("autoriza-sensible");
    var campana = document.getElementById("campana");
    var sincroniza = function () {
      campana.disabled = !casillaSensible.checked;
      if (!casillaSensible.checked) campana.value = "";
    };
    casillaSensible.addEventListener("change", sincroniza);
    sincroniza();
    // Lo que la persona pidió desde otra página (?municipio=…&plan=…&capa=…).
    var PLANES = { suscripcion: "Plan Suscripción", personalizado: "Plan Personalizado" };
    var CAPAS = { poder: "Radiografía de las casas políticas", series: "Resultados de alcaldía desde el año 2000",
                  atlas: "Reporte técnico de Atlas" };
    try {
      var q = new URLSearchParams(window.location.search);
      var mun = q.get("municipio"), plan = PLANES[q.get("plan")], capa = CAPAS[q.get("capa")];
      if (mun && !document.getElementById("municipios").value) document.getElementById("municipios").value = mun;
      var pide = [mun, plan, capa].filter(Boolean);
      var caja = document.getElementById("pide");
      if (pide.length && caja) {
        pide.forEach(function (t) { var s = document.createElement("span"); s.textContent = t; caja.appendChild(s); });
        caja.hidden = false;
      }
      var uso = document.getElementById("uso");
      if ((plan || capa) && !uso.value) uso.value = [plan, capa].filter(Boolean).join(" · ") + (mun ? " de " + mun : "") + ". ";
    } catch (err) { /* navegador sin URLSearchParams: los campos quedan vacíos */ }

    var correo = form.getAttribute("data-correo");
    var valor = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var marcada = function (id) { var el = document.getElementById(id); return !!(el && el.checked); };
    var mensaje = function () {
      var l = [];
      l.push("Nombre: " + valor("nombre"));
      l.push("Correo: " + valor("correo"));
      if (valor("organizacion")) l.push("Organización: " + valor("organizacion"));
      if (valor("municipios")) l.push("Municipios de interés: " + valor("municipios"));
      if (valor("uso")) l.push("Qué necesita: " + valor("uso"));
      if (marcada("autoriza-sensible") && valor("campana")) {
        l.push("Campaña o partido: " + valor("campana"));
        l.push("Autorizo de forma explícita y facultativa el tratamiento de este dato sensible.");
      }
      if (marcada("autoriza-servicios")) l.push("Quiero recibir información sobre los servicios de CivisLab.");
      l.push("");
      l.push(form.getAttribute("data-autorizacion"));
      return l.join("\n");
    };
    var salida = document.getElementById("mensaje-listo");
    var texto = document.getElementById("mensaje-texto");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var asunto = "Hablemos" + (valor("municipios") ? " · " + valor("municipios") : "");
      texto.value = mensaje();
      salida.hidden = false;
      window.location.href = "mailto:" + correo + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(texto.value);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copiar]"), function (b) {
    b.hidden = false;
    b.addEventListener("click", function () {
      var objetivo = document.getElementById(b.getAttribute("data-copiar"));
      var valorCopia = objetivo.value !== undefined ? objetivo.value : objetivo.textContent;
      var estado = document.getElementById(b.getAttribute("data-estado"));
      var listo = function () { if (estado) estado.textContent = "Copiado."; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(valorCopia).then(listo, function () { if (estado) estado.textContent = "Selecciónelo y cópielo a mano."; });
      } else {
        var t = document.createElement("textarea"); t.value = valorCopia; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); listo(); } catch (err) { if (estado) estado.textContent = "Selecciónelo y cópielo a mano."; }
        document.body.removeChild(t);
      }
    });
  });
})();
