// CivisLab · la maqueta 3D de Montería (encargo de Tecnología del 5-nov-2026, «la maqueta interactiva en la portada»).
// La escena (relieve, río Sinú, barrios, vías, árboles, puentes, pines de zona) es la del prototipo de Sara Patiño Rojas
// (en la sede, docs/monteria/sara/, sección «Entender · Montería en 3D»), sin la creciente animada,
// sin cifras del equipo y sin nada del aspirante. Lo nuevo: girar con un dedo o el ratón, acercar con dos dedos, con
// Ctrl + rueda o con los botones, recorrer las zonas, y nada se mueve solo si el sistema pide reducir el movimiento.
// Sin red: three.js viene del mismo sitio (../vendor/three.r149.min.js).
(function () {
  "use strict";
  // Incrustada en la portada, la página no repite la barra de volver ni el pie: los pone la portada.
  try { if (window.self !== window.top) document.documentElement.classList.add("mq-incrustada"); } catch (x) { /* sin acceso */ }
  var THREE = window.THREE;
  var marco3d = document.getElementById("mq-escena");
  var canvas = document.getElementById("mq-lienzo");
  if (!marco3d || !canvas) return;
  function sinGL() { document.documentElement.classList.add("mq-sin-gl"); }
  if (!THREE) { sinGL(); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (x) { sinGL(); return; }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var small = (marco3d.getBoundingClientRect().width || 800) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  var scene = new THREE.Scene();
  var SKY = 0xDCE6EA;
  var skyCv = document.createElement("canvas");
  skyCv.width = 4; skyCv.height = 256;
  var skx = skyCv.getContext("2d");
  var skg = skx.createLinearGradient(0, 0, 0, 256);
  skg.addColorStop(0, "#9FC2DE"); skg.addColorStop(0.55, "#CFE0EA"); skg.addColorStop(0.8, "#EDE6D8"); skg.addColorStop(1, "#DCE6EA");
  skx.fillStyle = skg; skx.fillRect(0, 0, 4, 256);
  scene.background = new THREE.CanvasTexture(skyCv);
  scene.fog = new THREE.Fog(SKY, 85, 230);
  var camera = new THREE.PerspectiveCamera(36, 1, 0.5, 500);
  scene.add(new THREE.HemisphereLight(0xE4EEFA, 0x5C6E45, 0.62));
  var sun = new THREE.DirectionalLight(0xFFE0B5, 1.08);
  sun.position.set(48, 40, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  var sc = sun.shadow.camera;
  sc.left = -55; sc.right = 55; sc.top = 45; sc.bottom = -45; sc.near = 10; sc.far = 160;
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  // ---- la escena de Sara, tal cual (salvo la creciente animada, que no va) ----
      let seed = 11;
      const rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const W = function (x, y) { return [(x - 320) / 10, (y - 220) / 10]; };
      const sstep = function (a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

      const RP = [[300, -1100], [306, -700], [300, -340], [300, -60], [287, 90], [312, 170], [296, 252], [318, 340], [303, 470], [300, 780], [294, 1150]].map(function (p) { const w = W(p[0], p[1]); return new THREE.Vector3(w[0], 0, w[1]); });
      const curve = new THREE.CatmullRomCurve3(RP);
      const samples = curve.getSpacedPoints(560);
      const rxTab = [];
      for (let i = 0; i <= 960; i++) { const zq = -120 + i * 0.25; let best = 1e9, bx = 0; for (let j = 0; j < samples.length; j++) { const d = Math.abs(samples[j].z - zq); if (d < best) { best = d; bx = samples[j].x; } } rxTab.push(bx); }
      const rxFast = function (Zc) { const i = Math.round((Zc + 120) / 0.25); return rxTab[Math.max(0, Math.min(960, i))]; };
      const noise = function (X, Zc) { return 0.5 + 0.22 * Math.sin(X * 0.071 + Zc * 0.043) + 0.16 * Math.sin(X * 0.153 - Zc * 0.117 + 1.3) + 0.12 * Math.cos(X * 0.31 + Zc * 0.27); };
      const hash = function (i, j) { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
      const riverInfo = function (X, Zc) {
        const rq = rxFast(Zc);
        if (Math.abs(X - rq) > 12) return { d: Math.abs(X - rq), side: X >= rq ? 1 : -1 };
        let best = 1e9, bx = 0;
        for (let i = 0; i < samples.length; i++) { const dx = X - samples[i].x, dz = Zc - samples[i].z; const d = dx * dx + dz * dz; if (d < best) { best = d; bx = samples[i].x; } }
        return { d: Math.sqrt(best), side: X >= bx ? 1 : -1 };
      };
      const riverXAt = rxFast;

      const ZG = [
        { id: 'no', x: 386, y: 22, w: 214, h: 122, base: 0.9, hr: [0.6, 2.2] },
        { id: 'ce', x: 386, y: 165, w: 184, h: 118, base: 0.9, hr: [1.2, 4.2], tower: true },
        { id: 'su', x: 386, y: 304, w: 214, h: 118, base: 0.9, hr: [0.5, 1.7] },
        { id: 'mi', x: 52, y: 96, w: 184, h: 182, base: 0.15, hr: [0.35, 0.95], tile: true },
        { id: 'ru', x: 30, y: 300, w: 220, h: 130, base: 0.15, rural: true }
      ].map(function (z) {
        const a = W(z.x, z.y), b = W(z.x + z.w, z.y + z.h);
        return Object.assign({}, z, { X0: a[0], Z0: a[1], X1: b[0], Z1: b[1], cx: (a[0] + b[0]) / 2, cz: (a[1] + b[1]) / 2 });
      });
      const inZone = function (X, Zc, m) { for (let i = 0; i < ZG.length; i++) { const z = ZG[i]; if (!z.rural && X > z.X0 - m && X < z.X1 + m && Zc > z.Z0 - m && Zc < z.Z1 + m) return z; } return null; };
      const heightAt = function (X, Zc) {
        const z = inZone(X, Zc, 0.2);
        if (z) return z.base;
        const r = riverInfo(X, Zc);
        let h = r.side > 0 ? 0.15 + 0.75 * sstep(2.0, 4.0, r.d) : 0.15;
        if (r.d < 2.2) h = 0.15 - 1.05 * (1 - (r.d / 2.2) * (r.d / 2.2));
        const n = noise(X, Zc);
        if (X > 33) h += (X - 33) * 0.2 * (0.55 + 0.45 * Math.sin(Zc * 0.28)) * (0.7 + 0.6 * n);
        if (Zc > 25 && X > 2) h += (Zc - 25) * 0.1;
        if (X < -35) h += (-35 - X) * 0.07;
        const far = Math.max(sstep(58, 105, Math.abs(X - 4)), sstep(52, 100, Math.abs(Zc)));
        if (far > 0 && r.d > 6) h += far * (5 + 9 * n + 3 * Math.sin(X * 0.21) * Math.cos(Zc * 0.19));
        if (r.d > 3) h += 0.09 * Math.sin(X * 0.8 + Zc * 0.5) + 0.06 * Math.cos(X * 0.37 - Zc * 0.9) + 0.25 * (n - 0.5);
        return h;
      };
      const RURAL = function (X, Zc) { return !inZone(X, Zc, 1) && riverInfo(X, Zc).d > 4; };
      const patchCol = function (X, Zc) {
        const i = Math.floor((X + 200) / 6.5), j = Math.floor((Zc + 200) / 5.2);
        const hv = hash(i, j);
        return { hv: hv, i: i, j: j, col: [0x8DB15E, 0x9CBF6A, 0xC2B577, 0xA9C46E, 0xB08A5E, 0x7FA457, 0x93B866, 0xCBB98A][Math.floor(hv * 8)] };
      };

      const ground = new THREE.PlaneGeometry(230, 210, 230, 210);
      ground.rotateX(-Math.PI / 2);
      const pos = ground.attributes.position;
      const cols = new Float32Array(pos.count * 3);
      const c = new THREE.Color(), c2 = new THREE.Color();
      const fieldCols = [0xB9B46A, 0x8DB15E, 0xA7C26C, 0xC9BE7E, 0x7FA457];
      for (let i = 0; i < pos.count; i++) {
        const X = pos.getX(i), Zc = pos.getZ(i);
        const h = heightAt(X, Zc);
        pos.setY(i, h);
        const r = riverInfo(X, Zc);
        const zz = inZone(X, Zc, 0);
        if (zz) c.setHex(0xCBC8BC);
        else if (r.d < 3.1) { c.setHex(0xD6C79C); c2.setHex(0x8BB062); c.lerp(c2, sstep(2.2, 3.1, r.d)); }
        else if (X > -29.5 && X < -6.5 && Zc > 8.2 && Zc < 21.5) { c.setHex(fieldCols[(Math.floor(X / 3.4) * 7 + Math.floor(Zc / 2.6) * 3 + 50) % fieldCols.length]); }
        else if (h > 4.5) { c.setHex(0x557A3E); c2.setHex(0x6F8F4C); c.lerp(c2, noise(X * 2.1, Zc * 2.3)); if (hash(Math.floor(X / 4), Math.floor(Zc / 4)) < 0.12) c.lerp(c2.setHex(0x9C7B55), 0.5); }
        else if (h > 1.4) { c.setHex(0x6E9450); c2.setHex(0x86A862); c.lerp(c2, 0.5 + 0.5 * Math.sin(X * 0.6 + Zc)); }
        else if (r.d > 5) { const pc = patchCol(X, Zc); c.setHex(pc.col); c2.setHex(0x86AD5F); c.lerp(c2, 0.25 + 0.2 * noise(X * 3, Zc * 3)); }
        else { c.setHex(0x86AD5F); c2.setHex(0x9ABD6C); c.lerp(c2, 0.5 + 0.5 * Math.sin(X * 0.45) * Math.cos(Zc * 0.38)); }
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
      ground.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      ground.computeVertexNormals();
      const grainCv = document.createElement('canvas');
      grainCv.width = grainCv.height = 256;
      const gx = grainCv.getContext('2d');
      gx.fillStyle = '#E6E6E6'; gx.fillRect(0, 0, 256, 256);
      for (let k = 0; k < 5200; k++) { const v0 = 200 + Math.floor(rnd() * 55); gx.fillStyle = 'rgb(' + v0 + ',' + v0 + ',' + v0 + ')'; gx.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 2); }
      for (let k = 0; k < 900; k++) { gx.fillStyle = 'rgba(255,255,240,0.5)'; gx.fillRect(rnd() * 256, rnd() * 256, 1, 2); }
      const grain = new THREE.CanvasTexture(grainCv);
      grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
      grain.repeat.set(46, 42);
      const groundMesh = new THREE.Mesh(ground, new THREE.MeshLambertMaterial({ vertexColors: true, map: grain }));
      groundMesh.receiveShadow = true;
      scene.add(groundMesh);

      const riverPts = curve.getSpacedPoints(700);
      const rv = [], ruv = [], ridx = [];
      for (let i = 0; i < riverPts.length; i++) {
        const p = riverPts[i];
        const t = curve.getTangentAt(i / (riverPts.length - 1));
        const nx = -t.z, nz = t.x;
        const wd = 1.95 + 0.25 * Math.sin(i * 0.05);
        rv.push(p.x + nx * wd, -0.18, p.z + nz * wd, p.x - nx * wd, -0.18, p.z - nz * wd);
        ruv.push(0, i * 0.08, 1, i * 0.08);
        if (i > 0) { const a = (i - 1) * 2; ridx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const rg = new THREE.BufferGeometry();
      rg.setAttribute('position', new THREE.Float32BufferAttribute(rv, 3));
      rg.setAttribute('uv', new THREE.Float32BufferAttribute(ruv, 2));
      rg.setIndex(ridx);
      rg.computeVertexNormals();
      const tc = document.createElement('canvas');
      tc.width = 64; tc.height = 256;
      const tx = tc.getContext('2d');
      const wg = tx.createLinearGradient(0, 0, 64, 0);
      wg.addColorStop(0, '#9DB89F'); wg.addColorStop(0.12, '#6F98A0'); wg.addColorStop(0.5, '#3E6F8E'); wg.addColorStop(0.88, '#6F98A0'); wg.addColorStop(1, '#9DB89F');
      tx.fillStyle = wg; tx.fillRect(0, 0, 64, 256);
      for (let k = 0; k < 90; k++) { const sx = 6 + rnd() * 52; tx.fillStyle = 'rgba(225, 238, 245, ' + (0.08 + rnd() * 0.22) + ')'; tx.fillRect(sx, rnd() * 256, 1 + rnd() * 5, 1); }
      for (let k = 0; k < 18; k++) { tx.fillStyle = 'rgba(255, 255, 255, 0.55)'; tx.fillRect(14 + rnd() * 36, rnd() * 256, 1, 1); }
      const flowTex = new THREE.CanvasTexture(tc);
      flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
      const water = new THREE.Mesh(rg, new THREE.MeshPhongMaterial({ map: flowTex, shininess: 120, specular: 0xFFF1D8, side: THREE.DoubleSide }));
      water.receiveShadow = true;
      scene.add(water);

      const box = new THREE.BoxGeometry(1, 1, 1);
      box.translate(0, 0.5, 0);
      const dummy = new THREE.Object3D();
      const makeTex = function (bg, win, cols, rows, lit) {
        const cv = document.createElement('canvas');
        cv.width = 128; cv.height = 128;
        const x = cv.getContext('2d');
        x.fillStyle = bg; x.fillRect(0, 0, 128, 128);
        const cw = 112 / cols, rh = 112 / rows;
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
          x.fillStyle = rnd() < lit ? '#F4E3B5' : win;
          x.fillRect(10 + i * cw + cw * 0.18, 10 + j * rh + rh * 0.22, cw * 0.64, rh * 0.52);
        }
        const t = new THREE.CanvasTexture(cv);
        return t;
      };
      const boxRoofUV = function (geo) {
        const uv = geo.attributes.uv;
        for (let i = 8; i < 16; i++) uv.setXY(i, 0.02, 0.98);
        uv.needsUpdate = true;
        return geo;
      };
      const ao = function (geo, dark) {
        geo.computeBoundingBox();
        const bb = geo.boundingBox, p = geo.attributes.position, ca = new Float32Array(p.count * 3);
        for (let i = 0; i < p.count; i++) { const t = (p.getY(i) - bb.min.y) / Math.max(0.001, bb.max.y - bb.min.y); const v0 = dark + (1 - dark) * Math.pow(t, 0.6); ca[i * 3] = ca[i * 3 + 1] = ca[i * 3 + 2] = v0; }
        geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
        return geo;
      };
      const bldGeo = ao(boxRoofUV(new THREE.BoxGeometry(1, 1, 1, 1, 3, 1)), 0.66); bldGeo.translate(0, 0.5, 0);
      const towerGeo = ao(boxRoofUV(new THREE.BoxGeometry(1, 1, 1, 1, 4, 1)), 0.6); towerGeo.translate(0, 0.5, 0);
      const houseGeo = ao(boxRoofUV(new THREE.BoxGeometry(1, 1, 1, 1, 2, 1)), 0.7); houseGeo.translate(0, 0.5, 0);
      const hcv = document.createElement('canvas');
      hcv.width = hcv.height = 64;
      const hx = hcv.getContext('2d');
      hx.fillStyle = '#FFFFFF'; hx.fillRect(0, 0, 64, 64);
      hx.fillStyle = '#C9C2B4'; hx.fillRect(0, 56, 64, 8);
      hx.fillStyle = '#6E4A32'; hx.fillRect(26, 26, 12, 32);
      hx.fillStyle = '#5D7184'; hx.fillRect(7, 22, 13, 13); hx.fillRect(44, 22, 13, 13);
      hx.fillStyle = '#FFFFFF'; hx.fillRect(12.5, 22, 2, 13); hx.fillRect(49.5, 22, 2, 13);
      const houseTex = new THREE.CanvasTexture(hcv);
      const roofGeo = new THREE.ConeGeometry(0.72, 0.42, 4); roofGeo.rotateY(Math.PI / 4); roofGeo.translate(0, 0.21, 0);
      const houses = [], bldgs = [], towers = [];
      const wallPal = [0xF4F0E6, 0xEDE6D6, 0xF6E9C9, 0xE9EEF2, 0xF2E2D2];
      const bldPal = [0xF2EFE8, 0xE6E1D6, 0xDCD9D2, 0xEDE4D3, 0xD9DEE4];
      const addHouse = function (X, Zc, y, sx, sz) {
        const hgt = 0.42 + rnd() * 0.18;
        houses.push({ x: X, z: Zc, y: y, sx: sx, sy: hgt, sz: sz, wall: wallPal[Math.floor(rnd() * wallPal.length)], roof: rnd() < 0.72 ? (rnd() < 0.5 ? 0xB8613F : 0xC4775A) : 0x9AA3AD });
      };
      const mix = { no: [0.3, 0], ce: [0.05, 0.1], su: [0.6, 0], mi: [0.85, 0] };
      ZG.forEach(function (z) {
        if (z.rural) return;
        const m = mix[z.id];
        for (let bx = z.X0 + 0.35; bx + 2.4 <= z.X1; bx += 3.0) {
          for (let bz = z.Z0 + 0.35; bz + 2.4 <= z.Z1; bz += 3.0) {
            for (let k = 0; k < 4; k++) {
              if (rnd() < 0.16) continue;
              const ox = (k % 2) * 1.25, oz = Math.floor(k / 2) * 1.25;
              const sx = 0.9 + rnd() * 0.25, sz = 0.9 + rnd() * 0.25;
              const X = bx + ox + sx / 2, Zc = bz + oz + sz / 2;
              const r = rnd();
              if (r < m[0]) { addHouse(X, Zc, z.base, sx * 0.92, sz * 0.92); continue; }
              if (r > 1 - m[1]) { towers.push({ x: X, z: Zc, y: z.base, sx: sx, sy: 4 + rnd() * 3.5, sz: sz, col: 0xFFFFFF }); continue; }
              const hgt = Math.max(0.9, z.hr[0] + rnd() * (z.hr[1] - z.hr[0]));
              bldgs.push({ x: X, z: Zc, y: z.base, sx: sx, sy: hgt, sz: sz, col: bldPal[Math.floor(rnd() * bldPal.length)] });
            }
          }
        }
      });
      for (let k = 0; k < 46; k++) {
        const X = -28 + rnd() * 21, Zc = 8.6 + rnd() * 12.4;
        addHouse(X, Zc, heightAt(X, Zc), 0.75, 0.6);
      }
      for (let k = 0; k < 40; k++) {
        const X = -60 + rnd() * 120, Zc = -55 + rnd() * 110;
        if (inZone(X, Zc, 3) || riverInfo(X, Zc).d < 4 || (X > -32 && X < 36 && Zc > -24 && Zc < 24)) continue;
        addHouse(X, Zc, heightAt(X, Zc), 0.75, 0.6);
      }
      const inst = function (geo, mat, list, colorKey, ySc) {
        const im = new THREE.InstancedMesh(geo, mat, list.length);
        list.forEach(function (b, i) {
          dummy.rotation.set(0, 0, 0);
          dummy.position.set(b.x, b.y + (ySc ? b.sy : 0), b.z);
          dummy.scale.set(b.sx, ySc ? 1 : b.sy, b.sz);
          dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
          im.setColorAt(i, c.setHex(b[colorKey]));
        });
        im.castShadow = true; im.receiveShadow = true;
        scene.add(im);
        return im;
      };
      houses.forEach(function (h) { h.ry = (rnd() < 0.5 ? 0 : Math.PI / 2); });
      const instR = function (geo, mat, list, colorKey, ySc) {
        const im = new THREE.InstancedMesh(geo, mat, list.length);
        list.forEach(function (b, i) {
          dummy.rotation.set(0, b.ry || 0, 0);
          dummy.position.set(b.x, b.y + (ySc ? b.sy : 0), b.z);
          dummy.scale.set(b.sx, ySc ? 1 : b.sy, b.sz);
          dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
          im.setColorAt(i, c.setHex(b[colorKey]));
        });
        im.castShadow = true; im.receiveShadow = true;
        scene.add(im);
        return im;
      };
      instR(houseGeo, new THREE.MeshLambertMaterial({ map: houseTex, vertexColors: true }), houses, 'wall', false);
      instR(roofGeo, new THREE.MeshLambertMaterial(), houses, 'roof', true);
      const patios = houses.filter(function () { return rnd() < 0.45; }).map(function (h) { return { x: h.x + (h.ry ? 0 : 0.05), z: h.z + h.sz * 0.62, y: h.y, sx: h.sx * 0.95, sy: 0.05, sz: 0.35, col: 0xD8CDB8 }; });
      inst(box, new THREE.MeshLambertMaterial(), patios, 'col', false);
      inst(bldGeo, new THREE.MeshLambertMaterial({ map: makeTex('#FFFFFF', '#7D8A99', 3, 4, 0.08), vertexColors: true }), bldgs, 'col', false);
      inst(towerGeo, new THREE.MeshPhongMaterial({ map: makeTex('#C9D5E2', '#5E7488', 4, 9, 0.12), shininess: 60, specular: 0x8899AA, vertexColors: true }), towers, 'col', false);
      const tanks = bldgs.filter(function () { return rnd() < 0.35; }).map(function (b) { return { x: b.x + b.sx * 0.22, z: b.z - b.sz * 0.2, y: b.y + b.sy, sx: 0.22, sy: 0.26, sz: 0.22, col: 0x2A2E33 }; });
      const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); tankGeo.translate(0, 0.5, 0);
      inst(tankGeo, new THREE.MeshPhongMaterial({ shininess: 40 }), tanks, 'col', false);

      const streetMat = new THREE.MeshLambertMaterial({ color: 0x8A8F96 });
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x5E6470 });
      const strips = [];
      ZG.forEach(function (z) {
        if (z.rural) return;
        for (let x = z.X0; x <= z.X1 + 0.01; x += 3.0) strips.push({ x: x, z: z.cz, sx: 0.32, sz: z.Z1 - z.Z0, y: z.base, m: 0 });
        for (let q = z.Z0; q <= z.Z1 + 0.01; q += 3.0) strips.push({ x: z.cx, z: q, sx: z.X1 - z.X0, sz: 0.32, y: z.base, m: 0 });
      });
      const dashes = [], poles = [];
      const road = function (pts, dirt) {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const L0 = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const n = Math.max(1, Math.round(L0 / (dirt ? 0.6 : 1.2)));
          const ux = (b[0] - a[0]) / L0, uz = (b[1] - a[1]) / L0;
          const ang = -Math.atan2(uz, ux);
          for (let k = 0; k < n; k++) {
            const t0 = (k + 0.5) / n;
            const X = a[0] + (b[0] - a[0]) * t0, Zc = a[1] + (b[1] - a[1]) * t0;
            const len = L0 / n + 0.06;
            const y = heightAt(X, Zc);
            strips.push({ x: X, z: Zc, sx: len, sz: dirt ? 0.42 : 0.7, y: y, m: dirt ? 2 : 1, ry: ang });
            if (!dirt) {
              if (k % 2 === 0) dashes.push({ x: X, z: Zc, y: y + 0.11, sx: 0.5, sz: 0.06, ry: ang });
              if (k % 3 === 0) poles.push({ x: X - uz * 0.5, z: Zc + ux * 0.5, y: y });
            }
          }
        }
      };
      road([[5.6, -60], [5.6, 60]]);
      road([[5.6, -6.6], [65, -6.6]]);
      road([[5.6, 7.3], [65, 7.3]]);
      road([[-65, 6.9], [-3.4, 6.9]]);
      road([[15, -60], [15, -19.8]]);
      road([[15, 20.2], [15, 60]]);
      road([[-12, 6.9], [-12, 28], [-24, 40], [-38, 46]], true);
      road([[-30, 6.9], [-34, -14], [-46, -30], [-58, -36]], true);
      road([[-12, 20], [-30, 24], [-52, 22]], true);
      road([[-45, 6.9], [-50, 14], [-60, 16]], true);
      road([[30, -6.6], [34, -26], [48, -40]], true);
      road([[40, 7.3], [44, 26], [56, 36]], true);
      road([[24, 7.3], [26, 32]], true);
      const stripGeo = new THREE.BoxGeometry(1, 0.06, 1);
      const dirtMat = new THREE.MeshLambertMaterial({ color: 0xB89C74 });
      [0, 1, 2].forEach(function (m) {
        const list = strips.filter(function (s) { return s.m === m; });
        const im = new THREE.InstancedMesh(stripGeo, [streetMat, roadMat, dirtMat][m], list.length);
        list.forEach(function (s, i) { dummy.position.set(s.x, s.y + (m === 2 ? 0.02 : 0.04 + m * 0.02), s.z); dummy.scale.set(s.sx, 1, s.sz); dummy.rotation.set(0, s.ry || 0, 0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
        im.receiveShadow = true;
        scene.add(im);
      });
      const dashMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.02, 1), new THREE.MeshBasicMaterial({ color: 0xF1E3A8 }), dashes.length);
      dashes.forEach(function (d, i) { dummy.position.set(d.x, d.y, d.z); dummy.scale.set(d.sx, 1, d.sz); dummy.rotation.set(0, d.ry, 0); dummy.updateMatrix(); dashMesh.setMatrixAt(i, dummy.matrix); });
      scene.add(dashMesh);
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.035, 1.05, 4); poleGeo.translate(0, 0.52, 0);
      const lampGeo = new THREE.BoxGeometry(0.22, 0.05, 0.08); lampGeo.translate(0.08, 1.05, 0);
      const poleMesh = new THREE.InstancedMesh(poleGeo, new THREE.MeshLambertMaterial({ color: 0x9BA1A8 }), poles.length);
      const lampMesh = new THREE.InstancedMesh(lampGeo, new THREE.MeshLambertMaterial({ color: 0xE8E2CC, emissive: 0x6B6040 }), poles.length);
      poles.forEach(function (p, i) { dummy.position.set(p.x, p.y, p.z); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); poleMesh.setMatrixAt(i, dummy.matrix); lampMesh.setMatrixAt(i, dummy.matrix); });
      poleMesh.castShadow = true;
      scene.add(poleMesh); scene.add(lampMesh);

      const farms = [], fenceRails = [], comm = [];
      for (let k = 0; k < 500 && farms.length < (small ? 14 : 24); k++) {
        const X = -62 + rnd() * 124, Zc = -55 + rnd() * 110;
        if (!RURAL(X, Zc) || Math.abs(X - 5.6) < 3 || Math.abs(X - 15) < 3 || heightAt(X, Zc) > 3) continue;
        if (farms.some(function (f) { return Math.hypot(f.x - X, f.z - Zc) < 7; })) continue;
        farms.push({ x: X, z: Zc, w: 3 + rnd() * 2.5, d: 2.4 + rnd() * 2 });
      }
      const h0 = houses.length;
      farms.forEach(function (f) {
        addHouse(f.x, f.z, heightAt(f.x, f.z), 0.9, 0.7);
        houses[houses.length - 1].ry = 0;
        const pts = [[f.x - f.w / 2, f.z - f.d / 2], [f.x + f.w / 2, f.z - f.d / 2], [f.x + f.w / 2, f.z + f.d / 2], [f.x - f.w / 2, f.z + f.d / 2]];
        for (let e = 0; e < 4; e++) {
          const a = pts[e], b = pts[(e + 1) % 4], L0 = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const n = Math.ceil(L0 / 0.7);
          for (let q = 0; q < n; q++) {
            const t0 = (q + 0.5) / n, X = a[0] + (b[0] - a[0]) * t0, Zc = a[1] + (b[1] - a[1]) * t0;
            fenceRails.push({ x: X, z: Zc, y: heightAt(X, Zc), len: L0 / n, ry: -Math.atan2(b[1] - a[1], b[0] - a[0]) });
          }
        }
      });
      const railGeo = new THREE.BoxGeometry(1, 0.03, 0.03); railGeo.translate(0, 0.22, 0);
      const postGeo = new THREE.BoxGeometry(0.05, 0.3, 0.05); postGeo.translate(-0.5, 0.15, 0);
      const farmHouses = houses.slice(h0);
      instR(houseGeo, new THREE.MeshLambertMaterial({ map: houseTex, vertexColors: true }), farmHouses, 'wall', false);
      instR(roofGeo, new THREE.MeshLambertMaterial(), farmHouses, 'roof', true);
      const rail2 = railGeo.clone(); rail2.translate(0, -0.1, 0);
      const railMesh = new THREE.InstancedMesh(railGeo, new THREE.MeshLambertMaterial({ color: 0x8A6B4B }), fenceRails.length);
      const rail2Mesh = new THREE.InstancedMesh(rail2, railMesh.material, fenceRails.length);
      const postMesh = new THREE.InstancedMesh(postGeo, railMesh.material, fenceRails.length);
      fenceRails.forEach(function (r0, i) { dummy.position.set(r0.x, r0.y, r0.z); dummy.rotation.set(0, r0.ry, 0); dummy.scale.set(r0.len, 1, 1); dummy.updateMatrix(); railMesh.setMatrixAt(i, dummy.matrix); rail2Mesh.setMatrixAt(i, dummy.matrix); postMesh.setMatrixAt(i, dummy.matrix); });
      scene.add(railMesh); scene.add(rail2Mesh); scene.add(postMesh);
      [[-20, 30], [-40, -22], [44, 22]].forEach(function (p) {
        const X = p[0], Zc = p[1], y = heightAt(X, Zc);
        const hall = new THREE.Mesh(houseGeo, new THREE.MeshLambertMaterial({ map: houseTex, vertexColors: true, color: 0xF2F4F6 }));
        hall.scale.set(2.2, 0.7, 1.2); hall.position.set(X, y, Zc); hall.castShadow = hall.receiveShadow = true; scene.add(hall);
        const hr = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.4), new THREE.MeshLambertMaterial({ color: 0x4F79A8 }));
        hr.position.set(X, y + 0.74, Zc); hr.rotation.z = 0.06; hr.castShadow = true; scene.add(hr);
        const fcv = document.createElement('canvas'); fcv.width = 96; fcv.height = 64;
        const fx = fcv.getContext('2d'); fx.fillStyle = '#6FA24F'; fx.fillRect(0, 0, 96, 64);
        fx.strokeStyle = '#F4F4EE'; fx.lineWidth = 2; fx.strokeRect(4, 4, 88, 56); fx.beginPath(); fx.moveTo(48, 4); fx.lineTo(48, 60); fx.stroke(); fx.beginPath(); fx.arc(48, 32, 9, 0, 6.3); fx.stroke();
        const field = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 2.2), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(fcv) }));
        field.position.set(X + 3.2, heightAt(X + 3.2, Zc) + 0.06, Zc); field.receiveShadow = true; scene.add(field);
        const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 4), railMesh.material); tw.position.set(X - 1.6, y + 0.8, Zc + 0.7); scene.add(tw);
        const tt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 10), new THREE.MeshPhongMaterial({ color: 0x2A2E33 })); tt.position.set(X - 1.6, y + 1.8, Zc + 0.7); tt.castShadow = true; scene.add(tt);
        comm.push({ x: X, z: Zc });
      });

      const carPaths = [[[5.6, -60], [5.6, 60]], [[5.6, -6.6], [65, -6.6]], [[5.6, 7.3], [65, 7.3]], [[-65, 6.9], [-3.4, 6.9]], [[15, -60], [15, -19.8]], [[15, 20.2], [15, 60]]].map(function (p) {
        const a = p[0], b = p[1];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const hs = [];
        for (let i = 0; i <= 60; i++) { const t0 = i / 60; hs.push(heightAt(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0)); }
        return { a: a, b: b, len: len, hs: hs, dir: [(b[0] - a[0]) / len, (b[1] - a[1]) / len] };
      });
      const carCols = [0xC0392B, 0xF2F2F2, 0x2C3E50, 0xE8B33A, 0x7F8C8D, 0x2E86C1, 0xF2F2F2];
      const cars = [];
      carPaths.forEach(function (p, pi) {
        const n = Math.max(3, Math.round(p.len / 9));
        for (let k = 0; k < n; k++) cars.push({ p: pi, t: rnd(), v: (0.012 + rnd() * 0.01) * (rnd() < 0.5 ? 1 : -1), col: carCols[Math.floor(rnd() * carCols.length)] });
      });
      const carGeo = new THREE.BoxGeometry(0.62, 0.26, 0.32); carGeo.translate(0, 0.17, 0);
      const carMesh = new THREE.InstancedMesh(carGeo, new THREE.MeshLambertMaterial(), cars.length);
      cars.forEach(function (cr, i) { carMesh.setColorAt(i, c.setHex(cr.col)); });
      carMesh.castShadow = true;
      scene.add(carMesh);
      const placeCars = function (dt) {
        cars.forEach(function (cr, i) {
          const p = carPaths[cr.p];
          cr.t += cr.v * dt * 60 / p.len * 6;
          if (cr.t > 1) cr.t -= 1; if (cr.t < 0) cr.t += 1;
          const lane = cr.v > 0 ? 0.16 : -0.16;
          const X = p.a[0] + (p.b[0] - p.a[0]) * cr.t - p.dir[1] * lane;
          const Zc = p.a[1] + (p.b[1] - p.a[1]) * cr.t + p.dir[0] * lane;
          const hi = p.hs[Math.round(cr.t * 60)];
          dummy.position.set(X, hi + 0.08, Zc);
          dummy.rotation.set(0, -Math.atan2(p.dir[1], p.dir[0]), 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix(); carMesh.setMatrixAt(i, dummy.matrix);
        });
        carMesh.instanceMatrix.needsUpdate = true;
      };
      placeCars(0);

      const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85 });
      const clouds = [];
      for (let k = 0; k < 6; k++) {
        const cg = new THREE.Group();
        for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 + rnd() * 1.2, 1), cloudMat); s.position.set(j * 1.8 - 2.7, rnd() * 0.6, (rnd() - 0.5) * 1.6); s.scale.set(1, 0.5, 1); s.castShadow = true; cg.add(s); }
        cg.position.set(-70 + rnd() * 140, 17 + rnd() * 4, -40 + rnd() * 80);
        scene.add(cg); clouds.push(cg);
      }

      const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x8C929C });
      [-8.0, 3.6].forEach(function (bz) {
        const rx = riverXAt(bz);
        const deck = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.28, 1.1), bridgeMat);
        deck.position.set(rx + 0.6, 0.95, bz); deck.castShadow = true; deck.receiveShadow = true;
        scene.add(deck);
        [-1.6, 0, 1.6].forEach(function (o) { const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 8), bridgeMat); pier.position.set(rx + o, 0.1, bz); scene.add(pier); });
      });
      const boatMat = new THREE.MeshLambertMaterial({ color: 0xE0B04A });
      const boats = [-2.4, 11.5].map(function (bz, i) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.6), boatMat);
        m.position.set(riverXAt(bz), -0.08, bz); m.castShadow = true; scene.add(m);
        return { m: m, x0: riverXAt(bz), ph: i * 2.1 };
      });

      const palms = [], ceibas = [];
      for (let Zc = -54; Zc < 54; Zc += 1.3) {
        const rx = riverXAt(Zc);
        [rx + 2.9 + rnd() * 0.6, 5.0].forEach(function (X) { if (!inZone(X, Zc, 0.3) && rnd() < 0.85) palms.push({ x: X, z: Zc + rnd() * 0.4, y: heightAt(X, Zc), s: 0.85 + rnd() * 0.35 }); });
      }
      for (let k = 0; k < 60; k++) {
        const X = -29 + rnd() * 23, Zc = 8.4 + rnd() * 13;
        if (rnd() < 0.5) palms.push({ x: X, z: Zc, y: heightAt(X, Zc), s: 0.8 + rnd() * 0.3 });
      }
      for (let k = 0; k < 400 && ceibas.length < 26; k++) {
        const X = -60 + rnd() * 120, Zc = -55 + rnd() * 110;
        if (inZone(X, Zc, 1.5) || riverInfo(X, Zc).d < 4) continue;
        ceibas.push({ x: X, z: Zc, y: heightAt(X, Zc), s: 1.9 + rnd() * 0.8 });
      }
      const pTrunk = new THREE.CylinderGeometry(0.045, 0.075, 1.7, 5); pTrunk.translate(0, 0.85, 0);
      const pCrown = new THREE.IcosahedronGeometry(0.5, 0);
      const ptm = new THREE.InstancedMesh(pTrunk, new THREE.MeshLambertMaterial({ color: 0x8C7356 }), palms.length);
      const pcm = new THREE.InstancedMesh(pCrown, new THREE.MeshLambertMaterial({ color: 0x3F7A34 }), palms.length);
      palms.forEach(function (p, i) {
        dummy.rotation.set((rnd() - 0.5) * 0.15, 0, (rnd() - 0.5) * 0.15);
        dummy.position.set(p.x, p.y, p.z); dummy.scale.set(p.s, p.s, p.s); dummy.updateMatrix(); ptm.setMatrixAt(i, dummy.matrix);
        dummy.rotation.set(0, rnd() * 3, 0);
        dummy.position.set(p.x, p.y + 1.7 * p.s, p.z); dummy.scale.set(p.s * 1.7, p.s * 0.42, p.s * 1.7); dummy.updateMatrix(); pcm.setMatrixAt(i, dummy.matrix);
      });
      ptm.castShadow = true; pcm.castShadow = true;
      scene.add(ptm); scene.add(pcm);
      const ceGeo = new THREE.IcosahedronGeometry(0.7, 1);
      const ceT = new THREE.CylinderGeometry(0.12, 0.2, 0.9, 6); ceT.translate(0, 0.45, 0);
      const cem = new THREE.InstancedMesh(ceGeo, new THREE.MeshLambertMaterial({ color: 0x55803F }), ceibas.length);
      const cet = new THREE.InstancedMesh(ceT, new THREE.MeshLambertMaterial({ color: 0x6B5A48 }), ceibas.length);
      ceibas.forEach(function (t, i) {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(t.x, t.y, t.z); dummy.scale.set(t.s * 0.8, t.s * 0.9, t.s * 0.8); dummy.updateMatrix(); cet.setMatrixAt(i, dummy.matrix);
        dummy.position.set(t.x, t.y + 0.9 * t.s, t.z); dummy.scale.set(t.s * 1.5, t.s * 0.55, t.s * 1.5); dummy.updateMatrix(); cem.setMatrixAt(i, dummy.matrix);
      });
      cem.castShadow = true; cet.castShadow = true;
      scene.add(cem); scene.add(cet);

      const groves = [];
      for (let k = 0; k < 300 && groves.length < 34; k++) {
        const X = -70 + rnd() * 140, Zc = -62 + rnd() * 124;
        if (RURAL(X, Zc) && !comm.some(function (q) { return Math.hypot(q.x - X, q.z - Zc) < 6; }) && !farms.some(function (f) { return Math.hypot(f.x - X, f.z - Zc) < 4.5; })) groves.push({ x: X, z: Zc, r: 2.5 + rnd() * 4 });
      }
      const trees = [];
      const maxTrees = small ? 1100 : 2000;
      groves.forEach(function (gv) {
        const n = Math.round(gv.r * gv.r * (small ? 1.2 : 2));
        for (let q = 0; q < n && trees.length < maxTrees * 0.55; q++) {
          const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * gv.r;
          const X = gv.x + Math.cos(a) * rr, Zc = gv.z + Math.sin(a) * rr * 0.8;
          if (inZone(X, Zc, 0.6) || riverInfo(X, Zc).d < 2.5) continue;
          trees.push({ x: X, z: Zc, y: heightAt(X, Zc), s: 0.75 + rnd() * 0.8 * (1 - rr / gv.r * 0.5), g: rnd() * 0.6 });
        }
      });
      const bushes = [];
      for (let i = -11; i <= 11; i++) for (let j = -12; j <= 12; j++) {
        if (hash(i + 3, j + 7) > (small ? 0.32 : 0.45)) continue;
        const X0 = i * 6.5 + (31 * 6.5 - 200), Zq = j * 5.2 + (39 * 5.2 - 200);
        const vertical = hash(i, j + 1) > 0.5;
        for (let q = 0; q < 8; q++) {
          const X = vertical ? X0 : X0 + q * 0.8, Zc = vertical ? Zq + q * 0.65 : Zq;
          if (!RURAL(X, Zc) || Math.abs(X - 5.6) < 1 || Math.abs(X - 15) < 1) continue;
          const y = heightAt(X, Zc);
          if (y > 4) continue;
          if (q % 3 === 0) trees.push({ x: X, z: Zc, y: y, s: 0.6 + rnd() * 0.4, g: rnd() });
          else bushes.push({ x: X + (rnd() - 0.5) * 0.2, z: Zc + (rnd() - 0.5) * 0.2, y: y, s: 0.35 + rnd() * 0.25 });
        }
      }
      for (let k = 0; k < 900 && bushes.length < 1600; k++) {
        const X = -64 + rnd() * 128, Zc = -59 + rnd() * 118;
        if (RURAL(X, Zc) && rnd() < 0.5) bushes.push({ x: X, z: Zc, y: heightAt(X, Zc), s: 0.25 + rnd() * 0.25 });
      }
      const bushMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.6, 0), new THREE.MeshLambertMaterial(), bushes.length);
      bushes.forEach(function (b, i) { dummy.rotation.set(0, rnd() * 3, 0); dummy.position.set(b.x, b.y + b.s * 0.3, b.z); dummy.scale.set(b.s * 1.3, b.s * 0.8, b.s * 1.3); dummy.updateMatrix(); bushMesh.setMatrixAt(i, dummy.matrix); bushMesh.setColorAt(i, c.setHex([0x4C7536, 0x5D8440, 0x6E9447][Math.floor(rnd() * 3)])); });
      bushMesh.castShadow = true; bushMesh.receiveShadow = true;
      scene.add(bushMesh);
      for (let k = 0; k < 6500 && trees.length < maxTrees; k++) {
        const X = -64 + rnd() * 128, Zc = -59 + rnd() * 118;
        if (inZone(X, Zc, 0.6)) continue;
        const r = riverInfo(X, Zc);
        if (r.d < 2.5) continue;
        if (Math.abs(X - 5.6) < 0.7 || Math.abs(X - 15) < 0.7 || Math.abs(Zc + 6.6) < 0.7 || Math.abs(Zc - 7.3) < 0.7 || Math.abs(Zc - 6.9) < 0.7) continue;
        const h = heightAt(X, Zc);
        const inField = X > -29.5 && X < -6.5 && Zc > 8.2 && Zc < 21.5;
        let p = 0.07;
        if (r.side > 0 && r.d < 5.2) p = 0.95;
        else if (r.d < 4.6) p = 0.85;
        else if (h > 1.3) p = 0.6;
        else if (inField) p = 0.05;
        if (rnd() > p) continue;
        trees.push({ x: X, z: Zc, y: h, s: 0.65 + rnd() * 0.75, g: rnd() });
      }
      const canopy = ao(new THREE.IcosahedronGeometry(0.62, 1), 0.62);
      const trunk = new THREE.CylinderGeometry(0.07, 0.1, 0.6, 5);
      trunk.translate(0, 0.3, 0);
      const cMesh = new THREE.InstancedMesh(canopy, new THREE.MeshLambertMaterial({ vertexColors: true }), trees.length);
      const tMesh = new THREE.InstancedMesh(trunk, new THREE.MeshLambertMaterial({ color: 0x6B4F36 }), trees.length);
      const greens = [0x4F7F3A, 0x5E8F45, 0x6C9C4E, 0x46733A, 0x78A653];
      trees.forEach(function (t, i) {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(t.x, t.y, t.z); dummy.scale.set(t.s, t.s, t.s); dummy.updateMatrix(); tMesh.setMatrixAt(i, dummy.matrix);
        dummy.position.set(t.x, t.y + 0.55 * t.s + 0.35, t.z); dummy.scale.set(t.s, t.s * 0.9, t.s); dummy.updateMatrix(); cMesh.setMatrixAt(i, dummy.matrix);
        cMesh.setColorAt(i, c.setHex(greens[Math.floor(t.g * greens.length)]));
      });
      cMesh.castShadow = true; tMesh.castShadow = true;
      scene.add(cMesh); scene.add(tMesh);

      const zoneObjs = {};
      const pickMeshes = [];
      const pickMat = new THREE.MeshBasicMaterial();
      pickMat.visible = false;
      const drape = function (geo, off) {
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)) + off);
        p.needsUpdate = true;
        return geo;
      };
      const ringCv = document.createElement('canvas');
      ringCv.width = ringCv.height = 256;
      const rx2 = ringCv.getContext('2d');
      const rgr = rx2.createRadialGradient(128, 128, 60, 128, 128, 126);
      rgr.addColorStop(0, 'rgba(255,255,255,0)'); rgr.addColorStop(0.72, 'rgba(255,255,255,0.0)'); rgr.addColorStop(0.86, 'rgba(255,255,255,0.75)'); rgr.addColorStop(0.92, 'rgba(255,255,255,1)'); rgr.addColorStop(1, 'rgba(255,255,255,0)');
      rx2.fillStyle = rgr; rx2.fillRect(0, 0, 256, 256);
      const ringTex = new THREE.CanvasTexture(ringCv);
      const lineCv = document.createElement('canvas');
      lineCv.width = lineCv.height = 256;
      const lx = lineCv.getContext('2d');
      lx.strokeStyle = 'rgba(255,255,255,0.95)'; lx.lineWidth = 5; lx.setLineDash([14, 9]);
      lx.beginPath(); lx.arc(128, 128, 112, 0, Math.PI * 2); lx.stroke();
      const lg = lx.createRadialGradient(128, 128, 20, 128, 128, 112);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,0.22)');
      lx.setLineDash([]); lx.fillStyle = lg; lx.beginPath(); lx.arc(128, 128, 112, 0, Math.PI * 2); lx.fill();
      const lineTex = new THREE.CanvasTexture(lineCv);
      const glowCv = document.createElement('canvas');
      glowCv.width = glowCv.height = 128;
      const glx = glowCv.getContext('2d');
      const glg = glx.createRadialGradient(64, 64, 0, 64, 64, 64);
      glg.addColorStop(0, 'rgba(255,255,255,0.85)'); glg.addColorStop(0.35, 'rgba(255,255,255,0.3)'); glg.addColorStop(1, 'rgba(255,255,255,0)');
      glx.fillStyle = glg; glx.fillRect(0, 0, 128, 128);
      const glowTex = new THREE.CanvasTexture(glowCv);
      ZG.forEach(function (z) {
        const top = z.base + (z.hr ? z.hr[1] * (z.tower ? 1.9 : 1) : 0.6);
        const pin = new THREE.Group();
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 28, 20), new THREE.MeshStandardMaterial({ color: 0x1B2430, roughness: 0.28, metalness: 0.15, emissive: 0x000000 }));
        head.position.y = 1.5;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.3, 24), head.material);
        tip.rotation.x = Math.PI; tip.position.y = 0.65;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, emissive: 0x777777 }));
        dot.position.set(0, 1.55, 0.55);
        const gY = heightAt(z.cx, z.cz);
        const tLen = top + 1.2 - gY;
        const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, tLen, 6), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7 }));
        tether.position.y = -tLen / 2;
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xFFFFFF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        glow.scale.set(4.2, 4.2, 1); glow.position.y = 1.4;
        pin.add(tether); pin.add(glow); pin.add(head); pin.add(tip); pin.add(dot);
        pin.position.set(z.cx, top + 1.2, z.cz);
        head.castShadow = true; tip.castShadow = true;
        scene.add(pin);
        const rad = z.rural ? 5.2 : 4.4;
        const discGeo = function () { const gg = new THREE.PlaneGeometry(rad * 2, rad * 2, 32, 32); gg.rotateX(-Math.PI / 2); gg.translate(z.cx, 0, z.cz); return drape(gg, 0.1); };
        const rtex = ringTex.clone(); rtex.needsUpdate = true;
        const ring = new THREE.Mesh(discGeo(), new THREE.MeshBasicMaterial({ map: rtex, color: 0xE0701F, transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
        const ringLine = new THREE.Mesh(discGeo(), new THREE.MeshBasicMaterial({ map: lineTex, color: 0xE0701F, transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
        ring.add(ringLine);
        ring.renderOrder = 2; ringLine.renderOrder = 3;
        scene.add(ring);
        const frame = new THREE.Group();
        const fm = new THREE.MeshBasicMaterial({ color: 0x2346A8, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
        const fw = z.X1 - z.X0, fd = z.Z1 - z.Z0;
        [[z.cx, z.Z0, fw + 0.5, 0.35], [z.cx, z.Z1, fw + 0.5, 0.35], [z.X0, z.cz, 0.35, fd], [z.X1, z.cz, 0.35, fd]].forEach(function (e) {
          const gg = new THREE.PlaneGeometry(e[2], e[3], Math.max(1, Math.round(e[2] * 2)), Math.max(1, Math.round(e[3] * 2)));
          gg.rotateX(-Math.PI / 2); gg.translate(e[0], 0, e[1]);
          const m = new THREE.Mesh(drape(gg, 0.14), fm);
          m.renderOrder = 3; frame.add(m);
        });
        scene.add(frame);
        const pick = new THREE.Mesh(new THREE.BoxGeometry(fw, 8, fd), pickMat);
        pick.position.set(z.cx, z.base + 4, z.cz);
        pick.userData.id = z.id;
        scene.add(pick); pickMeshes.push(pick);
        zoneObjs[z.id] = { z: z, pin: pin, head: head, glow: glow, ring: ring, frame: frame, top: top + 1.2 + 2.4 };
      });

      const places = [
        { id: 'mtr-pl-rio', p: new THREE.Vector3(riverXAt(-20), 0.8, -20) },
        { id: 'mtr-pl-ronda', p: new THREE.Vector3(4.2, 2.6, -12) },
        { id: 'mtr-pl-cer', p: new THREE.Vector3(15, 2.2, -27) },
        { id: 'mtr-pl-pla', p: new THREE.Vector3(38, heightAt(38, -6.6) + 1.5, -6.6) },
        { id: 'mtr-pl-tie', p: new THREE.Vector3(15, heightAt(15, 26) + 1.5, 26) },
        { id: 'mtr-pl-cat', p: new THREE.Vector3(10.5, 5.2, -1.5) },
        { id: 'mtr-pl-pte', p: new THREE.Vector3(riverXAt(3.6) + 0.6, 2.2, 3.6) },
        { id: 'mtr-pl-mer', p: new THREE.Vector3(9, 3.2, 10) },
        { id: 'mtr-pl-lom', p: new THREE.Vector3(52, heightAt(52, 4) + 2, 4) },
        { id: 'mtr-pl-cam', p: new THREE.Vector3(-46, heightAt(-46, 30) + 2, 30) }
      ];


  // ---- lo de esta página: cámara, gestos, zonas y etiquetas ----
  var ORDEN = ["mi", "ru", "ce", "no", "su"];
  var ALERTA = { mi: true, ru: true };   // las dos zonas que golpearon las lluvias de febrero de 2026 (dato real)
  var estado = { zona: null, giro: -20 * Math.PI / 180 };
  var VISTA = { tx: 2, tz: 0, ty: 0, dist: 74, el: 0.86 };
  var cur = { tx: 2, tz: 0, ty: 0, dist: 74, el: 0.86, ang: estado.giro };
  var des = { tx: 2, tz: 0, ty: 0, dist: 74, el: 0.86, ang: estado.giro };
  var zoom = 1, ZMIN = 0.45, ZMAX = 1.7;
  var ancho = 1, alto = 1, raf = 0, ultimo = 0, visible = true;

  Object.keys(zoneObjs).forEach(function (id) {
    var o = zoneObjs[id];
    o.baseY = o.pin.position.y;
    o.ring.visible = !!ALERTA[id];
  });
  function pintarZonas() {
    Object.keys(zoneObjs).forEach(function (id) {
      var o = zoneObjs[id], sel = id === estado.zona, warn = !!ALERTA[id];
      var hc = sel ? 0x2346A8 : (warn ? 0xD9621E : 0x1B2430);
      o.head.material.color.setHex(hc);
      o.head.material.emissive.setHex(hc).multiplyScalar(0.22);
      o.glow.material.color.setHex(sel ? 0x7FA0FF : (warn ? 0xFFB070 : 0xFFFFFF));
      o.glow.visible = sel || warn;
      o.pin.scale.setScalar(sel ? 1.35 : 1);
      o.frame.visible = sel;
      var b = document.getElementById("mq-zona-" + id);
      if (b) b.setAttribute("aria-pressed", String(sel));
    });
    document.querySelectorAll(".mq-ficha").forEach(function (f) { f.hidden = f.getAttribute("data-zona") !== estado.zona; });
    var general = document.getElementById("mq-general");
    if (general) general.hidden = !!estado.zona;
  }
  function apuntar() {
    var z = estado.zona ? zoneObjs[estado.zona].z : null;
    var base = z ? { tx: z.cx, tz: z.cz + 1, ty: z.base, dist: 34, el: 0.7 } : VISTA;
    des = { tx: base.tx, tz: base.tz, ty: base.ty, dist: base.dist * zoom, el: base.el, ang: estado.giro };
    pintarZonas();
    pedir();
  }
  function elegir(id) { estado.zona = id; zoom = 1; apuntar(); }

  function encajar() {
    var r = marco3d.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    ancho = r.width; alto = r.height;
    renderer.setSize(ancho, alto, false);
    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();
    pedir();
  }

  // Gestos: un dedo o el ratón, a lo ancho, gira; dos dedos acercan o alejan; un toque sin arrastrar elige zona. El
  // lienzo deja pasar el desplazamiento vertical de la página (touch-action: pan-y), así que no la atrapa.
  var punteros = {}, arrastre = null, pellizco = null;
  function cuantos() { return Object.keys(punteros).length; }
  function separacion() {
    var p = Object.keys(punteros).map(function (k) { return punteros[k]; });
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }
  canvas.addEventListener("pointerdown", function (e) {
    punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (cuantos() === 1) { arrastre = { x: e.clientX, x0: e.clientX, y0: e.clientY, movido: false }; canvas.classList.add("agarrando"); }
    if (cuantos() === 2) { pellizco = { d: separacion(), zoom: zoom }; arrastre = null; }
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!punteros[e.pointerId]) return;
    punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (pellizco && cuantos() >= 2) {
      zoom = Math.min(ZMAX, Math.max(ZMIN, pellizco.zoom * pellizco.d / Math.max(20, separacion())));
      apuntar();
      return;
    }
    if (!arrastre) return;
    var dx = e.clientX - arrastre.x;
    if (Math.abs(e.clientX - arrastre.x0) > 4 || Math.abs(e.clientY - arrastre.y0) > 4) arrastre.movido = true;
    arrastre.x = e.clientX;
    estado.giro -= dx * 0.006;
    des.ang = estado.giro;
    pedir();
  });
  function soltar(e) {
    var era = arrastre;
    delete punteros[e.pointerId];
    if (cuantos() < 2) pellizco = null;
    if (cuantos() === 0) { arrastre = null; canvas.classList.remove("agarrando"); }
    if (e.type !== "pointerup" || !era || era.movido) return;
    var rect = canvas.getBoundingClientRect();
    var ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    var ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    var hit = ray.intersectObjects(pickMeshes, false)[0];
    if (hit) elegir(hit.object.userData.id);
  }
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { canvas.addEventListener(t, soltar); });
  // La rueda sola desplaza la página; con Ctrl (o el pellizco del trackpad, que llega como Ctrl + rueda), acerca.
  canvas.addEventListener("wheel", function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom = Math.min(ZMAX, Math.max(ZMIN, zoom * Math.exp(e.deltaY * 0.0025)));
    apuntar();
  }, { passive: false });

  function boton(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener("click", fn); }
  boton("mq-vista", function () { estado.zona = null; zoom = 1; apuntar(); });
  boton("mq-izq", function () { estado.giro -= Math.PI / 4; apuntar(); });
  boton("mq-der", function () { estado.giro += Math.PI / 4; apuntar(); });
  boton("mq-mas", function () { zoom = Math.max(ZMIN, zoom / 1.25); apuntar(); });
  boton("mq-menos", function () { zoom = Math.min(ZMAX, zoom * 1.25); apuntar(); });
  boton("mq-recorrer", function () { elegir(ORDEN[(ORDEN.indexOf(estado.zona) + 1) % ORDEN.length]); });
  ORDEN.forEach(function (id) { boton("mq-zona-" + id, function () { elegir(id); }); });

  // Solo se dibuja mientras se ve: fuera de pantalla no corre nada (en otra pestaña, el navegador ya pausa los cuadros).
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; pedir(); }).observe(marco3d);
  }
  var v = new THREE.Vector3();
  function proyectar(p, el, dy) {
    if (!el) return;
    v.copy(p).project(camera);
    var ve = v.z < 1 && v.x > -1.05 && v.x < 1.05 && v.y > -1.05 && v.y < 1.05;
    el.style.transform = "translate(" + ((v.x * 0.5 + 0.5) * ancho) + "px," + ((-v.y * 0.5 + 0.5) * alto - (dy || 0)) + "px) translate(-50%,-100%)";
    el.style.visibility = ve ? "visible" : "hidden";
  }
  function quieto() {
    return Math.abs(des.tx - cur.tx) + Math.abs(des.tz - cur.tz) + Math.abs(des.ty - cur.ty) + Math.abs(des.dist - cur.dist)
      + Math.abs(des.el - cur.el) + Math.abs(des.ang - cur.ang) < 0.002;
  }
  function cuadro(t) {
    raf = 0;
    if (!visible) return;
    var time = t / 1000;
    var k = reduce ? 1 : 0.08;
    cur.tx += (des.tx - cur.tx) * k; cur.tz += (des.tz - cur.tz) * k; cur.ty += (des.ty - cur.ty) * k;
    cur.dist += (des.dist - cur.dist) * k; cur.el += (des.el - cur.el) * k;
    cur.ang += (des.ang - cur.ang) * (reduce ? 1 : 0.14);
    var dist = cur.dist * Math.max(1, 1.35 / camera.aspect);
    camera.position.set(cur.tx + Math.sin(cur.ang) * Math.cos(cur.el) * dist, cur.ty + Math.sin(cur.el) * dist,
                        cur.tz + Math.cos(cur.ang) * Math.cos(cur.el) * dist);
    camera.lookAt(cur.tx, cur.ty, cur.tz);
    var dt = ultimo ? Math.min(0.1, time - ultimo) : 0;
    ultimo = time;
    if (!reduce) {
      flowTex.offset.y = (time * 0.05) % 1;
      boats.forEach(function (b) { b.m.position.x = b.x0 + Math.sin(time * 0.35 + b.ph) * 1.0; });
      placeCars(dt);
      clouds.forEach(function (cl) { cl.position.x += dt * 1.1; if (cl.position.x > 75) cl.position.x = -75; });
      Object.keys(zoneObjs).forEach(function (id) {
        var o = zoneObjs[id];
        o.pin.position.y = o.baseY + Math.sin(time * 1.6 + o.z.cx) * 0.25;
        if (o.ring.visible) {
          var ph = (time * 0.45 + o.z.cz * 0.05) % 1, s0 = 1 / (0.45 + ph * 0.75);
          var tx0 = o.ring.material.map; tx0.repeat.set(s0, s0); tx0.offset.set(0.5 - 0.5 * s0, 0.5 - 0.5 * s0);
          o.ring.material.opacity = 0.95 * (1 - ph * ph);
        }
        o.glow.material.opacity = 0.55 + 0.35 * Math.sin(time * 2.2 + o.z.cx);
      });
    }
    renderer.render(scene, camera);
    Object.keys(zoneObjs).forEach(function (id) {
      var o = zoneObjs[id];
      proyectar(new THREE.Vector3(o.z.cx, o.pin.position.y + 2.4, o.z.cz), document.getElementById("mq-zona-" + id), 4);
    });
    places.forEach(function (pl) { proyectar(pl.p, document.getElementById(pl.id.replace("mtr-pl-", "mq-hito-")), 0); });
    var brujula = document.getElementById("mq-brujula");
    if (brujula) brujula.style.transform = "rotate(" + cur.ang + "rad)";
    if (!reduce || !quieto()) pedir();   // con «reducir movimiento» se detiene cuando la cámara llega
  }
  function pedir() { if (!raf && visible) raf = requestAnimationFrame(cuadro); }
  encajar();
  if (window.ResizeObserver) new ResizeObserver(encajar).observe(marco3d);
  pintarZonas();
  apuntar();
  document.documentElement.classList.add("mq-lista");
})();
