// CivisLab · Estratega: ingreso con Google, Microsoft o enlace al correo (Supabase Auth, flujo
// PKCE), sin librerías. Lo privado llega de /rest/v1 con el token del usuario; las políticas por
// fila de Supabase deciden qué ve. Aquí solo hay la llave pública. El paso a Profesional lo firma
// la función wompi-firma y lo confirma solo el aviso de Wompi: esta página nunca cambia el plan.
(function () {
  var raiz = document.getElementById("ingreso");
  if (!raiz) return;
  var URL_ = raiz.dataset.url, LLAVE = raiz.dataset.llave, VERSION = raiz.dataset.autorizacion;
  var SESION = "estratega.sesion", VERIFICADOR = "estratega.verificador", PENDIENTE = "estratega.autorizacion";
  var PAGO = "estratega.pago", PASAR = "estratega.pasar", CORREO = raiz.dataset.correo;
  var PLANES = { libre: "Libre", profesional: "Profesional", personalizado: "Personalizado" };
  var CHECKOUT = "https://checkout.wompi.co/p/?";
  var entrar = document.getElementById("ingreso-entrar"), dentro = document.getElementById("ingreso-dentro");
  var casilla = document.getElementById("i-autoriza"), mensaje = document.getElementById("ingreso-mensaje");
  var form = document.getElementById("ingreso-correo"), regreso = location.origin + location.pathname;
  var faltaCasilla = document.getElementById("i-autoriza-falta"), formCodigo = document.getElementById("ingreso-codigo");

  function guardar(k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (x) {}
  }
  function leer(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (x) { return null; } }
  function decir(texto, error) {
    mensaje.textContent = texto; mensaje.hidden = !texto; mensaje.classList.toggle("error", !!error);
  }

  // La autorización es previa y expresa (Ley 1581): sin la casilla no se sale hacia el proveedor
  // ni se pide el enlace. Va debajo de los botones, así que el aviso sale junto a ella.
  function autorizo() {
    var ok = casilla.checked;
    faltaCasilla.hidden = ok;
    if (ok) casilla.removeAttribute("aria-invalid"); else { casilla.setAttribute("aria-invalid", "true"); casilla.focus(); }
    return ok;
  }
  casilla.addEventListener("change", function () { if (casilla.checked) autorizo(); });

  // Solo en local por ahora: Supabase solo acepta regresos a localhost.
  var local = location.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function b64url(bytes) {
    var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function pkce() {
    var a = new Uint8Array(32); crypto.getRandomValues(a);
    var verificador = b64url(a);
    var h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verificador));
    return { verificador: verificador, reto: b64url(new Uint8Array(h)) };
  }

  async function pedir(ruta, o) {
    o = o || {};
    var h = { apikey: LLAVE };
    if (o.token) h.Authorization = "Bearer " + o.token;
    if (o.cuerpo) h["Content-Type"] = "application/json";
    if (o.minimo) h.Prefer = "return=minimal";
    var r = await fetch(URL_ + ruta, { method: o.metodo || "GET", headers: h,
                                       body: o.cuerpo ? JSON.stringify(o.cuerpo) : undefined });
    var datos = null; try { datos = await r.json(); } catch (x) {}
    if (!r.ok) {
      var err = new Error((datos && (datos.msg || datos.error_description || datos.message || datos.error)) || "HTTP " + r.status);
      err.estado = r.status; err.datos = datos; throw err;
    }
    return datos;
  }

  // Lo que dice Supabase, en palabras de la página.
  function explicar(texto, estado, codigo) {
    texto = String(texto || "");
    if (codigo && /expired|invalid|not found/i.test(texto))
      return "El código no coincide o ya venció. Use el del último correo, o pida otro.";
    if (/database error saving new user|no tiene acceso/i.test(texto) || /signups? not allowed/i.test(texto))
      return "Ese correo no tiene acceso todavía. Por ahora solo entra el equipo de CivisLab.";
    if (estado === 429 || /rate limit|security purposes/i.test(texto))
      return "Ya pidió un enlace hace poco. Espere un minuto y vuelva a intentarlo.";
    if (/expired|invalid|not found/i.test(texto))
      return "El enlace venció o ya se usó. Pida otro.";
    return "No se pudo entrar: " + texto;
  }

  function sesionDe(d) {
    return { access_token: d.access_token, refresh_token: d.refresh_token,
             expira: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
             correo: d.user && d.user.email };
  }
  async function sesionVigente() {
    var s = leer(SESION);
    if (!s || !s.refresh_token) return null;
    if (s.expira - 60 > Date.now() / 1000) return s;
    try {
      s = sesionDe(await pedir("/auth/v1/token?grant_type=refresh_token", { metodo: "POST",
                                 cuerpo: { refresh_token: s.refresh_token } }));
      guardar(SESION, s); return s;
    } catch (x) { guardar(SESION, null); return null; }
  }

  async function conProveedor(p) {
    if (!autorizo()) return;
    var k = await pkce();
    guardar(VERIFICADOR, k.verificador); guardar(PENDIENTE, VERSION);
    var q = new URLSearchParams({ provider: p, redirect_to: regreso, code_challenge: k.reto,
                                  code_challenge_method: "s256" });
    if (p === "azure") q.set("scopes", "email");   // Microsoft no entrega el correo sin este permiso
    location.assign(URL_ + "/auth/v1/authorize?" + q.toString());
  }

  async function conCorreo(ev) {
    ev.preventDefault();
    if (!form.reportValidity() || !autorizo()) return;
    var correo = form.correo.value.trim().toLowerCase(), boton = form.querySelector("button");
    boton.disabled = true; decir("Enviando el enlace…");
    try {
      var k = await pkce();
      guardar(VERIFICADOR, k.verificador); guardar(PENDIENTE, VERSION);
      await pedir("/auth/v1/otp?redirect_to=" + encodeURIComponent(regreso), { metodo: "POST",
        cuerpo: { email: correo, create_user: true, code_challenge: k.reto, code_challenge_method: "s256" } });
      decir("Le enviamos un correo a " + correo + ". Escriba aquí el código que trae (puede leerlo en el celular), "
            + "o abra el enlace en este mismo navegador. Vence en una hora.");
      formCodigo.hidden = false; formCodigo.codigo.value = ""; formCodigo.codigo.focus();
    } catch (x) {
      guardar(VERIFICADOR, null); guardar(PENDIENTE, null); decir(explicar(x.message, x.estado), true);
    } finally { boton.disabled = false; }
  }

  // El código del correo: sirve cuando el correo se lee en otro aparato (el enlace solo funciona en
  // el navegador donde se pidió). Supabase lo verifica y entrega la sesión directamente.
  async function conCodigo(ev) {
    ev.preventDefault();
    var campo = formCodigo.codigo, codigo = campo.value.replace(/\D/g, ""), boton = formCodigo.querySelector("button");
    campo.setCustomValidity(/^\d{6,10}$/.test(codigo) ? "" : "Escriba los números del código que le llegó.");
    if (!formCodigo.reportValidity() || !autorizo()) return;
    boton.disabled = true; decir("Revisando el código…");
    try {
      var s = sesionDe(await pedir("/auth/v1/verify", { metodo: "POST",
        cuerpo: { type: "email", email: form.correo.value.trim().toLowerCase(), token: codigo } }));
      guardar(VERIFICADOR, null); guardar(SESION, s);
      formCodigo.hidden = true; campo.value = "";
      mostrarDentro(s);
    } catch (x) { decir(explicar(x.message, x.estado, true), true); }
    finally { boton.disabled = false; }
  }
  formCodigo.codigo.addEventListener("input", function () { formCodigo.codigo.setCustomValidity(""); });

  // Al volver de Google, de Microsoft o del enlace: ?code=… (o ?error=…).
  async function alVolver() {
    var q = new URLSearchParams(location.search), h = new URLSearchParams(location.hash.slice(1));
    var error = q.get("error_description") || h.get("error_description"), codigo = q.get("code");
    if (!error && !codigo) return;
    history.replaceState(null, "", location.pathname);
    if (error) { guardar(VERIFICADOR, null); guardar(PENDIENTE, null); decir(explicar(error), true); return; }
    var verificador = leer(VERIFICADOR); guardar(VERIFICADOR, null);
    if (!verificador) { decir("Abra el enlace en el mismo navegador donde lo pidió.", true); return; }
    try {
      guardar(SESION, sesionDe(await pedir("/auth/v1/token?grant_type=pkce", { metodo: "POST",
                                 cuerpo: { auth_code: codigo, code_verifier: verificador } })));
    } catch (x) { guardar(PENDIENTE, null); decir(explicar(x.message, x.estado), true); }
  }

  function tabla(filas) {
    var t = document.createElement("table"), cols = Object.keys(filas[0] || {});
    var tr = t.createTHead().insertRow();
    cols.forEach(function (c) { var th = document.createElement("th"); th.textContent = c; tr.appendChild(th); });
    var cuerpo = t.createTBody();
    filas.forEach(function (f) {
      var r = cuerpo.insertRow();
      cols.forEach(function (c) { var v = f[c]; r.insertCell().textContent = Array.isArray(v) ? v.join(" – ") : v; });
    });
    return t;
  }

  function fecha(iso) {
    try { return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }); }
    catch (x) { return iso; }
  }
  function pesos(centavos) { return "$" + Math.round(centavos / 100).toLocaleString("es-CO"); }
  // El periodo como lo entrega Supabase («30 days», «1 mon»), en palabras.
  function periodo(p) {
    var d = /(\d+) days?/.exec(p || ""), m = /(\d+) mons?/.exec(p || "");
    if (m) return m[1] + (m[1] === "1" ? " mes" : " meses");
    if (d) return d[1] + (d[1] === "1" ? " día" : " días");
    return p || "";
  }
  // Lo que va después del precio: «al mes» si es un mes; si no, «por» y el periodo (sitio/tabla_planes.por_periodo).
  function porPeriodo(p) { return /^1 mons?$/.test(p || "") ? "al mes" : "por " + periodo(p); }
  function espera(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function miPlan(s) {
    return pedir("/rest/v1/rpc/mi_plan", { metodo: "POST", token: s.access_token, cuerpo: {} });
  }

  function pintarPlan(p) {
    var nivel = document.getElementById("ingreso-nivel"), vence = document.getElementById("ingreso-vence");
    if (!p) { nivel.textContent = "No se pudo leer"; vence.hidden = true; document.getElementById("ingreso-pasar").hidden = true; return; }
    nivel.textContent = PLANES[p.plan] || p.plan || "Sin perfil";
    document.getElementById("ingreso-pasar").hidden = p.plan !== "libre";   // el botón hacia Planes, solo en Libre
    var campana = document.getElementById("ingreso-campana");               // la campaña, solo en Personalizado
    if (campana) campana.hidden = p.plan !== "personalizado";
    var porSuscripcion = p.plan === "profesional" && p.asignado !== "profesional" && p.vence;
    vence.hidden = !porSuscripcion;
    if (porSuscripcion) vence.textContent = "Su plan Profesional va hasta el " + fecha(p.vence) + ".";
  }

  // Cada conjunto llega si su plan alcanza; si no, se ve su forma (cuántas filas) con un candado y
  // el botón que abre el muro. Si Supabase no responde, se dice eso, nunca un candado.
  async function pintarConjuntos(s) {
    var llegan = {}, forma = {}, falla = false;
    try {
      (await pedir("/rest/v1/conjuntos_privados?select=clave,titulo,capacidad,contenido", { token: s.access_token }))
        .forEach(function (c) { llegan[c.clave] = c; });
      (await pedir("/rest/v1/rpc/vitrina", { metodo: "POST", token: s.access_token, cuerpo: {} }))
        .forEach(function (v) { forma[v.clave] = v; });
    } catch (x) { falla = true; }
    document.getElementById("conjuntos-reintentar").hidden = !falla;
    document.querySelectorAll("#ingreso-conjuntos .conjunto").forEach(function (li) {
      var c = llegan[li.dataset.clave], v = forma[li.dataset.clave], plan = li.dataset.plan;
      var estado = li.querySelector(".conjunto-estado"), caja = li.querySelector(".conjunto-cuerpo");
      var ver = li.querySelector(".conjunto-ver");
      caja.textContent = "";
      li.classList.toggle("abierto", !!c);
      li.classList.toggle("bloqueado", !c && !falla);
      ver.hidden = !!c || falla;
      if (falla) { estado.textContent = "No pudimos traer esto ahora."; return; }
      if (c) {
        estado.textContent = "Llegó desde Supabase. " + (c.contenido.aviso || "");
        if (c.contenido.filas && c.contenido.filas.length) caja.appendChild(tabla(c.contenido.filas));
        return;
      }
      var n = v ? v.filas : 0;
      estado.textContent = "Análisis por suscripción: " + (n ? n + (n === 1 ? " fila" : " filas") + " con el plan " : "con el plan ")
                           + PLANES[plan] + ". Supabase las envía cuando su plan alcanza.";
      var f = document.createElement("div");
      f.className = "conjunto-forma"; f.setAttribute("aria-hidden", "true");
      for (var i = 0; i < n; i++) f.appendChild(document.createElement("span"));
      caja.appendChild(f);
    });
  }

  // --- El muro: un solo botón, con el precio, y las condiciones a la vista -----------------
  var muro = document.getElementById("muro"), botonPasar = document.getElementById("muro-pasar");
  var mensajeMuro = document.getElementById("muro-mensaje");
  function decirMuro(texto, error) {
    mensajeMuro.textContent = texto; mensajeMuro.hidden = !texto; mensajeMuro.classList.toggle("error", !!error);
  }

  // El precio y lo que trae Profesional salen de public.planes y public.capacidades: la página no
  // repite la tabla.
  async function cargarPrecio(s) {
    try {
      var p = (await pedir("/rest/v1/planes?clave=eq.profesional&select=precio_centavos,periodo,precio_de_prueba",
                           { token: s.access_token }))[0];
      var trae = await pedir("/rest/v1/capacidades?plan_minimo=eq.profesional&publica=is.false&select=titulo&order=orden",
                             { token: s.access_token });
      if (!p) throw new Error("sin precio");
      botonPasar.textContent = "Pasar a Profesional · " + pesos(p.precio_centavos) + " " + porPeriodo(p.periodo)
                               + (p.precio_de_prueba ? " (precio de prueba)" : "");
      botonPasar.disabled = false;
      var ul = document.getElementById("muro-trae"); ul.textContent = "";
      trae.forEach(function (t) { var li = document.createElement("li"); li.textContent = t.titulo; ul.appendChild(li); });
    } catch (x) {
      botonPasar.disabled = true;
      decirMuro("No pudimos traer el precio ahora. Cierre y vuelva a intentar en un momento.", true);
    }
  }

  function abrirMuro(plan) {
    var pro = plan !== "personalizado";
    document.getElementById("muro-titulo").textContent = pro ? "Esto se ve con el plan Profesional"
                                                             : "Esto es del plan Personalizado";
    document.getElementById("muro-pro").hidden = !pro;
    document.getElementById("muro-perso").hidden = pro;
    if (botonPasar.disabled === false) decirMuro("");
    if (typeof muro.showModal === "function") { if (!muro.open) muro.showModal(); } else muro.setAttribute("open", "");
  }
  function cerrarMuro() { if (typeof muro.close === "function") muro.close(); else muro.removeAttribute("open"); }

  async function pasar() {
    botonPasar.disabled = true; decirMuro("Preparando el pago con Wompi…");
    try {
      var s = await sesionVigente();
      if (!s) { cerrarMuro(); mostrarEntrar(); decir("Su sesión venció. Entre de nuevo.", true); return; }
      var r = await pedir("/functions/v1/wompi-firma", { metodo: "POST", token: s.access_token, cuerpo: { regreso: regreso } });
      if (!r || typeof r.checkout !== "string" || r.checkout.indexOf(CHECKOUT) !== 0) throw new Error("respuesta inesperada");
      guardar(PAGO, { referencia: r.referencia, desde: Date.now() });
      decirMuro("Lo llevamos a Wompi para pagar…");
      location.assign(r.checkout);
    } catch (x) {
      var codigo = x.datos && x.datos.codigo;
      decirMuro(codigo === "sin_configurar" || codigo === "no_es_prueba"
                ? "El pago con Wompi todavía no está activo en Estratega: faltan las llaves de pruebas. No se cobró nada."
                : codigo === "sin_sesion" ? "Su sesión venció. Salga y entre de nuevo."
                : "No pudimos hablar con Wompi ahora. No se cobró nada. Intente de nuevo en un momento.", true);
      botonPasar.disabled = false;
    }
  }

  // --- Al volver de Wompi (?id=…): esperar el aviso, que es lo único que cambia el plan --------
  function avisoPago(texto, error, reintentar) {
    var a = document.getElementById("pago-estado");
    a.textContent = texto; a.hidden = !texto; a.classList.toggle("error", !!error);
    document.getElementById("pago-reintentar").hidden = !reintentar;
  }

  async function confirmarPago(s, transaccion) {
    var p = leer(PAGO);
    if (!p || !p.referencia) return;
    avisoPago("Confirmando su pago con Wompi…");
    for (var i = 0; i < 30; i++) {
      var fila = null;
      try {
        fila = (await pedir("/rest/v1/pagos?select=estado&referencia=eq." + encodeURIComponent(p.referencia),
                            { token: s.access_token }))[0];
      } catch (x) {}
      var e = fila && fila.estado;
      if (e === "APPROVED") {
        guardar(PAGO, null);
        var plan = null; try { plan = await miPlan(s); } catch (x) {}
        pintarPlan(plan); await pintarConjuntos(s);
        avisoPago("Listo: ya está en el plan Profesional" + (plan && plan.vence ? " hasta el " + fecha(plan.vence) : "")
                  + ". Lo que tenía candado ya llegó.");
        return;
      }
      if (e === "DECLINED" || e === "ERROR" || e === "VOIDED") {
        guardar(PAGO, null);
        avisoPago(e === "VOIDED" ? "Wompi anuló el pago. Su plan sigue igual."
                  : "Wompi no aprobó el pago y no se cobró nada. Puede intentar de nuevo, con otra tarjeta si quiere.",
                  true, true);
        return;
      }
      await espera(3000);
    }
    avisoPago("Wompi todavía no nos confirma el pago (referencia " + p.referencia
              + (transaccion ? ", transacción " + transaccion : "") + "). Si ya ve el cobro, no pague otra vez: su plan "
              + "cambia solo apenas llegue la confirmación. Si en una hora no ha cambiado, escríbanos a " + CORREO
              + " con esa referencia.", true);
  }

  async function mostrarDentro(s, transaccion) {
    entrar.hidden = true; dentro.hidden = false; decir("");
    document.getElementById("ingreso-correo-actual").textContent = s.correo || "";
    // La constancia de la autorización aceptada antes de salir hacia el proveedor o el correo.
    if (leer(PENDIENTE)) {
      try { await pedir("/rest/v1/autorizaciones", { metodo: "POST", token: s.access_token, minimo: true,
                                                     cuerpo: { texto_version: leer(PENDIENTE) } });
            guardar(PENDIENTE, null); } catch (x) {}
    }
    var plan = null;
    try { plan = await miPlan(s); } catch (x) {
      if (x.estado === 401) { guardar(SESION, null); mostrarEntrar(); decir("Su sesión venció. Entre de nuevo.", true); return; }
    }
    pintarPlan(plan);
    await pintarConjuntos(s);
    cargarPrecio(s);
    var pago = leer(PAGO);
    if (pago && transaccion) { confirmarPago(s, transaccion); return; }
    if (pago && Date.now() - pago.desde > 3600000) guardar(PAGO, null);   // salió de Wompi sin pagar
    if (leer(PASAR)) { guardar(PASAR, null); if (!plan || plan.plan === "libre") abrirMuro("profesional"); }
  }

  function mostrarEntrar() { dentro.hidden = true; entrar.hidden = false; }

  async function salir() {
    var s = leer(SESION);
    guardar(SESION, null);
    if (s) { try { await pedir("/auth/v1/logout?scope=local", { metodo: "POST", token: s.access_token }); } catch (x) {} }
    mostrarEntrar(); decir("Salió de Estratega.");
  }

  async function proveedores() {
    var falta = document.getElementById("ingreso-falta"), sinConfigurar = [];
    var ajustes = {}; try { ajustes = (await pedir("/auth/v1/settings")).external || {}; } catch (x) {}
    document.querySelectorAll("[data-proveedor]").forEach(function (b) {
      var p = b.dataset.proveedor;
      b.disabled = !ajustes[p];
      if (!ajustes[p]) sinConfigurar.push(b.textContent.replace("Continuar con ", ""));
      b.addEventListener("click", function () { conProveedor(p); });
    });
    form.querySelector("button").disabled = !ajustes.email;
    if (sinConfigurar.length) {
      falta.textContent = "Todavía no está activo el ingreso con " + sinConfigurar.join(" ni con ") + ".";
      falta.hidden = false;
    }
  }

  form.addEventListener("submit", conCorreo);
  formCodigo.addEventListener("submit", conCodigo);
  document.getElementById("ingreso-salir").addEventListener("click", salir);
  // El candado se abre al intentar ver lo bloqueado, no al entrar.
  document.querySelectorAll(".conjunto-ver").forEach(function (b) {
    b.addEventListener("click", function () { abrirMuro(b.closest(".conjunto").dataset.plan); });
  });
  document.querySelectorAll("[data-muro]").forEach(function (b) {
    b.addEventListener("click", function () { avisoPago(""); abrirMuro(b.dataset.muro); });
  });
  document.getElementById("muro-cerrar").addEventListener("click", cerrarMuro);
  botonPasar.addEventListener("click", pasar);
  document.querySelector("#conjuntos-reintentar button").addEventListener("click", async function () {
    var s = await sesionVigente(); if (s) pintarConjuntos(s);
  });

  // Wompi vuelve con ?id=<transacción> (solo informativo); planes/ manda ?pasar=profesional.
  var q0 = new URLSearchParams(location.search), transaccion = q0.get("id");
  if (q0.get("pasar") === "profesional") guardar(PASAR, true);
  if (transaccion || q0.has("pasar")) history.replaceState(null, "", location.pathname);

  (async function () {
    if (!local) {
      decir("Por ahora solo se entra en local: abra el sitio con «make estratega-local» en http://localhost:"
            + raiz.dataset.puerto + "/cuenta/index.html.", true);
      return;
    }
    proveedores();
    await alVolver();
    var s = await sesionVigente();
    if (s) mostrarDentro(s, transaccion);
    else {
      mostrarEntrar();
      if (leer(PASAR)) decir("Entre para pasar a Profesional.");
    }
  })();
})();
