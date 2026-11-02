/* El espacio reservado (ajuste de Carlos, 2-nov, registro «Lo abierto y lo reservado»).
   Nada dice «privado» ni «no se puede ver»: lo que pide suscripción se muestra con su forma y con una
   invitación que dice qué se gana. Las formas son inventadas: ningún dato real va en el dibujo.
   Tres variantes, según dónde aparece:
     velo     · un panel entero: la forma borrosa de lo que habría y una tarjeta de invitación;
     lista    · lo abierto se ve, y la lista sigue borrosa con «+ 21 comunas y 300 puestos más»;
     insignia · una etiqueta «Suscripción» en una capa o un botón; al tocarla, una invitación corta. */
(function () {
  const R = (CL.reservado = {});
  // Números seudoaleatorios fijos: la forma no cambia entre visitas y no sale de ningún dato.
  const azar = (semilla) => { let x = semilla * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
  const esc = (s) => CL.esc(s);
  const sello = '<span class="sello sus">Análisis por suscripción</span>';
  const botones = (sec) => `<div class="bts"><button type="button" class="boton primario chico" data-abrir="planes">Ver los planes</button>${sec || ""}</div>`;

  /* Formas inventadas: «recta» (franjas sobre un eje), «filas» (nombre y cifra), «barras». */
  function forma(tipo, n, semilla) {
    const r = azar(semilla || 7);
    if (tipo === "recta") return Array.from({ length: n }, (_, i) => {
      const lo = 8 + r() * 50 - i * 4, w = 8 + r() * 22;
      return `<div class="fl"><span class="nm" style="width:${55 + r() * 40}%"></span><span class="pi"><span class="br${i === 0 ? " uno" : ""}" style="left:${Math.max(2, lo)}%;width:${w}%"></span></span></div>`;
    }).join("");
    if (tipo === "barras") return Array.from({ length: n }, () => `<div class="fl"><span class="nm" style="width:${50 + r() * 45}%"></span><span class="pi"><span class="br" style="left:0;width:${20 + r() * 75}%"></span></span></div>`).join("");
    return Array.from({ length: n }, () => `<li><span class="nm" style="width:${40 + r() * 50}%"></span><span class="nm" style="width:${55 + r() * 40}%;justify-self:end"></span></li>`).join("");
  }

  /* velo: { titulo, valor: [..], forma: "recta"|"barras", filas, ejemplo: url } */
  R.velo = (o) => `<div class="res res-velo"><div class="res-forma" aria-hidden="true">${forma(o.forma || "recta", o.filas || 9, o.semilla)}</div>
    <div class="res-tarjeta">${sello}<h3>${esc(o.titulo)}</h3><ul>${o.valor.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>
      ${botones(o.ejemplo ? `<a class="boton chico" href="${o.ejemplo}">Ver un ejemplo</a>` : "")}</div></div>`;

  /* lista: { mas: "21 comunas y 300 puestos más", que: "con sus votos y su peso", filas } */
  R.lista = (o) => `<div class="res res-lista"><ul class="fantasma" aria-hidden="true">${forma("filas", o.filas || 5, o.semilla)}</ul>
    <div class="res-mas"><p><b>+ ${esc(o.mas)}</b> ${esc(o.que || "")}</p><div class="fila-sus">${sello}${botones()}</div></div></div>`;

  /* insignia: la etiqueta que va en una capa, un botón o una ficha del mapa */
  R.insignia = () => '<span class="sus-chip">Suscripción</span>';

  /* La invitación corta que sale al tocar algo con insignia. */
  let t;
  R.invitar = (o) => {
    let el = document.getElementById("invita");
    if (!el) { el = document.createElement("div"); el.id = "invita"; el.className = "invita"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Análisis por suscripción"); document.body.appendChild(el); }
    el.innerHTML = `<div class="t">${sello}<button type="button" class="icob" data-cerrar-invita aria-label="Cerrar"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <b>${esc(o.titulo)}</b><p>${esc(o.valor)}</p>${botones()}`;
    requestAnimationFrame(() => el.classList.add("ver"));
    clearTimeout(t); t = setTimeout(() => el.classList.remove("ver"), 7000);
  };
  R.cerrarInvita = () => { const el = document.getElementById("invita"); if (el) el.classList.remove("ver"); };
  document.addEventListener("click", (e) => { if (e.target.closest("[data-cerrar-invita]") || e.target.closest("#invita [data-abrir]")) R.cerrarInvita(); });
})();
