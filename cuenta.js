// CivisLab: crear cuenta SIMULADA (versión del creador). No envía, no guarda, no usa
// almacenamiento del navegador: solo muestra lo que la cuenta guardaría.
(function () {
  var form = document.getElementById("cuenta-simulada");
  if (!form) return;
  var salida = document.getElementById("cuenta-resultado");
  var lista = document.getElementById("cuenta-guardaria");
  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function marcada(id) { var el = document.getElementById(id); return !!(el && el.checked); }
  function fila(t, d) {
    var dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = t; dd.textContent = d; lista.appendChild(dt); lista.appendChild(dd);
  }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    lista.textContent = "";
    var nivel = form.querySelector("input[name=nivel]:checked");
    fila("Nombre", v("c-nombre"));
    fila("Correo", v("c-correo"));
    if (v("c-organizacion")) fila("Organización", v("c-organizacion"));
    if (v("c-perfil")) fila("Perfil", v("c-perfil"));
    fila("Nivel", nivel ? nivel.value : "Abierto");
    if (marcada("c-autoriza-sensible") && v("c-campana")) fila("Campaña o partido (dato sensible, autorizado)", v("c-campana"));
    fila("Autorización de datos", "Sí, con fecha y hora: " + new Date().toLocaleString("es-CO"));
    fila("Información de servicios", marcada("c-autoriza-servicios") ? "Sí" : "No");
    form.hidden = true;
    salida.hidden = false;
    salida.scrollIntoView({ block: "start" });
  });
  document.getElementById("cuenta-otra").addEventListener("click", function () {
    form.reset(); lista.textContent = ""; salida.hidden = true; form.hidden = false;
  });
})();
