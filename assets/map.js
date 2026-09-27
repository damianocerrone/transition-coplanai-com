/* CoPlanAI — the map. One data set, many fills.
 *
 *   CoplanMap.render(el, {
 *     fill:        'keynote-dark' | 'keynote-light' | 'stipple' | 'field' | 'hatch' | 'washes'
 *                  | 'hex' | 'halftone' | 'outline' | 'contour'          (default 'stipple')
 *     crop:        'keynote' | 'europe' | 'world'                         (default 'keynote')
 *     marks:       'task' | 'ink'   colour each city by its most frequent framework task, or one ink
 *     labels:      true | false     keynote-style country callouts (auto-off below 640px)
 *     interactive: true | false     hover / focus tooltip, arrow keys between cities
 *     totals:      true | false     the big numbers (engagements · cities · countries), bound to data
 *     seed:        integer          the stipple / field noise is deterministic for a given seed
 *     onrender:    function(ctrl)   called after every draw (first render, update, resize)
 *   })  -> controller {el, opts, ms, count, outside, update(opts), showTip(node), hideTip(), destroy()}
 *          ms = last draw time; count = dots drawn (stipple, field); outside = places beyond the frame
 *
 *   CoplanMap.fills        [{key, name, idea, dark}]      CoplanMap.crops   [{key, name}]
 *   CoplanMap.aspect(crop) width / height of a frame, to reserve space before drawing
 *   CoplanMap.inside(crop) the places a frame shows     CoplanMap.taskColours()  mark / text / base colours
 *
 * Re-renders itself on resize (ResizeObserver, debounced). Fields, masks and blue-noise points are
 * cached per frame and width, so switching fill or disc colour on the same map is a few ms.
 *
 * Needs data/land.js (window.COPLAN_LAND) and data/places.js (window.COPLAN_PLACES,
 * COPLAN_COUNTRIES, COPLAN_MAP_TOTALS). Uses data/matrix.js (window.COPLAN) when present for the
 * task colours (derived from the four poles), the reach numbers and the engagement titles.
 * The land and the texture are drawn to a canvas (devicePixelRatio aware); the cities, callouts and
 * numbers are an SVG / HTML layer, so they stay crisp, focusable and in the page's own type.
 * Never shows era or the retired company: the data files do not carry either.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ small utilities */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexRGB(h) {
    h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgbStr(c, a) {
    var r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2]);
    return a == null ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + (+a).toFixed(3) + ')';
  }
  function mixRGB(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function r1(v) { return Math.round(v * 10) / 10; }

  /* ------------------------------------------------------------------ colour */
  var TASKS = ['imagine', 'test', 'shape', 'improve'];
  var CH = { imagine: 0, test: 1, shape: 2, improve: 3, none: 4 };
  var TASK_LABEL = { imagine: 'Futuring', test: 'Scenario planning', shape: 'Co-design', improve: 'Design review', none: 'Other engagements' };
  /* fallbacks = COPLAN.quadrantColours(Ember & Ice), used only if data/matrix.js is absent */
  var FALLBACK = { imagine: '#FFB482', test: '#B6DCDC', shape: '#A45A6A', improve: '#3D80C5' };
  var PAL = null;
  function palette() {
    if (PAL) return PAL;
    var C = window.COPLAN, Q = FALLBACK;
    try { if (C && C.data && C.data.poles) Q = C.quadrantColours(C.data.poles); } catch (e) { /* keep fallback */ }
    function readable(hex, t) { try { return C ? C.readable(hex, '#FFFFFF', t) : hex; } catch (e) { return hex; } }
    PAL = { base: {}, mark: {}, text: {}, dark: {}, darkText: {}, rgb: {} };
    function mixHex(a, b, t) { try { return C ? C.mix(a, b, t) : a; } catch (e) { return a; } }
    TASKS.forEach(function (k) {
      PAL.base[k] = Q[k];
      PAL.mark[k] = readable(Q[k], 3.0);      /* a disc on white: 3:1 for graphics */
      PAL.text[k] = readable(Q[k], 4.8);      /* a label on white (the site's --qi-* rule) */
      PAL.dark[k] = mixHex(Q[k], '#FFFFFF', 0.12);        /* a disc on the dark keynote ground */
      PAL.darkText[k] = mixHex(Q[k], '#FFFFFF', 0.42);    /* a label on the dark ground */
      PAL.rgb[k] = hexRGB(Q[k]);
    });
    PAL.base.none = '#A3ACB6'; PAL.mark.none = '#7C8591'; PAL.text.none = '#555C66'; PAL.dark.none = '#9FB0C2'; PAL.darkText.none = '#DDE5EE';
    PAL.rgb.none = hexRGB('#A3ACB6');
    PAL.ink = '#14171C';
    return PAL;
  }

  /* ------------------------------------------------------------------ land */
  var LAND = null;
  function land() {
    if (LAND) return LAND;
    var L = window.COPLAN_LAND;
    if (!L) throw new Error('CoplanMap: data/land.js is not loaded');
    var q = L.q || 100;
    function dec(a) {
      var out = new Float64Array(a.length), x = 0, y = 0;
      for (var i = 0; i < a.length; i += 2) { x += a[i]; y += a[i + 1]; out[i] = x / q; out[i + 1] = y / q; }
      return out;
    }
    LAND = {
      land: L.land.map(dec),
      countries: (L.countries || []).map(function (c) { return { name: c.name, rings: c.rings.map(dec) }; })
    };
    return LAND;
  }

  /* ------------------------------------------------------------------ Robinson, as in the keynote */
  var RX = [1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730, 0.9600, 0.9427, 0.9216, 0.8962, 0.8679, 0.8350, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322];
  var RY = [0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100, 0.3720, 0.4340, 0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1.0000];
  var D2R = Math.PI / 180;
  function rob(lon, lat, out) {
    var a = Math.min(Math.abs(lat), 90) / 5, i = Math.min(a | 0, 17), f = a - i;
    out[0] = 0.8487 * (RX[i] + (RX[i + 1] - RX[i]) * f) * lon * D2R;
    out[1] = 1.3523 * (RY[i] + (RY[i + 1] - RY[i]) * f) * (lat < 0 ? -1 : 1);
    return out;
  }

  /* The keynote frame: lon -90..129, lat -6..82, fitted by width, pushed north by 250/3300.
     `k` scales the keynote's own pixel rules (mark radius, glow sigma, callouts) from its 5800px canvas. */
  var CROPS = {
    keynote: { name: 'Keynote frame', lon: [-90, 129], lat: [-6, 82], lon0: 0, aspect: 5800 / 3300, pad: 0.018, yshift: 250 / 3300, markK: 1.2, glowK: 1, numbers: 'top' },
    europe: { name: 'Europe', lon: [-11, 51], lat: [28.5, 71.5], lon0: 17, aspect: null, pad: 0.025, yshift: 0, markK: 2.1, glowK: 1.35, numbers: 'left' },
    world: { name: 'World', lon: [-180, 180], lat: [-56, 84], lon0: 0, aspect: null, pad: 0.01, yshift: 0, markK: 1.25, glowK: 0.95, numbers: 'bottom-left' }
  };

  function fitCrop(crop, W) {
    var c = CROPS[crop] || CROPS.keynote, p = [0, 0], x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, i, t;
    function take(lon, lat) { rob(lon - c.lon0, lat, p); if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    for (i = 0; i <= 40; i++) {
      t = i / 40;
      take(c.lon[0] + (c.lon[1] - c.lon[0]) * t, c.lat[0]); take(c.lon[0] + (c.lon[1] - c.lon[0]) * t, c.lat[1]);
      take(c.lon[0], c.lat[0] + (c.lat[1] - c.lat[0]) * t); take(c.lon[1], c.lat[0] + (c.lat[1] - c.lat[0]) * t);
    }
    if (c.lat[0] < 0 && c.lat[1] > 0) { take(c.lon[0], 0); take(c.lon[1], 0); }
    var bw = x1 - x0, bh = y1 - y0;
    var aspect = c.aspect || (bw * (1 + 2 * c.pad)) / (bh * (1 + 2 * c.pad));
    var H = Math.max(120, Math.round(W / aspect));
    var s = Math.min(W * (1 - 2 * c.pad) / bw, H * (1 - 2 * c.pad) / bh);
    var cx = W / 2 - (x0 + x1) / 2 * s, cy = H / 2 + (y0 + y1) / 2 * s + c.yshift * H;
    var q = [0, 0];
    return {
      crop: c, key: crop, W: W, H: H, s: s,
      proj: function (lon, lat) { rob(lon - c.lon0, lat, q); return [cx + q[0] * s, cy - q[1] * s]; }
    };
  }

  /* ------------------------------------------------------------------ the geometry cache (per crop + width) */
  var GEO = {};
  function geo(crop, W) {
    var key = crop + '|' + W;
    if (GEO[key]) return GEO[key];
    var F = fitCrop(crop, W), L = land(), W_ = F.W, H = F.H, i, j;
    var cc = F.crop;
    function ringPath(path, r) {
      var p = F.proj(r[0], r[1]); path.moveTo(p[0], p[1]);
      for (var k = 2; k < r.length; k += 2) { p = F.proj(r[k], r[k + 1]); path.lineTo(p[0], p[1]); }
      path.closePath();
    }
    var landPath = new Path2D();
    L.land.forEach(function (r) { ringPath(landPath, r); });
    var countryPaths = {};
    L.countries.forEach(function (c) { var p = new Path2D(); c.rings.forEach(function (r) { ringPath(p, r); }); countryPaths[c.name] = p; });

    /* land mask at 1 css px */
    var mc = document.createElement('canvas'); mc.width = W_; mc.height = H;
    var mx = mc.getContext('2d', { willReadFrequently: true });
    mx.fillStyle = '#000'; mx.fill(landPath);
    var id = mx.getImageData(0, 0, W_, H).data, mask = new Uint8Array(W_ * H);
    for (i = 0, j = 3; i < mask.length; i++, j += 4) mask[i] = id[j] > 110 ? 1 : 0;

    /* marks: one disc per city, the keynote's radius rule, a capped nudge so twins stay legible */
    var k = W_ / 5800, P = window.COPLAN_PLACES || [];
    var marks = P.map(function (p, idx) {
      var xy = F.proj(p.lon, p.lat), n = p.n || 1;
      var r = Math.max(1.9 + 0.85 * Math.sqrt(n), (10 + 4.4 * Math.sqrt(n)) * k * cc.markK);
      return { i: idx, p: p, n: n, task: p.task || 'none', hx: xy[0], hy: xy[1], x: xy[0], y: xy[1], r: r };
    });
    relax(marks);
    /* z = how far this crop is zoomed in relative to the keynote frame at the same width;
       t = the texture unit (px): spacing grows gently with zoom so the dot count stays bounded */
    var z = crop === 'keynote' ? 1 : F.s / fitCrop('keynote', W_).s, u = W_ / 1300;
    var G = {
      key: key, crop: crop, c: cc, W: W_, H: H, k: k, u: u, z: z, t: Math.max(0.55, Math.min(1.35, u)) * Math.pow(z, 0.32),
      proj: F.proj, s: F.s, landPath: landPath, countryPaths: countryPaths, mask: mask, marks: marks, cache: {}
    };
    GEO[key] = G;
    return G;
  }

  function relax(marks) {
    var n = marks.length, it, a, b, i, j, dx, dy, d, want, push, moved;
    for (it = 0; it < 80; it++) {
      moved = false;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        a = marks[i]; b = marks[j];
        dx = b.x - a.x; dy = b.y - a.y; d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        want = a.r + b.r + 0.8;
        if (d >= want) continue;
        push = (want - d) / 2; dx /= d; dy /= d;
        a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; moved = true;
      }
      for (i = 0; i < n; i++) {           /* never further than about one radius from the truth */
        a = marks[i]; dx = a.x - a.hx; dy = a.y - a.hy; d = Math.sqrt(dx * dx + dy * dy);
        var cap = Math.max(2.5, a.r * 0.9);
        if (d > cap) { a.x = a.hx + dx / d * cap; a.y = a.hy + dy / d * cap; }
      }
      if (!moved) break;
    }
  }

  function inland(G, x, y) {
    x = x | 0; y = y | 0;
    return x >= 0 && y >= 0 && x < G.W && y < G.H && G.mask[y * G.W + x] === 1;
  }

  /* ------------------------------------------------------------------ fields */
  /* The engagement field: a sum of gaussians, one per city (sigma and amplitude from the keynote's
     glow_field), kept per task so a fill can take the local hue. Tone-mapped 1 - exp(-1.25 v). */
  var RES = 3;
  function field(G, sk) {
    var key = 'field' + sk;
    if (G.cache[key]) return G.cache[key];
    var gw = Math.ceil(G.W / RES) + 2, gh = Math.ceil(G.H / RES) + 2, N = gw * gh;
    var ch = new Float32Array(N * 5), tot = new Float32Array(N);
    G.marks.forEach(function (m) {
      var sig = (34 + 17 * Math.sqrt(m.n)) * G.k * G.c.glowK * sk, amp = 0.40 + 0.15 * Math.sqrt(m.n);
      sig = Math.max(sig, 5 * sk);
      var gx = m.hx / RES, gy = m.hy / RES, sg = sig / RES, R = Math.ceil(sg * 3), c = CH[m.task];
      var inv = 1 / (2 * sg * sg), j0 = Math.max(0, Math.floor(gy - R)), j1 = Math.min(gh - 1, Math.ceil(gy + R));
      var i0 = Math.max(0, Math.floor(gx - R)), i1 = Math.min(gw - 1, Math.ceil(gx + R));
      for (var j = j0; j <= j1; j++) {
        var dy = j - gy;
        for (var i = i0; i <= i1; i++) {
          var dx = i - gx, d2 = dx * dx + dy * dy;
          if (d2 > R * R) continue;
          ch[(j * gw + i) * 5 + c] += amp * Math.exp(-d2 * inv);
        }
      }
    });
    for (var q = 0; q < N; q++) {
      var s = ch[q * 5] + ch[q * 5 + 1] + ch[q * 5 + 2] + ch[q * 5 + 3] + ch[q * 5 + 4];
      tot[q] = 1 - Math.exp(-s * 1.25);
    }
    var F = { gw: gw, gh: gh, ch: ch, tot: tot };
    F.at = function (x, y) {
      var fx = x / RES, fy = y / RES, i = fx | 0, j = fy | 0;
      if (i < 0 || j < 0 || i >= gw - 1 || j >= gh - 1) return 0;
      var tx = fx - i, ty = fy - j, o = j * gw + i;
      return (tot[o] * (1 - tx) + tot[o + 1] * tx) * (1 - ty) + (tot[o + gw] * (1 - tx) + tot[o + gw + 1] * tx) * ty;
    };
    F.dom = function (x, y) {                        /* the task that dominates here (4 = none yet) */
      var i = clamp(Math.round(x / RES), 0, gw - 1), j = clamp(Math.round(y / RES), 0, gh - 1), o = (j * gw + i) * 5, best = 4, bv = 0;
      for (var c = 0; c < 5; c++) if (ch[o + c] > bv) { bv = ch[o + c]; best = c; }
      return best;
    };
    G.cache[key] = F;
    return F;
  }

  /* distance inland from the coast, in css px (chamfer 3-4 on a 2px grid) */
  function coastDist(G) {
    if (G.cache.coast) return G.cache.coast;
    var r = 2, gw = Math.ceil(G.W / r), gh = Math.ceil(G.H / r), N = gw * gh, d = new Float32Array(N), i, j, o, BIG = 1e6;
    for (j = 0; j < gh; j++) for (i = 0; i < gw; i++) d[j * gw + i] = inland(G, i * r + 1, j * r + 1) ? BIG : 0;
    for (j = 0; j < gh; j++) for (i = 0; i < gw; i++) {
      o = j * gw + i; if (!d[o]) continue; var v = d[o];
      if (i > 0) v = Math.min(v, d[o - 1] + 3);
      if (j > 0) { v = Math.min(v, d[o - gw] + 3); if (i > 0) v = Math.min(v, d[o - gw - 1] + 4); if (i < gw - 1) v = Math.min(v, d[o - gw + 1] + 4); }
      d[o] = v;
    }
    for (j = gh - 1; j >= 0; j--) for (i = gw - 1; i >= 0; i--) {
      o = j * gw + i; if (!d[o]) continue; var w = d[o];
      if (i < gw - 1) w = Math.min(w, d[o + 1] + 3);
      if (j < gh - 1) { w = Math.min(w, d[o + gw] + 3); if (i < gw - 1) w = Math.min(w, d[o + gw + 1] + 4); if (i > 0) w = Math.min(w, d[o + gw - 1] + 4); }
      d[o] = w;
    }
    var C = { at: function (x, y) { var i = clamp((x / r) | 0, 0, gw - 1), j = clamp((y / r) | 0, 0, gh - 1); var v = d[j * gw + i]; return v >= BIG ? 999 : v / 3 * r; } };
    G.cache.coast = C;
    return C;
  }

  /* Poisson-disc (Bridson) over land with a radius that varies across the map: blue noise, never a grid.
     Typed arrays and a flat grid: ~10k points in well under 100ms. */
  function poisson(G, key, radiusAt, rmin, rmax, seed) {
    if (G.cache[key]) return G.cache[key];
    var rand = mulberry32(seed), W = G.W, H = G.H, cell = rmin / Math.SQRT2, mask = G.mask;
    var gw = Math.ceil(W / cell), gh = Math.ceil(H / cell), grid = new Int32Array(gw * gh).fill(-1);
    var cap = Math.min(400000, Math.ceil(W * H / (rmin * rmin * 0.7)) + 16);
    var xs = new Float32Array(cap), ys = new Float32Array(cap), rs = new Float32Array(cap), active = new Int32Array(cap);
    var n = 0, na = 0, K = 10, fixed = typeof radiusAt === 'number' ? radiusAt : 0;
    function fits(x, y, r) {
      if (x < 0 || y < 0 || x >= W || y >= H || mask[(y | 0) * W + (x | 0)] !== 1) return false;
      var gi = (x / cell) | 0, gj = (y / cell) | 0, reach = Math.ceil((r + rmax) * 0.5 / cell);
      var j0 = gj - reach < 0 ? 0 : gj - reach, j1 = gj + reach >= gh ? gh - 1 : gj + reach;
      var i0 = gi - reach < 0 ? 0 : gi - reach, i1 = gi + reach >= gw ? gw - 1 : gi + reach;
      for (var j = j0; j <= j1; j++) {
        var row = j * gw;
        for (var i = i0; i <= i1; i++) {
          var q = grid[row + i]; if (q < 0) continue;
          var dx = xs[q] - x, dy = ys[q] - y, m = (r + rs[q]) * 0.5;
          if (dx * dx + dy * dy < m * m) return false;
        }
      }
      return true;
    }
    function add(x, y, r) {
      if (n >= cap) return;
      xs[n] = x; ys[n] = y; rs[n] = r;
      grid[((y / cell) | 0) * gw + ((x / cell) | 0)] = n; active[na++] = n; n++;
    }
    function grow() {
      while (na) {
        var ai = (rand() * na) | 0, q = active[ai], placed = false;
        for (var t = 0; t < K; t++) {
          var ang = rand() * 6.283185307, rr = rs[q] * (1 + rand());
          var x = xs[q] + Math.cos(ang) * rr, y = ys[q] + Math.sin(ang) * rr;
          if (x < 0 || y < 0 || x >= W || y >= H || mask[(y | 0) * W + (x | 0)] !== 1) continue;
          var r = fixed || radiusAt(x, y);
          if (fits(x, y, r)) { add(x, y, r); placed = true; break; }
        }
        if (!placed) active[ai] = active[--na];
      }
    }
    /* seed every island: scan in raster order, start wherever nothing has reached yet */
    var step = Math.max(2, rmax * 0.8);
    for (var y = step / 2; y < H; y += step)
      for (var x = step / 2; x < W; x += step) {
        if (mask[(y | 0) * W + (x | 0)] !== 1) continue;
        var jx = x + (rand() - 0.5) * step * 0.5, jy = y + (rand() - 0.5) * step * 0.5, r0 = fixed || radiusAt(jx, jy);
        if (fits(jx, jy, r0)) { add(jx, jy, r0); grow(); }
      }
    var out = { x: xs.subarray(0, n), y: ys.subarray(0, n), r: rs.subarray(0, n), n: n };
    G.cache[key] = out;
    return out;
  }

  /* ------------------------------------------------------------------ fills */
  function drawGraticule(ctx, G, step, colour, lw) {
    var lon, lat, p;
    ctx.save(); ctx.strokeStyle = colour; ctx.lineWidth = lw; ctx.beginPath();
    for (lon = -180; lon <= 180; lon += step) {
      for (lat = -80; lat <= 84; lat += 2) { p = G.proj(lon, lat); if (lat === -80) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    }
    for (lat = -75; lat <= 75; lat += step) {
      for (lon = -180; lon <= 180; lon += 3) { p = G.proj(lon, lat); if (lon === -180) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    }
    ctx.stroke(); ctx.restore();
  }

  function channelColours(which, ink) {
    if (ink) { var c = hexRGB(ink); return [c, c, c, c, c]; }
    var P = palette(), src = which === 'mark' ? P.mark : P.base;
    return [hexRGB(src.imagine), hexRGB(src.test), hexRGB(src.shape), hexRGB(src.improve), hexRGB(src.none)];
  }
  /* on the dark ground the glow takes the deeper colours, so overlaps bloom in colour, not to white */
  function glowColours(ink) {
    if (ink) { var c = hexRGB(ink); return [c, c, c, c, c]; }
    var P = palette();
    return [hexRGB(P.mark.imagine), hexRGB(P.base.test), hexRGB(P.mark.shape), hexRGB(P.mark.improve), hexRGB('#5E7C9C')];
  }

  /* an image the size of the field grid, drawn smoothed to the canvas (optionally a second, land-only layer) */
  function fieldImage(G, F, pixel) {
    var gw = F.gw, gh = F.gh, N = gw * gh, a = document.createElement('canvas'), b = document.createElement('canvas');
    a.width = b.width = gw; a.height = b.height = gh;
    var ia = a.getContext('2d').createImageData(gw, gh), ib = b.getContext('2d').createImageData(gw, gh), out = [0, 0, 0, 0, 0];
    for (var q = 0; q < N; q++) {
      if (!pixel(q, out)) continue;
      var p = q * 4;
      ia.data[p] = ib.data[p] = out[0]; ia.data[p + 1] = ib.data[p + 1] = out[1]; ia.data[p + 2] = ib.data[p + 2] = out[2];
      ia.data[p + 3] = out[3] * 255; ib.data[p + 3] = out[4] * 255;
    }
    a.getContext('2d').putImageData(ia, 0, 0); b.getContext('2d').putImageData(ib, 0, 0);
    return { sea: a, land: b };
  }
  function drawField(ctx, G, img, op) {
    var d = -RES / 2, w = img.sea.width * RES, h = img.sea.height * RES;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (op) ctx.globalCompositeOperation = op;
    ctx.drawImage(img.sea, d, d, w, h);
    ctx.clip(G.landPath); ctx.drawImage(img.land, d, d, w, h);
    ctx.restore();
  }

  /* the keynote's glow: per-channel accumulate, tone-map; dark adds light, light tints (cached per frame) */
  function glow(G, ctx, cols, mode) {
    var key = 'glow-' + mode + '-' + cols.map(function (c) { return c.join(','); }).join('|');
    var F = field(G, 1), ch = F.ch;
    var img = G.cache[key] || (G.cache[key] = fieldImage(G, F, function (q, out) {
      var r = 0, g = 0, b = 0, o = q * 5;
      for (var c = 0; c < 5; c++) { var v = ch[o + c]; if (!v) continue; r += v * cols[c][0] / 255; g += v * cols[c][1] / 255; b += v * cols[c][2] / 255; }
      if (!(r + g + b)) return false;
      r = 1 - Math.exp(-r * 1.25); g = 1 - Math.exp(-g * 1.25); b = 1 - Math.exp(-b * 1.25);
      if (mode === 'dark') {          /* opaque light; 'lighter' adds it at 0.17 on sea, 0.17 + 0.36 on land (as the keynote) */
        out[0] = r * 255; out[1] = g * 255; out[2] = b * 255; out[3] = 1; out[4] = 1; return true;
      }
      var m = Math.max(r, g, b); if (m < 1e-3) return false;
      var aS = Math.min(0.88, m * 0.30), aL = Math.min(0.88, m * 0.85);
      out[0] = r / m * 168; out[1] = g / m * 168; out[2] = b / m * 168; out[3] = aS; out[4] = 1 - (1 - aL) / (1 - aS);
      return true;
    }));
    if (mode === 'dark') {
      var d = -RES / 2, w = img.sea.width * RES, h = img.sea.height * RES;
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.17; ctx.drawImage(img.sea, d, d, w, h);
      ctx.clip(G.landPath); ctx.globalAlpha = 0.36; ctx.drawImage(img.sea, d, d, w, h);
      ctx.restore();
    } else drawField(ctx, G, img);
  }

  var FILLS = {
    'keynote-dark': {
      name: 'Keynote, dark', dark: true, markStyle: 'keynote',
      idea: 'The original from the Royal Danish Academy: a dark ground, a soft coloured glow where the work is, small solid dots.',
      draw: function (ctx, G, o) {
        ctx.fillStyle = '#0B0D12'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#1A1E26'; ctx.fill(G.landPath);
        ctx.strokeStyle = 'rgba(54,60,72,.85)'; ctx.lineWidth = 0.8; ctx.stroke(G.landPath);
        glow(G, ctx, glowColours(o.marks === 'ink' ? '#FDC474' : null), 'dark');
      }
    },
    'keynote-light': {
      name: 'Keynote, light', markStyle: 'keynote-light',
      idea: 'The keynote translated to white: pale cool land, the glow turned into a tint, dark-cored dots.',
      draw: function (ctx, G, o) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#E7EAEE'; ctx.fill(G.landPath);
        ctx.strokeStyle = '#D0D5DC'; ctx.lineWidth = 0.8; ctx.stroke(G.landPath);
        glow(G, ctx, o.marks === 'ink' ? channelColours(null, '#6D8FB0') : channelColours('base'), 'light');
      }
    },
    'stipple': {
      name: 'Stipple',
      idea: 'Blue-noise dots, never a grid: the land is stippled more densely along the coasts and most densely where we have worked.',
      draw: function (ctx, G, o) {
        var F = field(G, 1.6), C = coastDist(G), t = G.t;
        var rFar = 7.2 * t, rCoast = 4.8 * t, rNear = 2.7 * t;
        var pts = G.cache['stipple' + o.seed] || (function () {
          /* the radius, sampled once on the field grid: coast pulls it in, our places pull it in further */
          var gw = F.gw, gh = F.gh, RG = new Float32Array(gw * gh);
          for (var j = 0; j < gh; j++) for (var i = 0; i < gw; i++) {
            var x = i * RES, y = j * RES, coast = Math.exp(-C.at(x, y) / (7 * t)), r = rFar + (rCoast - rFar) * coast;
            RG[j * gw + i] = r + (rNear - r) * Math.min(1, F.tot[j * gw + i] * 1.3);
          }
          return poisson(G, 'stipple' + o.seed, function (x, y) { return RG[((y / RES + 0.5) | 0) * gw + ((x / RES + 0.5) | 0)]; }, rNear, rFar, o.seed);
        })();
        var tones = ['#B9C1CA', '#A0A9B3', '#848E99', '#66707B'], paths = tones.map(function () { return new Path2D(); });
        var dotR = 1.0 * Math.min(1.3, t);
        for (var i = 0; i < pts.n; i++) {
          var f = F.at(pts.x[i], pts.y[i]), k = Math.min(3, (f * 4.4) | 0), p = paths[k];
          p.moveTo(pts.x[i] + dotR, pts.y[i]); p.arc(pts.x[i], pts.y[i], dotR, 0, 6.2832);
        }
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        paths.forEach(function (p, k) { ctx.fillStyle = tones[k]; ctx.fill(p); });
        G.lastCount = pts.n;
      }
    },
    'field': {
      name: 'Field',
      idea: 'A quiet heat field: blue-noise dots in one ink that swell and darken toward our places, and shrink to specks far away.',
      draw: function (ctx, G, o) {
        var F = field(G, 1.9), t = G.t, sp = 5.6 * t;
        var pts = poisson(G, 'field' + o.seed, sp, sp, sp, o.seed + 11);
        var light = [196, 202, 209], deep = [52, 80, 110], LV = 10, fills = [], paths = [], l;
        for (l = 0; l < LV; l++) { fills.push(rgbStr(mixRGB(light, deep, Math.pow(l / (LV - 1), 0.85)))); paths.push(null); }
        for (var i = 0; i < pts.n; i++) {
          var x = pts.x[i], y = pts.y[i], f = F.at(x, y);
          var r = (0.55 + 1.65 * Math.pow(f, 0.9)) * Math.min(1.25, t);
          var b = Math.min(LV - 1, (f * LV) | 0), p = paths[b] || (paths[b] = new Path2D());
          p.moveTo(x + r, y); p.arc(x, y, r, 0, 6.2832);
        }
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        paths.forEach(function (p, k) { if (p) { ctx.fillStyle = fills[k]; ctx.fill(p); } });
        G.lastCount = pts.n;
      }
    },
    'hatch': {
      name: 'Hatch',
      idea: 'Horizontal scanlines over land, their weight rising toward the places we have worked: an engraver’s map.',
      draw: function (ctx, G) {
        var F = field(G, 1.7), gap = Math.max(3, 3.7 * G.t), path = new Path2D(), W = G.W, mask = G.mask;
        for (var y = gap / 2; y < G.H; y += gap) {
          var run0 = -1, runQ = 0, row = (y | 0) * W;
          for (var x = 0; x <= W; x++) {
            var q = 0;
            if (x < W && mask[row + x] === 1) q = Math.min(gap - 0.9, Math.round((0.45 + 2.0 * F.at(x, y)) * 4) / 4);
            if (q !== runQ) { if (runQ > 0) path.rect(run0, y - runQ / 2, x - run0, runQ); run0 = x; runQ = q; }
          }
        }
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#8D97A2'; ctx.fill(path);
      }
    },
    'washes': {
      name: 'Washes',
      idea: 'Flat pale land and soft Commons colour washes pooled around the work, tinting toward light, never pooling into ink.',
      draw: function (ctx, G, o) {
        var F = field(G, 2.6), ch = F.ch, cols = o.marks === 'ink' ? channelColours(null, '#8FB1D0') : channelColours('base');
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#EDF0F3'; ctx.fill(G.landPath);
        var wkey = 'washes-' + (o.marks === 'ink' ? 'ink' : 'task');
        var img = G.cache[wkey] || (G.cache[wkey] = fieldImage(G, F, function (q, out) {
          var f = F.tot[q]; if (f < 0.004) return false;
          var o5 = q * 5, r = 0, g = 0, b = 0, w = 0;
          for (var c = 0; c < 5; c++) { var v = ch[o5 + c]; if (!v) continue; v = v * v * v; r += cols[c][0] * v; g += cols[c][1] * v; b += cols[c][2] * v; w += v; }
          out[0] = r / w; out[1] = g / w; out[2] = b / w;
          var a = Math.min(0.62, f * 0.72); out[3] = a * 0.42; out[4] = 1 - (1 - a) / (1 - out[3]);
          return true;
        }));
        drawField(ctx, G, img);
        ctx.strokeStyle = '#D5DBE2'; ctx.lineWidth = 0.75; ctx.stroke(G.landPath);
      }
    },
    'hex': {
      name: 'Hex tiles',
      idea: 'Land cut into small hexagons, each tinted by how close it sits to our work: a quiet choropleth with no borders.',
      draw: function (ctx, G, o) {
        var F = field(G, 1.5), R = 4.5 * G.t, w = Math.sqrt(3) * R, h = 1.5 * R, sR = R * 0.86;
        var cols = o.marks === 'ink' ? channelColours(null, '#3F6388') : channelColours('base'), base = [232, 235, 239];
        var LV = 9, fills = [], lists = [], vx = [], vy = [], k, c, l;
        for (c = 0; c < 5; c++) for (l = 0; l < LV; l++) { fills.push(rgbStr(mixRGB(base, cols[c], l ? 0.08 + 0.6 * Math.pow(l / (LV - 1), 1.1) : 0))); lists.push(null); }
        for (k = 0; k < 6; k++) { var a = D2R * (60 * k - 30); vx.push(Math.cos(a) * sR); vy.push(Math.sin(a) * sR); }
        for (var row = 0, y = 0; y < G.H + R; row++, y = row * h) {
          for (var x = (row % 2) * w / 2; x < G.W + w; x += w) {
            if (!inland(G, x, y) && !inland(G, x, y - R * 0.5) && !inland(G, x, y + R * 0.5)) continue;
            var f = F.at(x, y), dom = F.dom(x, y), lv = f < 0.03 ? 0 : Math.min(LV - 1, 1 + ((f * (LV - 1)) | 0));
            var b = dom * LV + lv; (lists[b] || (lists[b] = [])).push(x, y);
          }
        }
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        lists.forEach(function (L, i) {
          if (!L) return;
          ctx.fillStyle = fills[i];
          for (var q = 0; q < L.length; q += 2) {
            ctx.beginPath(); ctx.moveTo(L[q] + vx[0], L[q + 1] + vy[0]);
            for (var m = 1; m < 6; m++) ctx.lineTo(L[q] + vx[m], L[q + 1] + vy[m]);
            ctx.fill();
          }
        });
      }
    },
    'halftone': {
      name: 'Halftone',
      idea: 'A printed atlas: a screen turned 30°, its dots heaviest at the coast and fading inland; the data lives only in the discs.',
      draw: function (ctx, G) {
        var C = coastDist(G), t = G.t, sp = 5.2 * t, ang = 30 * D2R, ca = Math.cos(ang), sa = Math.sin(ang);
        var diag = Math.sqrt(G.W * G.W + G.H * G.H), path = new Path2D(), cx0 = G.W / 2, cy0 = G.H / 2;
        for (var j = -diag / 2; j < diag / 2; j += sp) for (var i = -diag / 2; i < diag / 2; i += sp) {
          var x = cx0 + i * ca - j * sa, y = cy0 + i * sa + j * ca;
          if (x < -2 || y < -2 || x > G.W + 2 || y > G.H + 2 || !inland(G, x, y)) continue;
          var tone = 0.14 + 0.86 * Math.exp(-C.at(x, y) / (9 * t));
          var r = sp * 0.5 * Math.sqrt(tone) * 0.92; if (r < 0.35) continue;
          path.moveTo(x + r, y); path.arc(x, y, r, 0, 6.2832);
        }
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#B3BBC5'; ctx.fill(path);
      }
    },
    'outline': {
      name: 'Outline',
      idea: 'Only a coastline and a faint graticule; the countries we have worked in carry the palest tint.',
      draw: function (ctx, G) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        drawGraticule(ctx, G, G.crop === 'europe' ? 5 : 15, '#EBEEF2', 0.75);
        ctx.fillStyle = '#FFFFFF'; ctx.fill(G.landPath);
        ctx.fillStyle = '#EEF1F5'; for (var n in G.countryPaths) ctx.fill(G.countryPaths[n]);
        ctx.strokeStyle = '#A6AFB9'; ctx.lineWidth = 0.8; ctx.lineJoin = 'round'; ctx.stroke(G.landPath);
      }
    },
    'contour': {
      name: 'Contours',
      idea: 'Pale land and the engagement field drawn as isolines, as if the ground rose where the work is.',
      draw: function (ctx, G) {
        var F = field(G, 2.4), levels = [0.10, 0.22, 0.36, 0.52, 0.68, 0.84], gw = F.gw, gh = F.gh, T = F.tot;
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#EEF1F4'; ctx.fill(G.landPath);
        ctx.strokeStyle = '#D4DAE1'; ctx.lineWidth = 0.7; ctx.stroke(G.landPath);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        levels.forEach(function (L, li) {
          var path = new Path2D();
          for (var j = 0; j < gh - 1; j++) for (var i = 0; i < gw - 1; i++) {
            var o = j * gw + i, a = T[o], b = T[o + 1], c = T[o + gw + 1], d = T[o + gw];
            var idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            var x = i * RES, y = j * RES, pts = {
              t: [x + RES * (L - a) / (b - a), y], r: [x + RES, y + RES * (L - b) / (c - b)],
              b: [x + RES * (L - d) / (c - d), y + RES], l: [x, y + RES * (L - a) / (d - a)] };
            var segs = MS[idx];
            for (var s = 0; s < segs.length; s += 2) { var p0 = pts[segs[s]], p1 = pts[segs[s + 1]]; path.moveTo(p0[0], p0[1]); path.lineTo(p1[0], p1[1]); }
          }
          ctx.strokeStyle = 'rgba(46,62,82,' + (0.14 + li * 0.06).toFixed(2) + ')';
          ctx.lineWidth = 0.7 + li * 0.08; ctx.stroke(path);
        });
      }
    }
  };
  /* marching squares: corner bits a(8) b(4) c(2) d(1), a top-left, clockwise */
  var MS = { 1: ['l', 'b'], 2: ['b', 'r'], 3: ['l', 'r'], 4: ['t', 'r'], 5: ['l', 't', 'b', 'r'], 6: ['t', 'b'], 7: ['l', 't'],
    8: ['l', 't'], 9: ['t', 'b'], 10: ['t', 'r', 'l', 'b'], 11: ['t', 'r'], 12: ['l', 'r'], 13: ['b', 'r'], 14: ['l', 'b'] };

  /* ------------------------------------------------------------------ callouts (country level, as in the keynote) */
  /* keynote frame: the keynote's own angle / leader length / anchor, in its 5800px units */
  var CALLOUTS = {
    keynote: { unit: 'k', list: [['Finland', -116, 330, 'r'], ['Estonia', -40, 360, 'l'], ['Germany', 198, 430, 'r'], ['Italy', 150, 560, 'r'],
      ['United Arab Emirates', 24, 400, 'l'], ['Georgia', -40, 200, 'l'], ['Indonesia', -28, 330, 'r']] },
    /* Georgia (24 Sept 2026): the label sits north-east of the Caucasus, clear of the Türkiye and Levant discs
       at both map widths (Home ~1310 px, Use cases ~860 px); it used to hang south-west over Beirut and Athens */
    world: { unit: 'k', list: [['Finland', -64, 330, 'l'], ['Germany', 200, 420, 'r'], ['Italy', 152, 500, 'r'], ['Georgia', -24, 470, 'l'],
      ['United Arab Emirates', 26, 380, 'l'], ['Indonesia', 22, 340, 'l']] },
    europe: { unit: 'u', list: [['Finland', -28, 70, 'l'], ['Estonia', 12, 96, 'l'], ['Germany', -58, 92, 'l'], ['Netherlands', -122, 118, 'r'],
      ['Italy', 158, 170, 'r'], ['Georgia', -62, 70, 'l'], ['Kosovo', 120, 120, 'r']] }
  };

  /* ------------------------------------------------------------------ styles (scoped, injected once) */
  /* Type comes from the site's role tokens (assets/site.css) so the Type switcher reaches the map;
     the fallbacks keep the module usable on a page without site.css. */
  var CSS = '' +
    '.cmap{position:relative;color:#14171C;' +
      '--cm-name:var(--map-name,var(--f-name,"Founders","Schibsted Grotesk",system-ui,sans-serif));--cm-wname:var(--w-name,500);' +
      '--cm-cap:var(--map-cap,var(--f-label,"Archivo Narrow","Arial Narrow",sans-serif));--cm-wcap:var(--w-label,600);--cm-lscap:var(--ls-label,.14em);' +
      '--cm-num:var(--map-num,var(--f-num,var(--cm-name)));--cm-wnum:var(--w-num,400);--cm-lsnum:var(--ls-num,-.03em);' +
      '--cm-text:var(--map-text,var(--f-text,"Founders Text","Schibsted Grotesk",system-ui,sans-serif));' +
      '--cm-ink:#14171C;--cm-ink2:#4A5058}' +
    '.cmap--dark{--cm-ink:#FFFFFF;--cm-ink2:rgba(255,255,255,.74)}' +
    '.cmap--dark:not(.cmap--wide) .cmap-n{--cm-ink:#14171C;--cm-ink2:#4A5058}' +
    '.cmap-stage{position:relative;width:100%;overflow:hidden;border-radius:inherit}' +
    '.cmap-c{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.cmap-o{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}' +
    '.cmap-o .mk{outline:none}' +
    '.cmap-o .mk .hit{fill:transparent}' +
    '.cmap-o .mk .ring{fill:none;stroke:var(--cm-ink);stroke-width:1.5;opacity:0}' +
    '.cmap-o .mk.on .ring{opacity:1}' +
    '.cmap-o .mk:focus-visible .ring{opacity:1;stroke-width:2.2}' +
    '.cmap-o .co-l{fill:none;stroke-width:1.1}' +
    '.cmap-o .co-n{font-family:var(--cm-name);font-weight:600;letter-spacing:-.005em;paint-order:stroke;stroke-linejoin:round}' +
    '.cmap-o .co-c{font-family:var(--cm-cap);font-weight:var(--cm-wcap);letter-spacing:var(--cm-lscap);text-transform:uppercase;fill:var(--cm-ink2);paint-order:stroke;stroke-linejoin:round}' +
    '.cmap-n{display:flex;gap:clamp(18px,3.4vw,44px);justify-content:flex-start;pointer-events:none;margin:14px 0 0}' +
    '.cmap--wide .cmap-n{justify-content:center}' +
    '.cmap-n[hidden]{display:none}' +
    '.cmap--wide .cmap-n{position:absolute;left:0;right:0;margin:0}' +
    '.cmap--wide.cmap--nleft .cmap-n{justify-content:flex-start}' +
    '.cmap-n div{display:flex;flex-direction:column;gap:.45em}' +
    '.cmap-n b{font-family:var(--cm-num);font-weight:var(--cm-wnum);letter-spacing:var(--cm-lsnum);line-height:.9;font-variant-numeric:lining-nums tabular-nums;color:var(--cm-ink)}' +
    '.cmap-n span{font-family:var(--cm-cap);font-weight:var(--cm-wcap);letter-spacing:var(--cm-lscap);text-transform:uppercase;color:var(--cm-ink2)}' +
    '.cmap-tip{position:absolute;z-index:6;width:min(300px,calc(100% - 16px));background:#FFFFFF;color:#14171C;border-radius:12px;box-shadow:0 14px 40px rgba(20,23,28,.16),0 0 0 1px rgba(20,23,28,.07);padding:13px 15px 12px;pointer-events:none;font-family:var(--cm-text);font-size:14.5px;line-height:1.4}' +
    '.cmap-tip[hidden]{display:none}' +
    '.cmap-tip .t-n{margin:0;font-family:var(--cm-name);font-weight:var(--cm-wname);font-size:20px;line-height:1.1;letter-spacing:-.01em}' +
    '.cmap-tip .t-c,.cmap-tip li small,.cmap-tip .t-more{font-family:var(--cm-cap);font-weight:var(--cm-wcap);letter-spacing:var(--cm-lscap);text-transform:uppercase;color:#4A5058;font-size:10.5px;line-height:1.45}' +
    '.cmap-tip .t-c{margin:5px 0 0;font-size:11px}' +
    '.cmap-tip ul{list-style:none;margin:10px 0 0;padding:10px 0 0;border-top:1px solid rgba(20,23,28,.10);display:grid;gap:7px}' +
    '.cmap-tip li{display:grid;grid-template-columns:10px 1fr;gap:2px 9px;align-items:start}' +
    '.cmap-tip li i{width:10px;height:10px;border-radius:50%;margin-top:5px}' +
    '.cmap-tip li small{grid-column:2}' +
    '.cmap-tip .t-more{margin:8px 0 0}' +
    '.cmap--dark .cmap-tip{background:#161A22;color:#FFFFFF;box-shadow:0 14px 40px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.1)}' +
    '.cmap--dark .cmap-tip .t-c,.cmap--dark .cmap-tip li small,.cmap--dark .cmap-tip .t-more{color:rgba(255,255,255,.72)}' +
    '.cmap--dark .cmap-tip ul{border-top-color:rgba(255,255,255,.14)}';
  function injectCSS() {
    if (document.getElementById('cmap-css')) return;
    var s = document.createElement('style'); s.id = 'cmap-css'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------------ data helpers */
  function reach() {
    var C = window.COPLAN, T = window.COPLAN_MAP_TOTALS || {};
    var R = (C && C.data && C.data.reach) || {};
    return { engagements: R.engagements || T.engagements, cities: R.cities || T.cities, countries: R.countries || T.countries };
  }
  function countryTotal(name) {
    var L = window.COPLAN_COUNTRIES || [];
    for (var i = 0; i < L.length; i++) if (L[i].country === name) return L[i].n;
    return null;
  }
  function caseOf(slug) { var C = window.COPLAN; try { return C && C.bySlug ? C.bySlug(slug) : null; } catch (e) { return null; } }
  function cleanTitle(t) {
    /* retired product names never reach the page */
    return String(t).replace(/\s*[x×]\s*Urb\w*AI\b\s*[-–—]?\s*/i, ': ').replace(/\bUrb\w*AI\b\s*/gi, '').replace(/^[:\s]+/, '').replace(/\s+-\s+/g, ', ').replace(/\s{2,}/g, ' ').trim();
  }

  /* ------------------------------------------------------------------ the instance */
  var DEFAULTS = { fill: 'stipple', crop: 'keynote', marks: 'task', labels: true, interactive: true, totals: false, seed: 7 };

  function Map_(el, opts) {
    this.el = el; this.opts = {}; this.ms = 0; this.outside = [];
    injectCSS();
    el.classList.add('cmap');
    el.innerHTML = '';
    this.stage = document.createElement('div'); this.stage.className = 'cmap-stage';
    this.canvas = document.createElement('canvas'); this.canvas.className = 'cmap-c'; this.canvas.setAttribute('aria-hidden', 'true');
    this.svg = sv('svg', { class: 'cmap-o', role: 'group' });
    this.tip = document.createElement('div'); this.tip.className = 'cmap-tip'; this.tip.hidden = true; this.tip.setAttribute('role', 'status');
    this.nums = document.createElement('div'); this.nums.className = 'cmap-n';
    this.stage.appendChild(this.canvas); this.stage.appendChild(this.svg); this.stage.appendChild(this.tip);
    el.appendChild(this.stage); el.appendChild(this.nums);
    this._w = 0; this._bind();
    this.update(opts || {});
    var self = this;
    if (window.ResizeObserver) {
      var t = null;
      this._ro = new ResizeObserver(function () {
        var w = Math.round(self.el.clientWidth);
        if (!w || Math.abs(w - self._w) < 1) return;
        clearTimeout(t); t = setTimeout(function () { self.draw(); }, 140);
      });
      this._ro.observe(el);
    } else {
      window.addEventListener('resize', function () { clearTimeout(self._rt); self._rt = setTimeout(function () { self.draw(); }, 140); });
    }
  }

  Map_.prototype.update = function (opts) {
    var o = this.opts;
    for (var k in DEFAULTS) if (o[k] == null) o[k] = DEFAULTS[k];
    for (var j in opts) if (opts[j] !== undefined) o[j] = opts[j];
    if (!FILLS[o.fill]) o.fill = DEFAULTS.fill;
    if (!CROPS[o.crop]) o.crop = DEFAULTS.crop;
    this.draw();
    return this;
  };

  Map_.prototype.draw = function () {
    var el = this.el, o = this.opts, W = Math.round(el.clientWidth);
    if (!W) return;
    var t0 = now();
    this._w = W;
    var G = geo(o.crop, W), fill = FILLS[o.fill], dpr = Math.min(3, window.devicePixelRatio || 1);
    o.dpr = dpr;
    el.setAttribute('data-fill', o.fill); el.setAttribute('data-crop', o.crop);
    el.classList.toggle('cmap--dark', !!fill.dark);
    el.classList.toggle('cmap--wide', W >= 560);
    el.classList.toggle('cmap--nleft', G.c.numbers !== 'top');
    this.stage.style.height = G.H + 'px';

    /* canvas: the fill */
    var cv = this.canvas;
    cv.width = Math.round(W * dpr); cv.height = Math.round(G.H * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, G.H);
    G.lastCount = 0;
    fill.draw(ctx, G, o);
    this.count = G.lastCount;

    /* overlay: marks, callouts */
    this._overlay(G, fill);
    this._numbers(G, fill);
    this.outside = G.marks.filter(function (m) { return m.hx < 0 || m.hy < 0 || m.hx > G.W || m.hy > G.H; })
      .map(function (m) { return m.p; });
    this.ms = Math.round(now() - t0);
    el.setAttribute('data-ms', this.ms);
    if (typeof o.onrender === 'function') o.onrender(this);
  };

  Map_.prototype._overlay = function (G, fill) {
    var o = this.opts, P = palette(), svg = this.svg, self = this;
    svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
    svg.textContent = '';
    var R = reach();
    svg.setAttribute('aria-label', 'Map of the ' + R.cities + ' cities where we have worked. ' + (o.interactive ? 'Use the arrow keys to move between cities.' : ''));
    var gCo = sv('g', { class: 'co', 'aria-hidden': 'true' }, svg);
    var gMk = sv('g', { class: 'mks', role: o.interactive ? 'list' : null, 'aria-hidden': o.interactive ? null : 'true' }, svg);
    var style = fill.markStyle || 'plain', dark = !!fill.dark;

    function colourOf(m, kind) {
      var t = o.marks === 'ink' ? null : m.task;
      if (!t) {
        if (o.marks === 'ink') return dark ? (kind === 'text' ? '#FFE2B8' : '#FDC474') : (kind === 'text' ? '#14171C' : '#1F3A57');
        return dark ? (kind === 'text' ? P.darkText.none : P.dark.none) : (kind === 'text' ? P.text.none : P.mark.none);
      }
      return dark ? (kind === 'text' ? P.darkText[t] : P.dark[t]) : (kind === 'text' ? P.text[t] : P.mark[t]);
    }
    this._colourOf = colourOf;

    /* callouts first so the discs sit on top of their leaders */
    var showLabels = o.labels && G.W >= 640;
    if (showLabels && CALLOUTS[G.crop]) {
      var spec = CALLOUTS[G.crop], unit = spec.unit === 'k' ? G.k : Math.max(0.75, G.u);
      var fsN = Math.max(12.5, 46 * G.k * 1.05), fsC = Math.max(9.5, 30 * G.k * 1.05);
      if (spec.unit === 'u') { fsN = 13.5 * Math.min(1.2, Math.max(1, G.u)); fsC = 10 * Math.min(1.2, Math.max(1, G.u)); }
      var halo = dark ? '#0B0D12' : '#FFFFFF';
      spec.list.forEach(function (c) {
        var name = c[0], best = null;
        G.marks.forEach(function (m) { if (m.p.country === name && (!best || m.n > best.n)) best = m; });
        if (!best || best.x < 0 || best.y < 0 || best.x > G.W || best.y > G.H) return;
        var a = c[1] * D2R, ln = c[2] * unit, anc = c[3];
        var ex = best.x + Math.cos(a) * ln, ey = best.y + Math.sin(a) * ln;
        /* keep the label inside the frame: clamp it vertically, flip its side if it would run off an edge */
        ey = clamp(ey, fsN * 1.25, G.H - fsC * 2.2);
        var runL = spec.unit === 'k' ? Math.max(18, 120 * unit) : 24 * unit, estW = Math.max(name.length * fsN * 0.56, 13 * fsC * 0.9);
        if (anc === 'l' && ex + runL + 6 + estW > G.W - 4) anc = 'r';
        else if (anc === 'r' && ex - runL - 6 - estW < 4) anc = 'l';
        var run = (anc === 'l' ? 1 : -1) * runL;
        var col = colourOf(best, 'mark'), tcol = colourOf(best, 'text');
        sv('path', { class: 'co-l', d: 'M' + r1(best.x) + ' ' + r1(best.y) + 'L' + r1(ex) + ' ' + r1(ey) + 'L' + r1(ex + run) + ' ' + r1(ey), stroke: col, 'stroke-opacity': dark ? 0.85 : 0.75 }, gCo);
        var tx = ex + run + (anc === 'l' ? 6 : -6), ta = anc === 'l' ? 'start' : 'end';
        var total = countryTotal(name);
        var nm = sv('text', { class: 'co-n', x: r1(tx), y: r1(ey - fsN * 0.18), 'font-size': r1(fsN), 'text-anchor': ta, fill: tcol, stroke: halo, 'stroke-width': 3 }, gCo);
        nm.textContent = name;
        if (total != null) {
          var cc = sv('text', { class: 'co-c', x: r1(tx), y: r1(ey + fsC * 1.35), 'font-size': r1(fsC), 'text-anchor': ta, stroke: halo, 'stroke-width': 3 }, gCo);
          cc.textContent = total + (total === 1 ? ' engagement' : ' engagements');
        }
      });
    }

    /* discs: biggest first so small ones stay on top */
    var order = G.marks.slice().sort(function (a, b) { return b.r - a.r; });
    var nodes = [];
    order.forEach(function (m) {
      if (m.x < -m.r || m.y < -m.r || m.x > G.W + m.r || m.y > G.H + m.r) return;
      var g = sv('g', { class: 'mk', 'data-i': m.i }, gMk);
      var col = colourOf(m, 'mark');
      if (o.interactive) {
        g.setAttribute('role', 'listitem'); g.setAttribute('tabindex', '-1');
        g.setAttribute('aria-label', m.p.place + (m.p.place === m.p.country ? '' : ', ' + m.p.country) + ': ' + m.n + (m.n === 1 ? ' engagement' : ' engagements'));
        sv('circle', { class: 'hit', cx: r1(m.x), cy: r1(m.y), r: r1(Math.max(m.r + 3, 8)) }, g);
      }
      if (style === 'keynote') {
        sv('circle', { cx: r1(m.x), cy: r1(m.y), r: r1(m.r), fill: col, 'fill-opacity': 0.92 }, g);
        sv('circle', { cx: r1(m.x), cy: r1(m.y), r: r1(m.r * 0.38), fill: '#FFFFFF', 'fill-opacity': 0.94 }, g);
      } else if (style === 'keynote-light') {
        sv('circle', { cx: r1(m.x), cy: r1(m.y), r: r1(m.r), fill: col, 'fill-opacity': 0.94 }, g);
        sv('circle', { cx: r1(m.x), cy: r1(m.y), r: r1(m.r * 0.38), fill: '#1E1E26', 'fill-opacity': 0.88 }, g);
      } else {
        sv('circle', { cx: r1(m.x), cy: r1(m.y), r: r1(m.r), fill: col, stroke: '#FFFFFF', 'stroke-width': 1.25 }, g);
      }
      sv('circle', { class: 'ring', cx: r1(m.x), cy: r1(m.y), r: r1(m.r + 2.6) }, g);
      nodes.push({ g: g, m: m });
    });
    this.nodes = nodes;
    if (o.interactive && nodes.length) {
      /* keyboard order: west to east; the tab stop starts on the largest */
      this.kbd = nodes.slice().sort(function (a, b) { return a.m.hx - b.m.hx || a.m.hy - b.m.hy; });
      var start = nodes[0];
      start.g.setAttribute('tabindex', '0');
      this.kbd.forEach(function (n, i) { n.k = i; });
      this._tab = start;
    }
    if (!o.interactive) this.hideTip();
  };

  Map_.prototype._numbers = function (G, fill) {
    var o = this.opts, box = this.nums;
    box.textContent = '';
    box.hidden = !o.totals;
    if (!o.totals) return;
    var R = reach(), wide = G.W >= 560;
    var fsN = wide ? clamp(G.W * 0.036, 30, 64) : 30, fsL = wide ? clamp(G.W * 0.0088, 10.5, 12.5) : 10.5;
    [['engagements', R.engagements, 'reach.engagements'], ['cities', R.cities, 'reach.cities'], ['countries', R.countries, 'reach.countries']].forEach(function (r) {
      var d = document.createElement('div');
      d.innerHTML = '<b data-m="' + r[2] + '">' + esc(r[1]) + '</b><span>' + r[0] + '</span>';
      d.querySelector('b').style.fontSize = fsN + 'px'; d.querySelector('span').style.fontSize = fsL + 'px';
      box.appendChild(d);
    });
    if (wide) {
      var pos = G.c.numbers;
      box.style.top = pos === 'bottom-left' ? '' : (pos === 'top' ? G.H * 0.075 : G.H * 0.05) + 'px';
      box.style.bottom = pos === 'bottom-left' ? G.H * 0.07 + 'px' : '';
      box.style.paddingLeft = pos === 'top' ? '' : Math.max(16, G.W * 0.025) + 'px';
    } else { box.style.top = ''; box.style.bottom = ''; box.style.paddingLeft = ''; }
  };

  /* ------------------------------------------------------------------ interaction */
  Map_.prototype._bind = function () {
    var self = this, svg = this.svg;
    function nodeOf(t) { var g = t && t.closest ? t.closest('.mk') : null; if (!g || !self.nodes) return null; for (var i = 0; i < self.nodes.length; i++) if (self.nodes[i].g === g) return self.nodes[i]; return null; }
    svg.addEventListener('pointermove', function (e) {
      if (!self.opts.interactive) return;
      var n = nodeOf(e.target);
      if (n) self.showTip(n); else if (!self._pinned) self.hideTip();
    });
    svg.addEventListener('pointerleave', function () { if (!self._pinned) self.hideTip(); });
    svg.addEventListener('click', function (e) { var n = nodeOf(e.target); if (n) { self._pinned = true; self.showTip(n); } else { self._pinned = false; self.hideTip(); } });
    svg.addEventListener('focusin', function (e) { var n = nodeOf(e.target); if (n) self.showTip(n); });
    svg.addEventListener('focusout', function () { setTimeout(function () { if (!svg.contains(document.activeElement)) { self._pinned = false; self.hideTip(); } }, 0); });
    svg.addEventListener('keydown', function (e) {
      var n = nodeOf(e.target); if (!n || !self.kbd) return;
      var i = n.k, L = self.kbd.length, j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % L;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + L) % L;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = L - 1;
      else if (e.key === 'Escape') { self._pinned = false; self.hideTip(); return; }
      if (j == null) return;
      e.preventDefault();
      var to = self.kbd[j];
      if (self._tab) self._tab.g.setAttribute('tabindex', '-1');
      to.g.setAttribute('tabindex', '0'); self._tab = to; to.g.focus(); self.showTip(to);
    });
  };

  Map_.prototype.showTip = function (n) {
    var m = n.m, p = m.p, P = palette(), tip = this.tip, self = this;
    if (this._on && this._on !== n) this._on.g.classList.remove('on');
    n.g.classList.add('on'); this._on = n;
    if (tip._for !== m.i) {
      tip._for = m.i;
      var rows = (p.cases || []).map(caseOf).filter(Boolean).sort(function (a, b) { return b.year - a.year; });
      var html = '<p class="t-n">' + esc(p.place) + '</p><p class="t-c">' + (p.place === p.country ? 'Country-level record · ' : esc(p.country) + ' · ') +
        m.n + (m.n === 1 ? ' engagement' : ' engagements') + '</p>';
      if (rows.length) {
        html += '<ul>' + rows.slice(0, 3).map(function (c) {
          return '<li><i style="background:' + P.mark[c.task] + '"></i><span>' + esc(cleanTitle(c.title)) + '</span><small>' + esc(TASK_LABEL[c.task]) + ' · ' + c.year + '</small></li>';
        }).join('') + '</ul>';
        if (rows.length > 3) html += '<p class="t-more">and ' + (rows.length - 3) + ' more in the catalogue</p>';
      }
      tip.innerHTML = html;
    }
    tip.hidden = false;
    var W = this.stage.clientWidth, H = this.stage.clientHeight, sc = W / (this._w || W);
    var x = m.x * sc, y = m.y * sc, tw = tip.offsetWidth, th = tip.offsetHeight, gap = m.r * sc + 10;
    var left = x + gap, top = y - th / 2;
    if (left + tw > W - 6) left = x - gap - tw;
    if (left < 6) { left = clamp(x - tw / 2, 6, W - tw - 6); top = y + gap; if (top + th > H - 6) top = y - gap - th; }
    top = clamp(top, 6, Math.max(6, H - th - 6));
    tip.style.left = Math.round(left) + 'px'; tip.style.top = Math.round(top) + 'px';
    void self;
  };
  Map_.prototype.hideTip = function () {
    this.tip.hidden = true; this.tip._for = null;
    if (this._on) { this._on.g.classList.remove('on'); this._on = null; }
  };
  Map_.prototype.destroy = function () {
    if (this._ro) this._ro.disconnect();
    this.el.innerHTML = ''; this.el.classList.remove('cmap', 'cmap--dark', 'cmap--wide', 'cmap--nleft');
    delete this.el.__cmap;
  };

  /* ------------------------------------------------------------------ public */
  window.CoplanMap = {
    version: '2026-09-23',
    render: function (el, opts) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (!el) return null;
      if (el.__cmap) return el.__cmap.update(opts || {});
      el.__cmap = new Map_(el, opts);
      return el.__cmap;
    },
    fills: Object.keys(FILLS).map(function (k) { return { key: k, name: FILLS[k].name, idea: FILLS[k].idea, dark: !!FILLS[k].dark }; }),
    crops: Object.keys(CROPS).map(function (k) { return { key: k, name: CROPS[k].name }; }),
    taskColours: function () { var P = palette(); return { mark: P.mark, text: P.text, base: P.base, ink: '#1F3A57', labels: TASK_LABEL }; },
    /* width / height of a frame, so a page can reserve the space before the map is drawn (no layout shift) */
    aspect: function (crop) { var F = fitCrop(crop, 1000); return F.W / F.H; },
    /* the places a frame shows (true positions, not nudged), e.g. to say how many cities the Europe frame holds */
    inside: function (crop) {
      var F = fitCrop(crop, 1000);
      return (window.COPLAN_PLACES || []).filter(function (p) { var xy = F.proj(p.lon, p.lat); return xy[0] >= 0 && xy[1] >= 0 && xy[0] <= F.W && xy[1] <= F.H; });
    },
    places: function () { return (window.COPLAN_PLACES || []).slice(); },
    clearCache: function () { GEO = {}; PAL = null; }
  };
})();
