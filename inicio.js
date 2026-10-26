// CivisLab: portada de ciudades verdes. Sin movimiento si el sistema pide reducirlo.
(function () {
  var raiz = document.querySelector(".portada-ciudades");
  if (!raiz) return;
  var fotos = raiz.querySelectorAll(".pc-diap"), frases = raiz.querySelectorAll(".pc-frase");
  var boton = raiz.querySelector(".pc-pausa"), n = 0, reloj = null;
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function mostrar(i) {
    fotos.forEach(function (f, k) { f.classList.toggle("activa", k === i % fotos.length); f.setAttribute("aria-hidden", k === i % fotos.length ? "false" : "true"); });
    frases.forEach(function (f, k) { f.classList.toggle("activa", k === i % frases.length); });
  }
  function seguir() { n += 1; mostrar(n); }
  function andar() { if (!reloj) reloj = setInterval(seguir, 6000); boton.setAttribute("aria-pressed", "false"); boton.textContent = "Pausar"; }
  function parar() { clearInterval(reloj); reloj = null; boton.setAttribute("aria-pressed", "true"); boton.textContent = "Reanudar"; }
  if (quieto) {   // sin avance solo: el botón pasa a la siguiente foto y frase
    boton.textContent = "Siguiente"; boton.removeAttribute("aria-pressed");
    boton.addEventListener("click", seguir);
  } else {
    boton.addEventListener("click", function () { if (reloj) parar(); else { seguir(); andar(); } });
    andar();
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden && reloj) { clearInterval(reloj); reloj = null; } else if (!document.hidden && boton.getAttribute("aria-pressed") === "false" && !quieto) andar(); });
})();
