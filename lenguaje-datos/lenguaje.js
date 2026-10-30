/* Lenguaje visual de los datos de CivisLab · funciones comunes de los prototipos.
   Mapa: MapLibre GL con el fondo Positron de OpenFreeMap. Si el fondo no carga, el mapa sigue con los
   límites solos y lo dice. Las capas de datos van debajo de los nombres de las calles. */
(function () {
  const CL = (window.CL = {});
  const raiz = document.documentElement;
  const url = new URLSearchParams(location.search);

  /* ── Tema, dirección y modo captura (barra de revisión) ── */
  if (url.get("tema")) raiz.dataset.theme = url.get("tema");
  if (url.get("captura")) document.body.classList.add("captura");
  CL.oscuro = () => raiz.dataset.theme === "dark" ||
    (raiz.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  CL.quieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  CL.dir = url.get("dir") === "b" ? "b" : "a";
  document.body.classList.add("dir-" + CL.dir);
  const avisarTema = [];
  CL.alCambiarTema = (fn) => avisarTema.push(fn);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => avisarTema.forEach((f) => f()));
  CL.barra = function () {
    document.querySelectorAll("[data-dir]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.dir === CL.dir));
      b.addEventListener("click", () => { url.set("dir", b.dataset.dir); location.search = url.toString(); });
    });
    const bt = document.querySelector("[data-tema]");
    if (bt) {
      const pintar = () => (bt.textContent = CL.oscuro() ? "Claro" : "Oscuro");
      pintar();
      bt.addEventListener("click", () => {
        raiz.dataset.theme = CL.oscuro() ? "light" : "dark";
        pintar();
        avisarTema.forEach((f) => f());
      });
    }
    document.querySelectorAll(".revision a[data-pagina]").forEach((a) => {
      const u = new URL(a.href, location.href);
      u.searchParams.set("dir", CL.dir);
      if (raiz.dataset.theme) u.searchParams.set("tema", raiz.dataset.theme);
      a.href = u.pathname.split("/").pop() + u.search;
    });
  };

  /* ── Cifras: miles con punto, decimales con coma, espacio antes de % ── */
  const nf = (d) => new Intl.NumberFormat("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
  CL.n = (x, d = 0) => nf(d).format(x);
  CL.pct = (x, d) => {             // x en proporción (0,0026 → «0,26 %»)
    const v = x * 100;
    if (d === undefined) d = v === 0 ? 0 : Math.abs(v) < 1 ? 2 : Math.abs(v) < 10 ? 1 : 0;
    return nf(d).format(v) + " %";
  };
  CL.pp = (x, d = 1) => nf(d).format(x) + (Math.abs(x) === 1 ? " punto" : " puntos");
  CL.css = (v) => getComputedStyle(raiz).getPropertyValue(v).trim();
  CL.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Cuenta hasta el valor nuevo (solo al cambiar de estado; nunca al cargar; nunca con «reducir movimiento»). */
  CL.contar = function (el, de, a, fmt, ms = 400) {
    if (CL.quieto() || de === a) { el.textContent = fmt(a); return; }
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(de + (a - de) * e);
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  /* Reordena una lista con movimiento (FLIP): las filas viajan a su lugar nuevo. */
  CL.reordenar = function (ul, filas) {
    const antes = new Map([...ul.children].map((li) => [li, li.getBoundingClientRect().top]));
    filas.forEach((li) => ul.appendChild(li));
    if (CL.quieto()) return;
    filas.forEach((li) => {
      const d = antes.get(li) - li.getBoundingClientRect().top;
      if (!d) return;
      li.style.transition = "none";
      li.style.transform = `translateY(${d}px)`;
      li.getBoundingClientRect();   // fija la posición de partida
      setTimeout(() => { li.style.transition = ""; li.style.transform = ""; }, 20);
    });
  };

  /* ── Geometría ── */
  function areaAnillo(r) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return a / 2; }
  CL.centro = function (f) {        // centroide del polígono más grande (para la etiqueta)
    let mejor = null, am = 0;
    for (const p of f.geometry.coordinates) { const a = Math.abs(areaAnillo(p[0])); if (a > am) { am = a; mejor = p[0]; } }
    let x = 0, y = 0, A = 0;
    for (let i = 0, j = mejor.length - 1; i < mejor.length; j = i++) {
      const k = mejor[j][0] * mejor[i][1] - mejor[i][0] * mejor[j][1];
      x += (mejor[j][0] + mejor[i][0]) * k; y += (mejor[j][1] + mejor[i][1]) * k; A += k;
    }
    return [x / (3 * A), y / (3 * A)];
  };
  CL.caja = function (feats) {
    let o = 180, s = 90, e = -180, n = -90;
    for (const f of feats) for (const p of f.geometry.coordinates) for (const [x, y] of p[0]) {
      o = Math.min(o, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y);
    }
    return [[o, s], [e, n]];
  };
  CL.URBANO = [[-75.635, 6.175], [-75.535, 6.335]];   // las 16 comunas a la vista

  /* ── Mapa ── */
  // ?fondo=no simula que OpenFreeMap no responde (para probar el respaldo).
  const FONDO = url.get("fondo") === "no" ? "https://tiles.openfreemap.org/styles/no-existe" : "https://tiles.openfreemap.org/styles/positron";
  const CREDITO = "Límites: DANE, Marco Geoestadístico Nacional (CC BY 4.0).";
  const OSCURO = { background: "#141c1b", water: "#16302f", fill: "#1b2523", park: "#1c2a25", line: "#2b3836", text: "#8fa29b", halo: "#141c1b" };

  CL.mapa = function (contenedor, op) {
    const el = document.createElement("div");
    contenedor.appendChild(el);
    const vacio = { version: 8, sources: {}, layers: [{ id: "fondo", type: "background", paint: { "background-color": CL.css("--superficie-2") } }] };
    let map = null, sinFondo = false;
    const listos = [];
    const api = { cuando: (fn) => (map ? fn(map) : listos.push(fn)) };
    // Primero se pide el estilo, con plazo; así el mapa nace con Positron o con los límites solos.
    const ctl = new AbortController(), plazo = setTimeout(() => ctl.abort(), op.plazo || 8000);
    fetch(FONDO, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).catch(() => null).then((estilo) => {
      clearTimeout(plazo);
      sinFondo = !estilo;
      if (sinFondo) {
        const a = document.createElement("div");
        a.className = "aviso-fondo"; a.textContent = "El fondo no cargó: el mapa sigue con los límites solos.";
        contenedor.appendChild(a);
      }
      map = new maplibregl.Map({
        container: el, style: estilo || vacio, bounds: op.caja || CL.URBANO, fitBoundsOptions: { padding: 24 },
        attributionControl: { compact: innerWidth < 640, customAttribution: CREDITO }, dragRotate: false, pitchWithRotate: false,
        cooperativeGestures: op.cooperativo || false, fadeDuration: CL.quieto() ? 0 : 200,
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      (CL.mapas = CL.mapas || []).push(map);
      map.on("load", () => {
        // Los nombres de barrio y de corregimiento de OpenStreetMap no siempre coinciden con los del DANE:
        // van ocultos y quedan los nuestros. También los escudos de las vías, que no dicen nada aquí.
        for (const l of map.getStyle().layers) if (/^label_other$|^label_village$|shield/.test(l.id)) map.setLayoutProperty(l.id, "visibility", "none");
        recolorear();
        CL.alCambiarTema(() => { recolorear(); op.alCambiarTema && op.alCambiarTema(map); });
        const primera = sinFondo ? undefined : (map.getStyle().layers.find((l) => l.type === "symbol") || {}).id;
        op.alCargar(map, primera);
        listos.forEach((f) => f(map));
        map.triggerRepaint();
      });
    });
    function recolorear() {
      if (sinFondo) { map.setPaintProperty("fondo", "background-color", CL.css("--superficie-2")); return; }
      const o = CL.oscuro();
      for (const l of map.getStyle().layers) {
        if (l.id.startsWith("cl-")) continue;
        const id = l.id, orig = (recolorear.orig = recolorear.orig || {});
        const set = (prop, v) => {
          const k = id + "|" + prop;
          if (!(k in orig)) orig[k] = map.getPaintProperty(id, prop);
          if (orig[k] === undefined && !o) return;
          try { map.setPaintProperty(id, prop, o ? v : orig[k]); } catch (e) { /* propiedad ausente */ }
        };
        if (l.type === "background") set("background-color", OSCURO.background);
        else if (l.type === "fill") set("fill-color", /water/.test(id) ? OSCURO.water : /park|wood|grass|landcover/.test(id) ? OSCURO.park : OSCURO.fill);
        else if (l.type === "line") set("line-color", /water|river/.test(id) ? OSCURO.water : OSCURO.line);
        else if (l.type === "symbol") { set("text-color", OSCURO.text); set("text-halo-color", OSCURO.halo); }
      }
    }
    return api;
  };

  /* Relleno que se aclara al acercarse: 0,62 en zoom 11, 0,35 en 14, 0,2 en 16 (la regla del gerente, §10.2). */
  /* Con la marca «suave» (feature-state), el relleno baja al 45 %: «no se distingue» no compite con verde y rojo. */
  CL.opacidad = (base = 0.62) => {
    const k = (v) => ["case", ["boolean", ["feature-state", "suave"], false], +(v * 0.45).toFixed(3), v];
    return ["interpolate", ["linear"], ["zoom"], 11, k(base), 14, k(0.35), 16, k(0.2)];
  };

  /* Rayado para «muestra pequeña» o «sin dato». */
  CL.rayado = function (map) {
    const t = 8, c = document.createElement("canvas");
    c.width = c.height = t;
    const g = c.getContext("2d");
    g.strokeStyle = CL.css("--rayado"); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, t); g.lineTo(t, 0); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(t - 2, t + 2); g.lineTo(t + 2, t - 2); g.stroke();
    const img = g.getImageData(0, 0, t, t);
    if (map.hasImage("rayado")) map.removeImage("rayado");
    map.addImage("rayado", { width: t, height: t, data: img.data });
  };

  /* Etiquetas propias (HTML): no dependen de las tipografías del fondo y sirven sin fondo. */
  CL.etiquetas = function (map, feats, contenido) {
    const marcas = [];
    for (const f of feats) {
      const d = document.createElement("div");
      d.className = "et-mapa" + (f.properties.tipo === "corregimiento" ? " corr" : "");
      marcas.push({ f, d, m: new maplibregl.Marker({ element: d, anchor: "center" }).setLngLat(CL.centro(f)).addTo(map) });
    }
    const pintar = () => {
      const z = map.getZoom();
      for (const x of marcas) {
        const r = contenido(x.f, z);
        x.d.innerHTML = r ? r.html : "";
        x.d.className = "et-mapa" + (x.f.properties.tipo === "corregimiento" ? " corr" : "") + (r && r.foco ? " foco" : "");
        x.d.style.opacity = r ? 1 : 0;
      }
    };
    map.on("zoomend", pintar);
    pintar();
    return pintar;
  };

  /* Globo al pasar o tocar. */
  CL.globo = function (contenedor) {
    const g = document.createElement("div");
    g.className = "globo"; g.setAttribute("role", "status");
    contenedor.appendChild(g);
    return {
      ver(x, y, html) {
        g.innerHTML = html;
        const w = contenedor.clientWidth, gw = g.offsetWidth, gh = g.offsetHeight;
        g.style.left = Math.min(Math.max(8, x + 12), w - gw - 8) + "px";
        g.style.top = Math.max(8, y - gh - 12) + "px";
        g.classList.add("ver");
      },
      ocultar() { g.classList.remove("ver"); },
    };
  };

  /* Vuelo de cámara: 800 ms con la curva «entre»; con «reducir movimiento», salto. */
  CL.ir = function (map, caja, extra = {}) {
    const op = Object.assign({ padding: 40, maxZoom: 15.2 }, extra);
    if (CL.quieto()) op.animate = false; else { op.duration = 800; op.easing = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); }
    map.fitBounds(caja, op);
  };

  /* Pasos del relato (dirección A): cuando un paso cruza el centro de la pantalla, se activa. */
  CL.pasos = function (alActivar) {
    const pasos = [...document.querySelectorAll(".paso[data-paso]")];
    if (CL.dir !== "a") { alActivar(pasos[0] ? pasos[0].dataset.paso : null, null); return; }
    let actual = null;
    const io = new IntersectionObserver((ent) => {
      for (const e of ent) if (e.isIntersecting && e.target !== actual) {
        if (actual) actual.classList.remove("activo");
        actual = e.target; actual.classList.add("activo");
        alActivar(actual.dataset.paso, actual);
      }
    }, { rootMargin: innerWidth <= 860 ? "-55% 0px -40% 0px" : "-45% 0px -45% 0px" });   // en el celular, la línea queda bajo el mapa
    pasos.forEach((p) => io.observe(p));
  };
})();
