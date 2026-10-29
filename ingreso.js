// CivisLab · Estratega: ingreso con Google, Microsoft o enlace al correo (Supabase Auth, flujo
// PKCE), sin librerías. Lo privado llega de /rest/v1 con el token del usuario; las políticas por
// fila de Supabase deciden qué ve. Aquí solo hay la llave pública.
(function () {
  var raiz = document.getElementById("ingreso");
  if (!raiz) return;
  var URL_ = raiz.dataset.url, LLAVE = raiz.dataset.llave, VERSION = raiz.dataset.autorizacion;
  var SESION = "estratega.sesion", VERIFICADOR = "estratega.verificador", PENDIENTE = "estratega.autorizacion";
  var NIVELES = { abierto: "Abierto", suscripcion: "Suscripción", contrato: "Contrato" };
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
      err.estado = r.status; throw err;
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

  async function mostrarDentro(s) {
    entrar.hidden = true; dentro.hidden = false; decir("");
    document.getElementById("ingreso-correo-actual").textContent = s.correo || "";
    // La constancia de la autorización aceptada antes de salir hacia el proveedor o el correo.
    if (leer(PENDIENTE)) {
      try { await pedir("/rest/v1/autorizaciones", { metodo: "POST", token: s.access_token, minimo: true,
                                                     cuerpo: { texto_version: leer(PENDIENTE) } });
            guardar(PENDIENTE, null); } catch (x) {}
    }
    var nivel = document.getElementById("ingreso-nivel");
    try {
      var p = (await pedir("/rest/v1/perfiles?select=correo,nivel", { token: s.access_token }))[0];
      nivel.textContent = p ? NIVELES[p.nivel] || p.nivel : "Sin perfil";
    } catch (x) {
      if (x.estado === 401) { guardar(SESION, null); mostrarEntrar(); decir("Su sesión venció. Entre de nuevo.", true); return; }
      nivel.textContent = "No se pudo leer";
    }
    var llegan = {};
    try {
      (await pedir("/rest/v1/conjuntos_privados?select=clave,titulo,nivel_minimo,contenido", { token: s.access_token }))
        .forEach(function (c) { llegan[c.clave] = c; });
    } catch (x) {}
    document.querySelectorAll("#ingreso-conjuntos .conjunto").forEach(function (li) {
      var c = llegan[li.dataset.clave], estado = li.querySelector(".conjunto-estado");
      li.querySelectorAll("table").forEach(function (t) { t.remove(); });
      li.classList.toggle("abierto", !!c);
      if (!c) { estado.textContent = "Su nivel no alcanza: Supabase no lo envió."; return; }
      estado.textContent = "Llegó desde Supabase. " + (c.contenido.aviso || "");
      if (c.contenido.filas && c.contenido.filas.length) li.appendChild(tabla(c.contenido.filas));
    });
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

  (async function () {
    if (!local) {
      decir("Por ahora solo se entra en local: abra el sitio con «make estratega-local» en http://localhost:"
            + raiz.dataset.puerto + "/cuenta/index.html.", true);
      return;
    }
    proveedores();
    await alVolver();
    var s = await sesionVigente();
    if (s) mostrarDentro(s); else mostrarEntrar();
  })();
})();
