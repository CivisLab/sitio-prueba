// CivisLab: portada en video. Las frases siguen los cortes del video; sin movimiento si el
// sistema lo pide.
(function () {
  var raiz = document.querySelector(".portada-video");
  if (!raiz) return;
  var video = raiz.querySelector(".pv-video"), frases = raiz.querySelectorAll(".pv-frase");
  var boton = raiz.querySelector(".pv-pausa"), caja = raiz.querySelector(".pv-frases");
  var tramos = JSON.parse(caja.getAttribute("data-tramos") || "[]"), actual = 0;
  function mostrar(i) {
    if (i === actual) return;
    actual = i;
    frases.forEach(function (f, k) { f.classList.toggle("activa", k === i); });
  }
  function frasePara(t) {
    var i = 0;
    tramos.forEach(function (x) { if (t >= x.desde) i = x.frase; });
    return i;
  }
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (quieto || !video) {   // solo el póster y la primera frase; el video ni se descarga
    if (video) { video.pause(); video.removeAttribute("autoplay"); video.querySelectorAll("source").forEach(function (s) { s.remove(); }); video.load(); }
    raiz.classList.add("quieta");
    if (boton) boton.hidden = true;
    return;
  }
  function seguir() { mostrar(frasePara(video.currentTime)); if (!video.paused) requestAnimationFrame(seguir); }
  function estado() {
    var pausado = video.paused;
    boton.setAttribute("aria-pressed", pausado ? "true" : "false");
    boton.textContent = pausado ? "Reproducir" : "Pausar";
    raiz.classList.toggle("andando", !pausado);
  }
  video.addEventListener("play", function () { estado(); requestAnimationFrame(seguir); });
  video.addEventListener("playing", function () { raiz.classList.add("andando"); });
  video.addEventListener("pause", estado);
  boton.addEventListener("click", function () { if (video.paused) video.play(); else video.pause(); });
  video.addEventListener("timeupdate", function () { mostrar(frasePara(video.currentTime)); });   // respaldo
  var intento = video.play();   // si el navegador no deja arrancar solo, queda el póster y el botón dice «Reproducir»
  if (intento && intento.catch) intento.catch(estado);
  estado();
  if (!video.paused) { raiz.classList.add("andando"); requestAnimationFrame(seguir); }   // ya arrancó antes que este script
})();
