/* La cifra de probabilidad en tres formas (encargo 2026-11-02, pieza 3). Todas siguen el lenguaje de los
   datos: probabilidad entera, en frecuencia («34 de cada 100»), el rango primero, los empates como empates.
   CL.cifra(el, escenario, forma, seleccionado, alTocar) pinta la forma 1, 2 o 3 en el elemento. */
(function () {
  const TOPE = 0.5;   // la misma escala en los dos escenarios: al cambiar, nada salta de tamaño
  const ent = (x) => Math.round(x * 100);
  const NB = " ";
  const rango = ([lo, hi]) => (hi < 0.02 ? `menos de 2${NB}%` : `${ent(lo)} a ${ent(hi)}${NB}%`);
  const rangoTxt = ([lo, hi]) => (hi < 0.02 ? `menos de 2${NB}%` : `de ${ent(lo)} a ${ent(hi)}${NB}%`);
  const letra = (id) => id.replace("Aspirante ", "");
  const lista = (ids) => (ids.length === 1 ? ids[0] : ids.slice(0, -1).join(", ") + " y " + ids[ids.length - 1]);
  const NUM = ["", "uno", "los dos", "los tres", "los cuatro", "los cinco", "los seis"];

  /* Grupos: mismo valor y mismo rango = el modelo no los distingue. El voto en blanco va aparte y al final. */
  CL.grupos = function (esc) {
    const g = new Map();
    for (const a of esc.aspirantes) {
      const k = a.blanco ? "blanco" : a.p.toFixed(4) + "|" + a.rango.map((r) => r.toFixed(4)).join();
      if (!g.has(k)) g.set(k, { ids: [], p: a.p, rango: a.rango, blanco: a.blanco });
      g.get(k).ids.push(a.id);
    }
    const out = [...g.values()].sort((a, b) => (a.blanco - b.blanco) || b.p - a.p);
    let primerEmpate = true;
    for (const x of out) {
      x.lider = !x.blanco && x.ids.length === 1 && x.ids[0] === esc.favorito;
      x.empate = !x.blanco && x.ids.length > 1;
      // Solo lleva color de contraste el primer empate: es del que habla la frase.
      x.destacado = x.lider || (x.empate && primerEmpate);
      if (x.empate) primerEmpate = false;
    }
    return out;
  };

  /* La frase que contesta «¿hay favorito?». */
  CL.respuesta = function (esc) {
    const gs = CL.grupos(esc).filter((g) => !g.blanco);
    const lider = gs.find((g) => g.lider);
    if (lider) {
      const atras = gs[1];
      return `Sí: ${lider.ids[0]} encabeza. Gana en ${ent(lider.p)} de cada 100 simulaciones (${rangoTxt(lider.rango)}). ` +
        (atras.ids.length > 1 ? `Detrás, ${lista(atras.ids.map(letra))} empatan, con ${ent(atras.p)} cada uno.` : `Detrás, ${atras.ids[0]}, con ${ent(atras.p)}.`);
    }
    const e = gs[0];
    return `No: ${lista(e.ids.map(letra))} empatan. Cada uno gana en ${ent(e.p)} de cada 100 simulaciones (${rangoTxt(e.rango)}); el modelo no los distingue.`;
  };

  const boton = (id, sel, blanco) => blanco
    ? `<span class="nom blanco">${CL.esc(id)}</span>`
    : `<button type="button" class="nom" data-asp="${CL.esc(id)}" aria-current="${id === sel}" aria-haspopup="dialog">${CL.esc(id)}</button>`;
  // La fila entera también abre la ficha cuando es de una sola persona (en un empate, el toque va al nombre).
  const uno = (g) => (!g.blanco && g.ids.length === 1 ? ` data-uno="${CL.esc(g.ids[0])}" style="cursor:pointer"` : "");
  const x = (v) => Math.max(0, Math.min(100, (v / TOPE) * 100));

  /* 1 · La recta */
  function recta(gs, sel) {
    const rej = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => `<i style="left:${x(t)}%"></i>`).join("");
    return `<div class="forma"><div class="eje-t" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50${NB}%</span></div>
      <div class="recta"><div class="rej" aria-hidden="true">${rej}</div>${gs.map((g) => {
        const cls = g.lider ? " lider" : g.empate && g.destacado ? " empate" : "";
        const frec = g.blanco ? `menos de 2 de cada 100` : g.ids.length > 1 ? `<b>${ent(g.p)}</b> de cada 100, cada uno` : `<b>${ent(g.p)}</b> de cada 100`;
        const corto = g.rango[1] - g.rango[0] < 0.07;   // franja angosta: las cifras del rango van afuera
        return `<div class="fila${cls}"${uno(g)}><div class="nombres">${g.ids.map((id) => boton(id, sel, g.blanco)).join("")}${g.empate ? `<span class="emp">empatados</span>` : ""}</div>
          <div class="pista-r" aria-hidden="true"><span class="franja" style="left:${x(g.rango[0])}%;width:${Math.max(1.4, x(g.rango[1]) - x(g.rango[0]))}%">${g.blanco ? "" : `<span class="lo">${ent(g.rango[0])}</span><span class="hi">${ent(g.rango[1])}</span>`}<span class="pt" style="left:${((g.p - g.rango[0]) / Math.max(1e-6, g.rango[1] - g.rango[0])) * 100}%"></span></span></div>
          <p class="frec">${frec}${g.blanco ? "" : ` · ${rangoTxt(g.rango)}`}</p></div>`;
      }).join("")}</div>
      <p class="fuente">Un solo eje para todos, de 0 a 50${NB}%. La franja es el rango del modelo y la raya, su media. Donde las franjas coinciden, el modelo no distingue.</p></div>`;
  }

  /* 2 · Las cien simulaciones */
  function cien(gs, sel) {
    let cuadros = "";
    const ley = gs.map((g) => {
      const n = g.blanco ? 1 : Math.round(g.p * 100) * g.ids.length;
      const cl = g.lider ? "g1" : g.destacado ? "g2" : g.blanco ? "" : "g3";
      cuadros += `<i class="${cl}"></i>`.repeat(n);
      const color = cl === "g1" ? "var(--foco)" : cl === "g2" ? "var(--contraste)" : cl === "g3" ? "var(--resto)" : "var(--resto-2)";
      const v = g.blanco ? `<b>menos de 2</b><span>de cada 100</span>`
        : g.ids.length > 1 ? `<b>${n}</b> de cada 100<span>entre ${NUM[g.ids.length]}: ${ent(g.p)} cada uno, ${rangoTxt(g.rango)}</span>`
        : `<b>${n}</b> de cada 100<span>${rangoTxt(g.rango)}</span>`;
      return `<li${uno(g)}><i class="m" style="background:${color}"></i><span>${g.ids.map((id) => boton(id, sel, g.blanco)).join(" · ")}${g.empate ? ` <span class="sem igual" style="font-size:10.5px">empatados</span>` : ""}</span><span class="v">${v}</span></li>`;
    }).join("");
    return `<div class="forma"><div class="cien" role="img" aria-label="Cien simulaciones, agrupadas por quién gana">${cuadros}</div>
      <ul class="cien-ley">${ley}</ul>
      <p class="fuente">Cada cuadro es una de cada cien simulaciones, del color de quien gana en ella. Los empatados comparten un solo bloque: el modelo no sabe cuál de ellos se queda con cada cuadro.</p></div>`;
  }

  /* 3 · El marcador */
  function marcador(gs, sel) {
    return `<div class="forma"><div class="marcador">${gs.map((g) => {
      const r = g.blanco ? "Voto en blanco" : g.lider ? "Encabeza" : g.empate ? "Empatados: el modelo no los distingue" : "Detrás";
      return `<div class="nivel${g.lider ? " lider" : ""}${g.empate ? " emp" : ""}${g.destacado ? " dest" : ""}"><span class="r">${r}</span>
        <div class="fila-m"${uno(g)}><span>${g.ids.map((id) => boton(id, sel, g.blanco)).join(" · ")}</span><span class="rg">${g.blanco ? `<small>${rango(g.rango)}</small>` : rango(g.rango)}</span>
        <span class="fq">${g.blanco ? "" : `gana en ${ent(g.p)} de cada 100 simulaciones${g.ids.length > 1 ? ", cada uno" : ""}`}</span></div></div>`;
    }).join("")}</div>
      <p class="fuente">Solo cifras. La grande es el rango de la probabilidad de ganar; debajo, la media dicha en simulaciones. Las líneas separan lo que el modelo sí distingue.</p></div>`;
  }

  CL.FORMAS = { 1: "La recta", 2: "Las cien simulaciones", 3: "El marcador" };
  CL.cifra = function (el, esc, forma, sel, alTocar) {
    const gs = CL.grupos(esc);
    el.innerHTML = forma === 2 ? cien(gs, sel) : forma === 3 ? marcador(gs, sel) : recta(gs, sel);
    if (alTocar) el.onclick = (e) => {
      const b = e.target.closest("[data-asp]") || e.target.closest("[data-uno]");
      if (b) alTocar(b.dataset.asp || b.dataset.uno, b.dataset.asp ? b : b.querySelector("[data-asp]"));
    };
  };
})();
