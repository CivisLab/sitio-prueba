/* Estratega como un solo entorno · prototipo (Diseño, encargo 2026-11-02).
   Una sola pantalla: la barra lateral cambia de herramienta y de capa, el mapa y el territorio se quedan.
   Cifras simuladas y aspirantes inventados; la única persona real es Carlos (Concejo 2019). */
(function () {
  const E = window.ESTUDIO, G = window.COMUNAS, A = window.ATLAS, F = window.FICHA, P = window.PERFILES;
  const $ = (s) => document.querySelector(s);
  const NB = " ";
  const PLANES = ["libre", "profesional", "personalizado"];
  const NPLAN = { libre: "Libre", profesional: "Profesional", personalizado: "Personalizado" };
  const alcanza = (plan) => PLANES.indexOf(S.plan) >= PLANES.indexOf(plan);
  const fecha = (iso) => { const [y, m, d] = iso.split("-"); return `${+d}-${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][m - 1]}-${y}`; };
  const pct = (x) => CL.n(Math.round(x * 100)) + NB + "%";
  const sinTilde = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /* ── Íconos (trazo, 24 px) ── */
  const ICO = {
    estudio: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6" rx="1"/><rect x="10.5" y="7" width="3" height="10" rx="1"/><rect x="15.5" y="4" width="3" height="13" rx="1"/>',
    atlas: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
    pulso: '<path d="M3 12h3l2.5-6 4 12 3-9 2 3H21"/>',
    taller: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 3.5h6v3H9zM8.5 12h7M8.5 16h5"/>',
    cuenta: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>',
    config: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    salir: '<path d="M14 4.5h4.5v15H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    plegar: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9 4.5v15"/>',
    buscar: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    enlace: '<path d="M13.5 5.5h5v5"/><path d="m18.5 5.5-8 8"/><path d="M16.5 14v4.5h-11v-11H10"/>',
    toque: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="7"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    pausa: '<path d="M8 5.5v13M16 5.5v13"/>',
    guardar: '<path d="M6.5 4.5h11v15l-5.5-4-5.5 4z"/>',
    comparar: '<rect x="3.5" y="5" width="7" height="14" rx="1.5"/><rect x="13.5" y="5" width="7" height="14" rx="1.5"/>',
    plan: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
  };
  const ico = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;

  /* ── Las herramientas y sus capas ── */
  const CORTO = { imcv15: "Condiciones de vida (IMCV)", cuidados_no_satisfechos: "Sin atención médica", contaminacion_aire: "Contaminación del aire", vias_buen_estado: "Vías en buen estado" };
  const PREG = {
    imcv15: (a) => `¿Cómo están las condiciones de vida por comuna en ${a}?`,
    cuidados_no_satisfechos: () => "¿Dónde se quedó más gente sin atención médica?",
    contaminacion_aire: () => "¿Dónde se quejan más los hogares del aire?",
    vias_buen_estado: () => "¿Dónde califican mejor las vías?",
  };
  const HERR = [
    { id: "estudio", n: "Estudio de Probabilidad Electoral", corto: "Estudio", sub: "Modelo IPET · con el Cerebro",
      capas: [{ id: "p27", n: "Probabilidad 2027", plan: "personalizado" }, { id: "cerebro", n: "Cerebro · quién se ha presentado", plan: "libre" }] },
    { id: "atlas", n: "Análisis Territorial Multidimensional Integrado", corto: "Atlas", sub: "Modelo Atlas",
      capas: A.indicadores.map((i) => ({ id: i.clave, n: CORTO[i.clave], plan: "libre" })) },
    { id: "pulso", n: "Escucha Social Inteligente", corto: "Pulso", sub: "Modelo Pulso", pronto: true, capas: [] },
    { id: "taller", n: "Taller de Opinión", corto: "Taller", sub: "Encuestas y grupos focales", pronto: true, capas: [] },
  ];
  const herr = (id) => HERR.find((h) => h.id === id);
  /* Lo que se gana con la suscripción, dicho como valor (ajuste de Carlos, 2-nov). Sin nombrar el plan:
     qué plan abre los escenarios 2027 está por decidir (registro del 2-nov). */
  const RES = CL.reservado;
  const INV = {
    p27: { titulo: "Quién encabeza en 2027, y con cuánta duda", forma: "recta", ejemplo: "cifra.html", valor: ["La probabilidad de ganar de cada aspirante, con su rango", "Los empates, dichos como empates", "Dónde sacaría sus votos cada uno, comuna por comuna", "Cuánto ha acertado el modelo, en la misma pantalla"] },
    cruzar: { titulo: "Cruzar el Estudio con Atlas", valor: "Un punto en cada comuna con lo que dice Atlas: la votación y la calidad de vida, juntas." },
    guardar: { titulo: "Su informe, listo para el cliente", valor: "Junte mapa, frase y cifra, y descárguelo en PDF con su marca de agua." },
    comparar: { titulo: "Comparar dos territorios", valor: "Dos comunas o dos municipios lado a lado, en la misma escala." },
    capa: (c) => ({ titulo: c.n, valor: "Esta capa va en el análisis por suscripción." }),
  };
  const IND = Object.fromEntries(A.indicadores.map((i) => [i.clave, i]));
  const NOMBRE = Object.fromEntries(G.features.map((f) => [f.properties.cod, f.properties.nombre]));
  const FID = Object.fromEntries(G.features.map((f) => [f.properties.cod, f.id]));
  const CARLOS = "Carlos Calle Galvis";

  /* ── Estado: vive en la dirección, como pide el spec (§4.1) ── */
  const h0 = new URLSearchParams(location.hash.slice(1)), q0 = new URLSearchParams(location.search);
  const S = {
    h: h0.get("h") || "estudio",
    capa: h0.get("capa") || "p27",
    esc: h0.get("esc") === "2" ? 1 : 0,
    sel: h0.get("asp") || "Aspirante A",
    ficha: h0.get("ficha") === "1",
    comuna: h0.get("t") || null,
    anio: +(h0.get("anio") || 2024),
    cruzar: h0.get("cruzar") === "1",
    forma: +(q0.get("forma") || h0.get("forma") || 1),
    plan: q0.get("plan") || h0.get("plan") || "personalizado",
    plegado: h0.get("plegado") === "1",
  };
  if (!herr(S.h)) S.h = "estudio";
  if (!PLANES.includes(S.plan)) S.plan = "personalizado";
  if (![1, 2, 3].includes(S.forma)) S.forma = 1;
  function guardarEstado() {
    const u = new URLSearchParams({ h: S.h, capa: S.capa });
    if (S.h === "estudio") { u.set("esc", S.esc + 1); if (S.sel) u.set("asp", S.sel); if (S.ficha) u.set("ficha", "1"); if (S.cruzar) u.set("cruzar", "1"); }
    if (S.capa === "imcv15") u.set("anio", S.anio);
    if (S.comuna) u.set("t", S.comuna);
    u.set("forma", S.forma); u.set("plan", S.plan);
    if (S.plegado) u.set("plegado", "1");
    history.replaceState(null, "", location.pathname + location.search + "#" + u.toString());
  }

  const app = $("#app");
  let map = null, pintarEtiquetas = () => {}, ultimoDisparador = null;

  /* ══ Barra lateral ══ */
  function renderLado() {
    const cuerpo = HERR.map((h) => {
      const activa = h.id === S.h;
      const capas = h.capas.map((c) => `<li><button type="button" class="capa" data-capa="${c.id}" aria-pressed="${activa && S.capa === c.id}">${CL.esc(c.n)}${alcanza(c.plan) ? "" : RES.insignia()}</button></li>`).join("");
      const cruzar = h.id === "estudio" ? `<li class="cruzar-caja"><label class="cruzar"><input type="checkbox" data-cruzar ${S.cruzar && alcanza("profesional") ? "checked" : ""}> Cruzar con Atlas${alcanza("profesional") ? "" : RES.insignia()}</label></li>` : "";
      return `<div class="herr" aria-current="${activa}"><button type="button" class="herr-b" data-h="${h.id}" aria-expanded="${activa}">
          <span class="ic">${ico(h.id)}</span><span class="n"><span class="largo">${h.n}</span><span class="corto">${h.corto}</span><small>${h.sub}</small></span>${h.pronto ? '<span class="pronto">Pronto</span>' : ""}</button>
          ${h.capas.length ? `<ul class="capas">${capas ? `<li class="capa-sep">Capas</li>` + capas : ""}${cruzar}</ul>` : ""}</div>`;
    }).join("");
    $("#ladoCuerpo").innerHTML = `<p class="lado-t">Herramientas</p><nav aria-label="Herramientas">${cuerpo}</nav>`;
    $("#ladoPie").innerHTML = `${tarjetaPlan()}
      <button type="button" class="fila-b" data-abrir="config">${ico("config")}<span>Configuración</span></button>
      <div class="yo"><button type="button" class="av" data-abrir="cuenta" aria-label="Cuenta">CC</button><span class="q"><b>Carlos Calle</b><span>carlos@ejemplo.co</span></span>
        <button type="button" class="icob" data-salir title="Salir" aria-label="Salir">${ico("salir")}</button></div>`;
  }
  function tarjetaPlan() {
    const txt = { libre: "Histórico electoral, Atlas y Domicilio.", profesional: "Además: cruzar herramientas, el Cerebro por comuna y el informe.", personalizado: "Escenarios 2027 de Medellín, hasta el 31-oct-2027." }[S.plan];
    return `<div class="plan ${S.plan}"><span class="t">${ico("plan")} Su plan</span><b title="${txt}">${NPLAN[S.plan]}</b>
      ${S.plan === "libre" ? `<p>${txt}</p><button type="button" class="boton primario chico" data-abrir="planes">Pasar a Profesional</button>` : `<button type="button" class="boton chico" data-abrir="planes">Ver planes</button>`}</div>`;
  }

  /* Barra de abajo (celular) y fichas de capas sobre el mapa (celular y barra plegada) */
  function renderAbajo() {
    $("#abajo").innerHTML = HERR.map((h) => `<button type="button" data-h="${h.id}" aria-current="${h.id === S.h}">${ico(h.id)}<span>${h.corto}</span>${h.pronto ? '<span class="pr">Pronto</span>' : ""}</button>`).join("")
      + `<button type="button" data-abrir="cuenta">${ico("cuenta")}<span>Cuenta</span></button>`;
    const h = herr(S.h);
    $("#chips").innerHTML = h.capas.map((c) => `<button type="button" class="chip" data-capa="${c.id}" aria-pressed="${S.capa === c.id}">${CL.esc(c.n)}${alcanza(c.plan) ? "" : RES.insignia()}</button>`).join("");
  }

  /* ══ Arriba: el territorio y Domicilio ══ */
  function renderMigas() {
    $("#migas").innerHTML = `<button type="button" data-terr="antioquia">Antioquia</button><span class="sep">›</span>`
      + `<button type="button" data-terr="medellin" aria-current="${!S.comuna}">Medellín</button>`
      + (S.comuna ? `<span class="sep">›</span><button type="button" aria-current="true">${CL.esc(NOMBRE[S.comuna])}</button>` : "");
    $("#volver").hidden = !S.comuna;
  }
  function domicilio() {
    const inp = $("#buscar"), sug = $("#sug");
    const lugares = G.features.map((f) => ({ cod: f.properties.cod, n: f.properties.nombre, t: f.properties.tipo, k: sinTilde(f.properties.nombre) }));
    let act = 0, res = [];
    const pintar = () => {
      const q = sinTilde(inp.value.trim());
      if (!q) { sug.hidden = true; return; }
      res = lugares.filter((l) => l.k.includes(q)).slice(0, 8);
      act = 0;
      sug.innerHTML = res.length ? res.map((l, i) => `<li><button type="button" data-cod="${l.cod}" aria-selected="${i === act}">${CL.esc(l.n)}<span>${l.t === "corregimiento" ? "Corregimiento" : "Comuna"}</span></button></li>`).join("")
        : `<li class="nada">No encontramos ese lugar. Pruebe con el nombre de la comuna o del corregimiento. (En la primera versión, también barrios y puestos.)</li>`;
      sug.hidden = false;
    };
    inp.addEventListener("input", pintar);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); act = (act + (e.key === "ArrowDown" ? 1 : -1) + res.length) % Math.max(1, res.length); sug.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-selected", i === act)); }
      if (e.key === "Enter" && res[act]) { ir(res[act].cod); }
      if (e.key === "Escape") { sug.hidden = true; inp.blur(); }
    });
    sug.addEventListener("click", (e) => { const b = e.target.closest("[data-cod]"); if (b) ir(b.dataset.cod); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".buscar")) sug.hidden = true; });
    function ir(cod) { inp.value = ""; sug.hidden = true; inp.blur(); elegirComuna(cod); }
  }

  /* ══ Panel derecho ══ */
  function renderDer() {
    const h = herr(S.h), c = h.capas.find((x) => x.id === S.capa);
    let html;
    if (h.pronto) html = derPronto(h);
    else if (c && !alcanza(c.plan)) html = derReservado(h, c);
    else if (S.capa === "p27") html = derP27();
    else if (S.capa === "cerebro") html = derCerebro();
    else html = derAtlas(IND[S.capa]);
    const vista = S.h + "|" + S.capa, der = $("#der");
    der.innerHTML = `<div class="der-in">${html}</div>`;
    if (der.dataset.vista !== vista) { der.scrollTop = 0; der.dataset.vista = vista; }   // otra vista empieza arriba; la misma, no se mueve
    if (S.capa === "p27" && !h.pronto && alcanza("personalizado")) {
      CL.cifra($("#cifra"), E.escenarios[S.esc], S.forma, S.sel, (id, b) => tocarAspirante(id, b));
      $("#acierto").innerHTML = Array.from({ length: E.acierto[1] }, (_, i) => `<i class="${i < E.acierto[0] ? "si" : ""}"></i>`).join("");
    }
  }
  const comunaSel = (cuerpo) => S.comuna ? `<div class="comuna-sel"><span class="t">${CL.esc(NOMBRE[S.comuna])}<button type="button" class="boton chico" data-volver>← Medellín</button></span>${cuerpo}</div>` : "";

  function derP27() {
    const esc = E.escenarios[S.esc], parte = E.comunas.find((p) => p.cod === S.comuna);
    const DESC = ["Supuesto base: A compite con la etiqueta que hoy se le conoce.", "Un solo supuesto cambia: A compite con otra etiqueta, que hoy no existe."];
    let enComuna = "";
    if (S.comuna) {
      const s = S.sel && S.sel !== CARLOS ? S.sel : null;
      enComuna = S.esc !== 0 ? "<p>El reparto por comuna se corrió solo con el escenario 1.</p>"
        : !parte ? "<p>Sin dato para este corregimiento en el escenario simulado.</p>"
        : s ? `<p>${CL.esc(s)} sacaría ${pct(parte.c[s][0])} de los votos aquí (votación esperada). Es el más votado en ${CL.n(Math.round(parte.c[s][1] * 100))} de cada 100 simulaciones.</p>` : "<p>Toque un aspirante para ver su votación aquí.</p>";
    }
    return `<div><p class="herr-t">Estudio de Probabilidad Electoral · Probabilidad 2027</p></div>
      <div class="sellos"><span class="sello alerta">Cifras simuladas</span><span class="sello">Aspirantes inventados</span><span class="sello">Alcaldía · Medellín</span></div>
      <h2>¿Hay un favorito para la Alcaldía de Medellín?</h2>
      <p class="respuesta">${CL.esc(CL.respuesta(esc))}</p>
      <div class="bloque"><div class="toggle" role="group" aria-label="Escenario"><button type="button" data-esc="0" aria-pressed="${S.esc === 0}">Escenario 1</button><button type="button" data-esc="1" aria-pressed="${S.esc === 1}">Escenario 2</button></div>
        <p class="fuente">${DESC[S.esc]}</p></div>
      ${comunaSel(enComuna)}
      <div class="bloque"><h3>Probabilidad de ganar · forma ${S.forma}: ${CL.FORMAS[S.forma]}</h3><div id="cifra"></div>
        <p class="pista">${ico("toque")} Toque un nombre o su fila para abrir la ficha. El mapa se queda donde está.</p></div>
      <div class="bloque"><h3>Cuánto confiar</h3><p><b>El modelo acertó ${E.acierto[0]} de ${E.acierto[1]} carreras ya ocurridas.</b></p><div class="acierto" id="acierto" aria-hidden="true"></div>
        <p class="fuente">Cada punto es una alcaldía ya elegida; lleno, donde el favorito del modelo ganó. Sellado el ${fecha(E.sello_fecha)}, antes de la elección. Todo simulado.</p></div>
      <p class="aviso-ley"><b>Escenario bajo supuestos declarados; no es pronóstico ni encuesta.</b> Las cifras son simuladas para mostrar el diseño. Con aspirantes reales, va dentro de la suscripción, después de entrar y aceptar las condiciones (Ley 2494).</p>
      <details class="mas"><summary>Lo que esto no dice</summary><div class="no-decir"><ul>
        <li>No dice quién va a ganar: es la probabilidad bajo unos supuestos. Si cambia un supuesto, cambia la carrera.</li>
        <li>No usa encuestas, redes ni el tono de la conversación.</li>
        <li>Los aspirantes sin historia en la ciudad reciben el mismo reparto en todas las comunas.</li></ul></div></details>`;
  }

  function derCerebro() {
    const c = F.candidaturas[0];
    let enComuna = "";
    if (S.comuna) {
      const v = c.comunas[S.comuna];
      enComuna = S.sel !== CARLOS ? "<p>Toque una persona para ver sus votos aquí.</p>"
        : !alcanza("profesional") ? `<p>Sus votos en esta comuna van en el análisis por suscripción.</p>`
        : !v ? "<p>Sin dato.</p>"
        : `<p>${CL.n(v.votos)} votos de ${CL.n(v.validos)} válidos al Concejo (${CL.n(v.pct, v.pct < 1 ? 2 : 1)}${NB}%).${v.validos < F.base_pequena ? ` <span class="sem poca">Muestra pequeña</span>` : ""}</p>`;
    }
    return `<div><p class="herr-t">Estudio de Probabilidad Electoral · Cerebro</p></div>
      <h2>¿Quién se ha presentado en Medellín?</h2>
      <p class="ref">El Cerebro junta las candidaturas desde 2000, con sus votos por puesto. En el prototipo hay una sola ficha real: la que ya está en sitio-prueba.</p>
      ${comunaSel(enComuna)}
      <div class="bloque"><h3>Concejo de Medellín · 2019</h3>
        <button type="button" class="persona" data-persona="${CARLOS}" aria-current="${S.sel === CARLOS}" aria-haspopup="dialog"><span class="av">CC</span><span class="q"><b>${CARLOS}</b><span>${CL.n(c.votos)} votos · ${CL.n(c.votos / c.validos_ciudad * 100, 2)}${NB}% de los válidos de la ciudad</span></span></button>
        <p class="fuente">Las demás personas llegan con el contrato de candidatos del IPET. Toque la fila para abrir la ficha: el mapa pinta dónde sacó sus votos.</p></div>
      ${alcanza("profesional") ? "" : `<div class="bloque"><h3>Por comuna y puesto</h3>${RES.lista({ mas: `21 comunas y ${CL.n(c.puestos.length)} puestos más`, que: "con los votos de cada persona y su peso en cada lugar.", semilla: 3 })}</div>`}
      <details class="mas"><summary>Lo que esto no dice</summary><div class="no-decir"><ul>${F.advertencias.map((t) => `<li>${CL.esc(t)}</li>`).join("")}</ul></div></details>`;
  }

  /* Atlas: semáforo por margen de error (la regla del tablero de Atlas) */
  function juicio(ind, v) {
    if (ind.ciudad == null || v.hogares == null) return null;
    if (v.hogares < A.muestra_minima) return { s: "poca" };
    const q = v.valor / 100, e = 1.96 * Math.sqrt((q * (1 - q)) / v.hogares) * 100, d = v.valor - ind.ciudad;
    if (Math.abs(d) <= e) return { s: "igual", e, d };
    const mejor = ind.sentido === "mas_es_mejor" ? d > 0 : d < 0;
    return { s: mejor ? "bien" : "mal", e, d };
  }
  const valorAnio = (v, anio) => (v.serie ? (v.serie.find((s) => s.anio === anio) || {}).valor : v.valor);
  function derAtlas(ind) {
    const cab = `<div><p class="herr-t">Análisis Territorial · Atlas</p></div><h2>${PREG[ind.clave](S.anio)}</h2>`;
    const sel = S.comuna && ind.valores.find((v) => v.cod === S.comuna);
    if (ind.clave === "imcv15") {
      const filas = ind.valores.map((v) => ({ v, x: valorAnio(v, S.anio) })).filter((r) => r.x != null).sort((a, b) => b.x - a.x);
      const enC = sel ? `<p>Índice ${CL.n(valorAnio(sel, S.anio), 1)} en ${S.anio} (de 0 a 100; más alto es mejor).</p>` : "";
      return `${cab}<p class="respuesta">Más alto en ${CL.esc(filas[0].v.nombre)} (${CL.n(filas[0].x, 1)}) y más bajo en ${CL.esc(filas[filas.length - 1].v.nombre)} (${CL.n(filas[filas.length - 1].x, 1)}).</p>
        ${comunaSel(enC)}
        <div class="bloque"><h3>Ordenado por el índice de ${S.anio}</h3><div class="bloques"><ul>${filas.map((r) => `<li><button type="button" data-comuna="${r.v.cod}" aria-current="${r.v.cod === S.comuna}"><span>${CL.esc(r.v.nombre)}</span><b>${CL.n(r.x, 1)}</b></button></li>`).join("")}</ul></div>
        <p class="fuente">Sin margen publicado: aquí no hay semáforo. ${CL.esc(ind.nota)}</p></div>
        <p class="fuente">${CL.esc(ind.fuente)}</p>
        <details class="mas"><summary>Lo que esto no dice</summary><div class="no-decir"><ul>${ind.no_se_puede_decir.map((t) => `<li>${CL.esc(t)}</li>`).join("")}</ul></div></details>`;
    }
    const js = ind.valores.map((v) => ({ v, j: juicio(ind, v) }));
    const cuenta = (s) => js.filter((r) => r.j && r.j.s === s);
    const peor = cuenta("mal"), igual = cuenta("igual"), mejor = cuenta("bien");
    const lista = (arr, vac) => arr.length ? `<ul>${arr.sort((a, b) => b.v.valor - a.v.valor).map((r) => `<li><button type="button" data-comuna="${r.v.cod}" aria-current="${r.v.cod === S.comuna}"><span>${CL.esc(r.v.nombre)}</span><b>${CL.n(r.v.valor)}${NB}%</b></button></li>`).join("")}</ul>` : `<p class="vacio-b">${vac}</p>`;
    let enC = "";
    if (sel) {
      const j = juicio(ind, sel);
      enC = `<p>${CL.n(sel.valor)}${NB}% frente a ${CL.n(ind.ciudad)}${NB}% de Medellín, con ${CL.n(sel.hogares)} hogares. ${j.s === "poca" ? '<span class="sem poca">Muestra pequeña</span>' : `Margen ±${CL.n(j.e, 1)} puntos (95${NB}%). <span class="sem ${j.s}">${{ bien: "Mejor que Medellín", igual: "No se distingue", mal: "Peor que Medellín" }[j.s]}</span>`}</p>`;
    }
    const cu = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
    return `${cab}<p class="respuesta">${cu(peor.length, "comuna está", "comunas están")} peor que Medellín (${CL.n(ind.ciudad)}${NB}%), ${cu(igual.length, "no se distingue", "no se distinguen")} y ${cu(mejor.length, "está", "están")} mejor.</p>
      ${comunaSel(enC)}
      <div class="bloque"><h3>En tres bloques · ECV ${ind.anio}</h3><div class="bloques">
        <div><h4><span class="sem mal">Peor que Medellín</span></h4>${lista(peor, "Ninguna")}</div>
        <div><h4><span class="sem igual">No se distingue</span></h4>${lista(igual, "Ninguna")}</div>
        <div><h4><span class="sem bien">Mejor que Medellín</span></h4>${lista(mejor, "Ninguna")}</div></div>
        <p class="fuente">Dentro de «no se distingue» el orden no dice nada: la diferencia cabe en el margen de error de la encuesta.</p></div>
      <p class="fuente">${CL.esc(ind.fuente)}</p>
      <details class="mas"><summary>Lo que esto no dice</summary><div class="no-decir"><ul>${ind.no_se_puede_decir.map((t) => `<li>${CL.esc(t)}</li>`).join("")}</ul></div></details>`;
  }

  function derPronto(h) {
    const que = h.id === "pulso" ? "De qué se habla en el territorio y hacia dónde se mueve. Llega cuando su modelo salga de calibración."
      : "Llega cuando tenga su spec y la revisión de Jurídica.";
    return `<div><p class="herr-t">${h.n}</p></div><div class="sellos"><span class="pronto">Pronto</span></div><h2>${h.n}</h2>
      <p class="ref">${que}</p>
      <div class="vacio">Así se verá cuando exista: el mismo mapa, el mismo territorio (${CL.esc(S.comuna ? NOMBRE[S.comuna] : "Medellín")}) y su lectura en este panel, sin salir de Estratega.</div>`;
  }
  function derReservado(h, c) {
    const i = INV[c.id] || { titulo: c.n, valor: ["Esta capa, con su detalle por comuna"], forma: "barras" };
    return `<div><p class="herr-t">${h.n} · ${CL.esc(c.n)}</p></div>
      <h2>${c.id === "p27" ? "¿Hay un favorito para la Alcaldía de Medellín?" : CL.esc(c.n)}</h2>
      ${RES.velo(i)}`;
  }

  /* ══ Abajo: línea de tiempo ══ */
  let reproduciendo = null;
  function renderTiempo() {
    const h = herr(S.h);
    const acc = `<div class="acc">${["comparar", "guardar"].map((k) => {
      const ok = alcanza("profesional"), t = k === "comparar" ? "Comparar con otra" : "Guardar en el informe";
      return `<button type="button" class="boton chico" data-acc="${k}">${ico(k)}${t}${ok ? "" : RES.insignia()}</button>`;
    }).join("")}</div>`;
    let medio;
    if (h.pronto) medio = `<span class="lbl">Sin línea de tiempo hasta que llegue la herramienta</span>`;
    else if (S.h === "estudio") {
      const anios = [[2015, null], [2019, "cerebro"], [2023, null], [2027, "p27"]];
      medio = `<span class="lbl">Elección</span><div class="anios" role="group" aria-label="Elección">${anios.map(([a, c]) => `<button type="button" ${c ? `data-capa="${c}"` : 'disabled title="No está en el prototipo"'} aria-pressed="${S.capa === c}">${a === 2027 ? "2027 · escenarios" : a === 2019 ? "Concejo 2019" : a}</button>`).join("")}</div>`;
    } else if (S.capa === "imcv15") {
      const anios = IND.imcv15.valores[0].serie.map((s) => s.anio);
      medio = `<span class="lbl">Año</span><button type="button" class="icob" data-play aria-label="${reproduciendo ? "Pausar" : "Recorrer los años"}">${ico(reproduciendo ? "pausa" : "play")}</button><div class="anios" role="group" aria-label="Año">${anios.map((a) => `<button type="button" data-anio="${a}" aria-pressed="${S.anio === a}">${a}</button>`).join("")}</div><span class="lbl solo-mesa">sin 2020</span>`;
    } else medio = `<span class="lbl">Encuesta de Calidad de Vida</span><div class="anios"><button type="button" aria-pressed="true">${IND[S.capa].anio}</button></div>`;
    $("#tiempo").innerHTML = medio + (h.pronto ? "" : acc);
  }

  /* ══ El mapa ══ */
  const PASOS_E = [0.09, 0.18, 0.27, 0.36];         // votación esperada: la misma escala para todos
  const PASOS_C = [0.15, 0.25, 0.35, 0.45];         // % de los válidos de Carlos por comuna
  const clase = (v, pasos) => pasos.filter((k) => v > k).length + 1;
  const marcas = {};
  function pintarMapa() {
    if (!map) return;
    const gris = CL.css("--resto-2");
    let ley = "", nota = "", reservado = false;
    const inventado = (cod) => CL.css("--r" + (1 + ((+cod * 7 + 3) % 5)));   // forma inventada, no sale de ningún dato
    const est = {};
    const pon = (cod, o) => (est[cod] = Object.assign({ c: gris, poca: false, suave: false }, o));
    const h = herr(S.h), capa = h.capas.find((c) => c.id === S.capa);
    if (h.pronto) {
      nota = `${h.n} llega pronto. El mapa y el territorio se quedan: cuando llegue, se pinta aquí.`;
    } else if (capa && !alcanza(capa.plan)) {
      reservado = true;
      nota = "El mapa de esta capa va en el análisis por suscripción. La forma que se ve es inventada.";
    } else if (S.capa === "p27") {
      const s = S.sel && S.sel !== CARLOS ? S.sel : null;
      if (S.esc === 0 && s) {
        for (const p of E.comunas) pon(p.cod, { c: CL.css("--r" + clase(p.c[s][0], PASOS_E)) });
        ley = `<b>${CL.esc(s)} · votación esperada</b><span class="rampa">${[1, 2, 3, 4, 5].map((k) => `<i style="background:var(--r${k})"></i>`).join("")}</span><span>de 0 a 45${NB}%, la misma escala para todos · simulado</span>`;
        nota = `Dónde sacaría más votos ${s}. Geografía inventada para el diseño.`;
      } else nota = S.esc === 0 ? "Toque un aspirante para ver dónde sacaría sus votos." : "El reparto por comuna existe solo para el escenario 1: el mapa del escenario 2 queda en gris para no inventar.";
    } else if (S.capa === "cerebro") {
      if (S.sel === CARLOS && !alcanza("profesional")) {
        reservado = true;
        nota = "Dónde sacó sus votos, comuna por comuna, va en el análisis por suscripción. La forma que se ve es inventada.";
      } else if (S.sel === CARLOS) {
        const c = F.candidaturas[0].comunas;
        for (const cod in c) pon(cod, { c: CL.css("--r" + clase(c[cod].pct, PASOS_C)), poca: c[cod].validos < F.base_pequena });
        ley = `<b>${CARLOS} · Concejo 2019</b><span class="rampa">${[1, 2, 3, 4, 5].map((k) => `<i style="background:var(--r${k})"></i>`).join("")}</span><span>de 0 a 0,5${NB}% de los válidos</span><span><span class="sem poca">Muestra pequeña</span> menos de 5.000 válidos</span>`;
        nota = "Dónde sacó sus votos, por comuna, sobre los votos válidos al Concejo.";
      } else nota = "Toque una persona para ver dónde sacó sus votos.";
    } else {
      const ind = IND[S.capa];
      if (ind.clave === "imcv15") {
        const vs = ind.valores.map((v) => valorAnio(v, S.anio)).filter((x) => x != null);
        const lo = Math.min(...vs), hi = Math.max(...vs);
        for (const v of ind.valores) { const x = valorAnio(v, S.anio); if (x != null) pon(v.cod, { c: CL.css("--r" + Math.min(5, 1 + Math.floor(((x - lo) / (hi - lo + 1e-9)) * 5))) }); }
        ley = `<b>Condiciones de vida · ${S.anio}</b><span class="rampa">${[1, 2, 3, 4, 5].map((k) => `<i style="background:var(--r${k})"></i>`).join("")}</span><span>de ${CL.n(lo, 1)} a ${CL.n(hi, 1)} (más oscuro, mejor)</span>`;
      } else {
        for (const v of ind.valores) { const j = juicio(ind, v); if (j) pon(v.cod, j.s === "poca" ? { poca: true } : { c: CL.css("--" + j.s), suave: j.s === "igual" }); }
        ley = `<b>Frente a Medellín (${CL.n(ind.ciudad)}${NB}%)</b><span><span class="sem mal">Peor</span> <span class="sem igual">No se distingue</span> <span class="sem bien">Mejor</span></span>`;
      }
    }
    if (reservado) for (const f of G.features) pon(f.properties.cod, { c: inventado(f.properties.cod) });
    $("#mapa").classList.toggle("reservado", reservado);
    for (const f of G.features) {
      const cod = f.properties.cod, e = est[cod] || { c: gris, poca: false, suave: false };
      map.setFeatureState({ source: "comunas", id: f.id }, { c: e.c, poca: e.poca, suave: e.suave, foco: cod === S.comuna });
    }
    // Cruzar con Atlas: un punto en cada comuna con lo que dice la otra herramienta (§4.4)
    const cruza = S.h === "estudio" && S.cruzar && alcanza("profesional");
    const ind = IND.cuidados_no_satisfechos;
    for (const f of G.features) {
      const cod = f.properties.cod;
      if (!marcas[cod]) {
        const d = document.createElement("div");
        marcas[cod] = { d, m: new maplibregl.Marker({ element: d, anchor: "center", offset: [0, 14] }).setLngLat(CL.centro(f)).addTo(map) };
      }
      const v = ind.valores.find((x) => x.cod === cod), j = v && juicio(ind, v);
      marcas[cod].d.className = "cruce " + (j ? j.s : "");
      marcas[cod].d.textContent = j ? { bien: "▲", igual: "●", mal: "▼", poca: "◌" }[j.s] : "";
      marcas[cod].d.style.display = cruza && j ? "" : "none";
    }
    if (cruza) ley += `<span style="margin-top:4px"><b>Cruzado con Atlas</b>: sin atención médica, ▲ mejor · ● no se distingue · ▼ peor que Medellín</span>`;
    $("#ley").innerHTML = ley;
    $("#nota").textContent = nota;
    pintarEtiquetas();
  }
  function montarMapa() {
    const glob = CL.globo($("#mapa"));
    CL.mapa($("#mapa"), {
      alCargar(m, antes) {
        map = m;
        m.addSource("comunas", { type: "geojson", data: G });
        m.addLayer({ id: "cl-relleno", type: "fill", source: "comunas", paint: { "fill-color": ["coalesce", ["feature-state", "c"], "#cccccc"], "fill-opacity": CL.opacidad(), "fill-color-transition": { duration: CL.quieto() ? 0 : 320 } } }, antes);
        CL.rayado(m);
        m.addLayer({ id: "cl-rayado", type: "fill", source: "comunas", paint: { "fill-pattern": "rayado", "fill-opacity": ["case", ["boolean", ["feature-state", "poca"], false], 0.85, 0] } }, antes);
        m.addLayer({ id: "cl-borde", type: "line", source: "comunas", paint: { "line-color": CL.css("--mapa-borde"), "line-width": 1 } }, antes);
        m.addLayer({ id: "cl-foco", type: "line", source: "comunas", paint: { "line-color": CL.css("--mapa-foco"), "line-width": 2.5, "line-opacity": ["case", ["boolean", ["feature-state", "foco"], false], 1, 0] } }, antes);
        pintarEtiquetas = CL.etiquetas(m, G.features, (f, z) => {
          const foco = f.properties.cod === S.comuna;
          return foco || z >= (f.properties.tipo === "corregimiento" ? 10.2 : 11.8) ? { html: CL.esc(f.properties.nombre), foco } : null;
        });
        m.on("click", "cl-relleno", (e) => elegirComuna(e.features[0].properties.cod));
        m.on("mousemove", "cl-relleno", (e) => { m.getCanvas().style.cursor = "pointer"; const cod = e.features[0].properties.cod; glob.ver(e.point.x, e.point.y, `<b>${CL.esc(NOMBRE[cod])}</b><br>Toque para acercar`); });
        m.on("mouseleave", "cl-relleno", () => { m.getCanvas().style.cursor = ""; glob.ocultar(); });
        if (S.comuna) { const f = G.features.find((x) => x.properties.cod === S.comuna); if (f) m.fitBounds(CL.caja([f]), { padding: 40, maxZoom: 15.2, animate: false }); }
        pintarMapa();
      },
      alCambiarTema(m) {
        m.setPaintProperty("cl-borde", "line-color", CL.css("--mapa-borde"));
        m.setPaintProperty("cl-foco", "line-color", CL.css("--mapa-foco"));
        CL.rayado(m);
        pintarMapa();
      },
    });
  }
  function elegirComuna(cod) {
    if (!NOMBRE[cod]) return;
    S.comuna = cod;
    const f = G.features.find((x) => x.properties.cod === cod);
    if (map && f) CL.ir(map, CL.caja([f]));
    todo();
  }
  function volverCiudad() {
    S.comuna = null;
    if (map) CL.ir(map, CL.URBANO, { padding: 24 });
    todo();
  }

  /* ══ La ficha del aspirante ══ */
  const iniciales = (n) => (n.startsWith("Aspirante ") ? n.slice(-1) : n.split(" ").filter((w) => w.length > 2).map((w) => w[0]).slice(0, 2).join(""));
  const NUMS = ["ninguna", "una", "dos", "tres", "cuatro", "cinco"];
  function htmlFicha(nombre) {
    const p = P.personas[nombre];
    const cs = p.candidaturas, rev = fecha(P.revisado);
    const porCorp = {};
    cs.forEach((c) => { const k = c.corp === "Alcaldía" ? `a la Alcaldía de ${c.lugar}` : c.corp === "Concejo" ? `al Concejo de ${c.lugar}` : c.corp === "Asamblea" ? `a la Asamblea de ${c.lugar}` : `a la JAL (${c.lugar})`; porCorp[k] = (porCorp[k] || 0) + 1; });
    const partes = Object.entries(porCorp).map(([k, n]) => `${NUMS[n] || n} ${k}`);
    const eleg = cs.filter((c) => c.elegido === true).length, sd = cs.filter((c) => c.elegido == null).length;
    const elegTxt = cs.length === 1
      ? (eleg ? "Salió elegido." : sd ? "De si salió elegido no hay dato todavía." : "No salió elegido.")
      : sd === cs.length ? "De si salió elegido no hay dato todavía."
      : eleg === cs.length ? (cs.length === 2 ? "Salió elegido en las dos." : "Salió elegido en todas.")
      : `${eleg ? `Salió elegido en ${NUMS[eleg]} de ${NUMS[cs.length]}` : "No salió elegido en ninguna"}${sd ? `; de ${NUMS[sd]} no hay dato` : ""}.`;
    const resumen = !cs.length ? "No aparece en los resultados oficiales de 2000 a 2023: esta sería su primera aspiración."
      : cs.length === 1 ? `Aspiró una vez, ${Object.keys(porCorp)[0]}. ${elegTxt}`
      : `Aspiró ${NUMS[cs.length]} veces: ${partes.length === 1 ? partes[0] : partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1]}. ${elegTxt}`;
    const ejem = '<span class="ejemplo-m">Ejemplo</span>';
    const sellos = p.inventada ? `<span class="sello alerta">Persona inventada</span>` : `<span class="sello">Persona real</span>${p.ejemploPerfil ? '<span class="sello muestra">Perfil con datos de ejemplo</span>' : ""}`;
    const tray = cs.length ? `<ul class="tray">${cs.map((c) => `<li><span class="a">${c.anio}</span><span class="c"><b>${c.corp} · ${CL.esc(c.lugar)}</b><span>${CL.esc(c.fuente)}</span></span><span class="v">${CL.n(c.votos)} votos<span class="eleg ${c.elegido === true ? "si" : c.elegido === false ? "no" : "sd"}">${c.elegido === true ? "Elegido" : c.elegido === false ? "No elegido" : "Elegido: sin dato"}</span></span></li>`).join("")}</ul>` : "";
    const cargos = p.cargos.length ? `<ul class="cargos">${p.cargos.map((c) => `<li><b>${CL.esc(c.cargo)} ${c.ejemplo ? ejem : ""}</b>${c.desde}–${c.hasta || "hoy"}<br><span>Fuente: ${CL.esc(c.fuente)}</span></li>`).join("")}</ul>`
      : `<p class="ninguna">Ningún cargo público en las fuentes consultadas (SIGEP, actas y gacetas).</p>`;
    const sanc = p.sanciones.length ? p.sanciones.map((s) => `<div class="sancion"><span class="t">${s.tipo} · ${CL.esc(s.decision)}</span>${CL.esc(s.autoridad)}. En firme desde el ${fecha(s.firme)}.<span>Fuente: ${CL.esc(s.fuente)} · consultado el ${rev}</span>${s.ejemplo ? '<span class="ejemplo-m" style="justify-self:start">Ejemplo de formato · persona y decisión inventadas</span>' : ""}</div>`).join("")
      : `<p class="ninguna">Ninguna sanción en firme en las fuentes consultadas.</p>`;
    const enl = p.enlaces.wikipedia
      ? `<span class="enlace" role="link" aria-disabled="true">${ico("enlace")}<span>Wikipedia · su página<small>Enlace de ejemplo: la persona es inventada</small></span></span>`
      : `<div class="enlace pendiente">${ico("enlace")}<span>Cuentas públicas de su papel político (la campaña o el cargo)${p.enlaces.ejemplo ? " " + ejem : ""}<small>Sin página en Wikipedia. Lugar reservado: falta que Jurídica confirme si estas cuentas van. Las cuentas personales no van nunca.</small></span></div>`;
    const origen = [
      ["Candidaturas y votos", p.inventada ? "Registraduría (escrutinio) y CEDAE · inventado" : `${CL.esc(cs[0].fuente)} · confirmado por el IPET el 30-oct-2026`],
      ["Cargos", p.ejemploPerfil ? "Dato de ejemplo: su autorización es un borrador" : "SIGEP, actas de posesión y gacetas · inventado"],
      ["Sanciones", `SIRI, Contraloría y Rama Judicial · consultado el ${rev}`],
      ["Revisó y aprobó", "Una persona de CivisLab, con nombre (quién, lo decide Carlos)"],
    ];
    return `<div class="ficha-cab"><span class="av" aria-hidden="true">${iniciales(nombre)}</span><div class="q">
        <div class="sellos" style="display:flex;flex-wrap:wrap;gap:6px">${sellos}</div><h2 id="fichaT" tabindex="-1">${CL.esc(nombre)}</h2>${p.aspira ? `<span class="asp">Aspira a: ${p.aspira}</span>` : ""}</div>
        <button type="button" class="icob" data-cerrar-ficha aria-label="Cerrar la ficha">${ico("cerrar")}</button></div>
      <div class="ficha-cuerpo">
        ${p.vinculo ? `<p class="vinculo">${CL.esc(p.vinculo)}</p>` : ""}
        <section class="sec"><h3>Trayectoria</h3><p class="resumen">${resumen}</p>${tray}</section>
        <section class="sec"><h3>Cargos públicos</h3>${cargos}</section>
        <section class="sec"><h3>Sanciones en firme</h3>${sanc}<ul class="consultadas">${P.consultadas.map((c) => `<li>${CL.esc(c)}</li>`).join("")}</ul></section>
        <section class="sec"><h3>Enlaces</h3><div class="enlaces">${enl}</div></section>
        <section class="sec"><h3>De dónde sale y cuándo se revisó</h3><table class="origen"><tbody>${origen.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</tbody></table></section>
        <div class="no-decir"><b>Lo que esta ficha no dice</b><ul>
          <li>Ninguna probabilidad, escenario ni etiqueta del modelo: la ficha es la historia de la persona.</li>
          <li>Investigaciones abiertas, denuncias ni lo que dicen los medios: solo decisiones en firme con fuente oficial.</li>
          <li>Opiniones, ideología ni vida privada.</li>
          <li>Los mismos campos, en el mismo orden, para todas las personas de la carrera.</li></ul></div>
        ${p.inventada ? `<p class="fuente">Todo en esta ficha es inventado para mostrar el formato. Con aspirantes reales, la ficha sigue el concepto de Jurídica sobre perfiles y nada se publica sin que una persona de CivisLab lo apruebe.</p>` : ""}
      </div>`;
  }
  function tocarAspirante(id, disparador) {
    if (!P.personas[id]) return;
    // Un segundo toque sobre quien ya tiene la ficha abierta la cierra.
    if (S.ficha && S.sel === id) { cerrarFicha(); return; }
    S.sel = id; S.ficha = true; ultimoDisparador = disparador || null;
    todo();
    abrirFicha(true);
  }
  function abrirFicha(enfocar) {
    const el = $("#ficha");
    el.innerHTML = htmlFicha(S.sel);
    if (!enfocar) { el.style.transition = "none"; el.getBoundingClientRect(); setTimeout(() => (el.style.transition = ""), 50); }   // abierta desde la dirección: sin animación
    el.classList.add("abierta");
    app.classList.add("con-ficha");
    el.setAttribute("aria-hidden", "false");
    $("#fichaVelo").hidden = !matchMedia("(max-width:760px)").matches;
    requestAnimationFrame(() => $("#fichaVelo").classList.add("ver"));
    if (enfocar) setTimeout(() => $("#fichaT") && $("#fichaT").focus({ preventScroll: true }), 60);
  }
  function cerrarFicha() {
    S.ficha = false;
    const el = $("#ficha");
    el.classList.remove("abierta");
    app.classList.remove("con-ficha");
    el.setAttribute("aria-hidden", "true");
    $("#fichaVelo").classList.remove("ver"); $("#fichaVelo").hidden = true;
    guardarEstado();
    const t = ultimoDisparador && document.contains(ultimoDisparador) ? ultimoDisparador : document.querySelector(`[data-asp="${CSS.escape(S.sel)}"],[data-persona="${CSS.escape(S.sel)}"]`);
    if (t) t.focus({ preventScroll: true });
  }

  /* ══ Ventanas: cuenta, configuración, planes; y el ingreso ══ */
  function ventana(titulo, cuerpo) {
    const v = $("#velo");
    v.innerHTML = `<div class="ventana" role="dialog" aria-modal="true" aria-labelledby="ventT"><div class="ventana-cab"><h2 id="ventT">${titulo}</h2><button type="button" class="icob" data-cerrar-vent aria-label="Cerrar">${ico("cerrar")}</button></div><div class="ventana-in">${cuerpo}</div></div>`;
    v.hidden = false;
    requestAnimationFrame(() => v.classList.add("ver"));
    setTimeout(() => v.querySelector("[data-cerrar-vent]").focus(), 30);
  }
  function cerrarVentana() { const v = $("#velo"); v.classList.remove("ver"); v.hidden = true; }
  const VENT = {
    cuenta: () => ventana("Cuenta", `<div class="yo"><span class="av">CC</span><span class="q"><b>Carlos Calle</b><span>carlos@ejemplo.co · entró con Google</span></span></div>${tarjetaPlan()}
      <button type="button" class="fila-b" data-abrir="config">${ico("config")}<span>Configuración</span></button>
      <button type="button" class="fila-b" data-salir>${ico("salir")}<span>Salir</span></button>
      <p class="fuente">En el celular, Estratega se consulta: abrir un territorio, leer la frase y ver el mapa. El informe se prepara en el escritorio.</p>`),
    config: () => {
      const tema = document.documentElement.dataset.theme || "sistema";
      ventana("Configuración", `<div class="conf">
        <div><span><b>Cuenta</b><span class="d">carlos@ejemplo.co · entró con Google</span></span><span></span></div>
        <div><span><b>Plan ${NPLAN[S.plan]}</b><span class="d">${{ libre: "Histórico, Atlas y Domicilio", profesional: "Cruzar, Cerebro por comuna e informe", personalizado: "Además, los escenarios 2027 de Medellín hasta el 31-oct-2027" }[S.plan]}</span></span><button type="button" class="boton chico" data-abrir="planes">${S.plan === "libre" ? "Pasar a Profesional" : "Ver los planes"}</button></div>
        <div><span><b>Autorización de datos</b><span class="d">Versión 1, aceptada el 29-oct-2026 (Ley 1581)</span></span><button type="button" class="boton chico" data-proto>Retirarla</button></div>
        <div><span><b>Territorio inicial</b><span class="d">Medellín</span></span><button type="button" class="boton chico" data-proto>Cambiar</button></div>
        <div><span><b>Claro u oscuro</b><span class="d">Por omisión, el del sistema</span></span><span class="toggle" role="group" aria-label="Tema">${[["sistema", "Sistema"], ["light", "Claro"], ["dark", "Oscuro"]].map(([k, t]) => `<button type="button" data-tema-conf="${k}" aria-pressed="${tema === k}">${t}</button>`).join("")}</span></div>
        <div><span><b>Salir</b><span class="d">La dirección guarda dónde iba</span></span><button type="button" class="boton chico" data-salir>${ico("salir")}Salir</button></div></div>
        <p class="fuente">Las preferencias se guardan en la cuenta, no solo en este aparato (spec §4.9).</p>`);
    },
    planes: () => ventana("Planes", `<div class="planes">
        ${[["libre", "Libre", ["Histórico electoral de 265 municipios", "Atlas por comuna", "El Cerebro de la ciudad", "Domicilio"]],
          ["profesional", "Profesional", ["Todo lo de Libre", "Cruzar herramientas y comparar territorios", "El Cerebro por comuna y puesto", "Guardar en el informe, con marca de agua", "Resumen de Pulso, cuando llegue"]],
          ["personalizado", "Personalizado", ["Todo lo de Profesional", "Escenarios 2027 de su municipio", "El detalle de Pulso del municipio", "Sus propias encuestas, cuando llegue el Taller"]]]
          .map(([k, n, l]) => `<div class="${S.plan === k ? "este" : ""}"><b>${n}</b>${S.plan === k ? '<span class="sello">Su plan</span>' : ""}<ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
        <p class="fuente">Qué plan abre los escenarios 2027 está por decidir (registro del 2-nov). En el producto, «Pasar a Profesional» lleva a la página Planes del sitio. En la primera versión los planes se asignan a mano: no hay cobro en línea (spec §6).</p>`),
  };
  function ingreso() {
    const el = document.createElement("div");
    el.className = "ingreso"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ingT");
    el.innerHTML = `<div><img class="placa" src="logo.svg" alt="CivisLab"><div class="marco"><div>
      <h1 id="ingT">Entre a su espacio de trabajo</h1><p class="ref">Estratega junta el Estudio, Atlas, Pulso y el Taller de Opinión sobre un mismo mapa.</p>
      <button type="button" class="boton" data-entrar>Continuar con Google</button><button type="button" class="boton" data-entrar>Continuar con Microsoft</button>
      <label class="fuente" for="ingC">O reciba un código en su correo</label><input id="ingC" type="email" placeholder="nombre@entidad.gov.co" autocomplete="off"><button type="button" class="boton primario" data-entrar>Recibir el código</button>
      <p class="fuente">Prototipo: los botones vuelven a Estratega y no se guarda nada. El ingreso real (lista de correos permitidos y la autorización de la Ley 1581) es de Tecnología y ya existe.</p></div></div></div>`;
    document.body.appendChild(el);
    el.querySelector("[data-entrar]").focus();
    el.addEventListener("click", (e) => { if (e.target.closest("[data-entrar]")) { el.remove(); aviso("Volvió a donde iba: la dirección guarda el estado."); } });
  }
  let tAviso;
  function aviso(t) { const a = $("#aviso"); a.textContent = t; a.classList.add("ver"); clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.remove("ver"), 2600); }

  /* ══ Todo ══ */
  function todo() {
    app.classList.toggle("plegado", S.plegado);
    renderLado(); renderAbajo(); renderMigas(); renderDer(); renderTiempo(); pintarMapa();
    if (S.ficha && S.h === "estudio" && P.personas[S.sel]) $("#ficha").innerHTML = htmlFicha(S.sel);
    guardarEstado();
    document.querySelectorAll("[data-forma]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.forma === S.forma)));
    document.querySelectorAll("[data-plan]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.plan === S.plan)));
  }
  function cambiarHerr(id) {
    if (id === S.h) return;
    S.h = id;
    const h = herr(id);
    S.capa = h.capas.length ? (h.capas.find((c) => c.id === S.capa) || h.capas[0]).id : null;
    if (S.ficha) cerrarFicha();
    pararRecorrido();
    todo();
  }
  function pararRecorrido() { if (reproduciendo) { clearInterval(reproduciendo); reproduciendo = null; } }

  document.addEventListener("click", (e) => {
    const t = e.target;
    let b;
    if ((b = t.closest("[data-h]"))) return cambiarHerr(b.dataset.h);
    if ((b = t.closest("[data-capa]"))) {
      S.capa = b.dataset.capa;
      if (S.capa === "cerebro" && S.sel !== CARLOS) S.sel = null;
      if (S.capa === "p27" && (!S.sel || S.sel === CARLOS)) S.sel = "Aspirante A";
      if (S.ficha) cerrarFicha();
      pararRecorrido();
      return todo();
    }
    if ((b = t.closest("[data-persona]"))) return tocarAspirante(b.dataset.persona, b);
    if ((b = t.closest("[data-esc]"))) { S.esc = +b.dataset.esc; return todo(); }
    if ((b = t.closest("[data-comuna]"))) return elegirComuna(b.dataset.comuna);
    if (t.closest("[data-volver]") || t.closest("#volver")) return volverCiudad();
    if ((b = t.closest("[data-terr]"))) { if (b.dataset.terr === "medellin") return volverCiudad(); return aviso("En el prototipo, el territorio es Medellín. En la v1 se acerca del país al puesto."); }
    if (t.closest("[data-cerrar-ficha]")) return cerrarFicha();
    if (t.id === "fichaVelo") return cerrarFicha();
    if ((b = t.closest("[data-abrir]"))) { cerrarVentana(); return VENT[b.dataset.abrir](); }
    if (t.closest("[data-cerrar-vent]") || t.id === "velo") return cerrarVentana();
    if (t.closest("[data-salir]")) { cerrarVentana(); return ingreso(); }
    if (t.closest("[data-proto]")) return aviso("En el prototipo no hace nada.");
    if ((b = t.closest("[data-tema-conf]"))) {
      const k = b.dataset.temaConf, r = document.documentElement;
      if (k === "sistema") delete r.dataset.theme; else r.dataset.theme = k;
      document.querySelectorAll("[data-tema-conf]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const bt = document.querySelector("[data-tema]");
      if (bt) bt.textContent = CL.oscuro() ? "Claro" : "Oscuro";
      CL.avisarTema();
      return;
    }
    if ((b = t.closest("[data-acc]"))) {
      if (!alcanza("profesional")) return RES.invitar(INV[b.dataset.acc]);
      return aviso(b.dataset.acc === "guardar" ? "Guardado en el informe: mapa, frase y cifra (1 bloque)." : "Comparar: se elige otro territorio y los dos quedan lado a lado.");
    }
    if ((b = t.closest("[data-anio]"))) { pararRecorrido(); S.anio = +b.dataset.anio; return todo(); }
    if (t.closest("[data-play]")) {
      if (reproduciendo) { pararRecorrido(); return renderTiempo(); }
      const anios = IND.imcv15.valores[0].serie.map((s) => s.anio);
      reproduciendo = setInterval(() => { const i = anios.indexOf(S.anio); S.anio = anios[(i + 1) % anios.length]; todo(); if (S.anio === anios[anios.length - 1]) { pararRecorrido(); renderTiempo(); } }, CL.quieto() ? 1400 : 900);
      if (S.anio === anios[anios.length - 1]) S.anio = anios[0];
      return todo();
    }
    if ((b = t.closest("[data-forma]"))) { S.forma = +b.dataset.forma; return todo(); }
    if ((b = t.closest("[data-plan]"))) { S.plan = b.dataset.plan; if (S.ficha && !alcanza("personalizado") && S.capa === "p27") cerrarFicha(); return todo(); }
    if (t.closest("#plegar")) { S.plegado = !S.plegado; todo(); setTimeout(() => map && map.resize(), 360); return; }
  });
  document.addEventListener("change", (e) => {
    if (!e.target.matches("[data-cruzar]")) return;
    if (!alcanza("profesional")) { e.target.checked = false; return RES.invitar(INV.cruzar); }
    S.cruzar = e.target.checked; todo();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.querySelector(".ingreso")) return;
    if (!$("#velo").hidden) return cerrarVentana();
    if (S.ficha) return cerrarFicha();
    if (S.comuna && !e.target.closest("input")) return volverCiudad();
  });

  CL.barra();
  $("#plegar").innerHTML = ico("plegar");
  $("#buscarIco").outerHTML = ico("buscar");
  domicilio();
  todo();
  montarMapa();
  if (S.ficha && S.h === "estudio" && P.personas[S.sel]) abrirFicha(false);
  addEventListener("resize", () => { if (S.ficha) $("#fichaVelo").hidden = !matchMedia("(max-width:760px)").matches; });
})();
