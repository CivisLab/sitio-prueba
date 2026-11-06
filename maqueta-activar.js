// CivisLab: la maqueta 3D de Montería en la portada. La imagen hace de póster; al tocarla, la página de la maqueta
// carga en su lugar. Antes de eso no se baja nada de la maqueta. Sin WebGL, se queda la imagen y su enlace.
(function () {
  "use strict";
  var fig = document.querySelector(".maqueta-3d");
  var poster = fig && fig.querySelector(".maqueta-poster");
  if (!poster) return;
  function hayGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (x) { return false; }
  }
  if (!hayGL()) { fig.classList.add("sin-gl"); return; }
  poster.addEventListener("click", function (ev) {
    ev.preventDefault();
    var marco = document.createElement("iframe");
    marco.className = "maqueta-marco";
    marco.title = "Maqueta 3D de Montería: gírela, acérquela y recorra sus zonas";
    marco.src = poster.getAttribute("href");
    marco.style.backgroundImage = "url(" + JSON.stringify(poster.querySelector("img").currentSrc || poster.querySelector("img").src) + ")";
    fig.classList.add("activa");
    poster.replaceWith(marco);
    marco.focus();
  });
})();
