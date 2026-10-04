// core.js: constants, palette, easing, keyframes, hashing, beat helpers and text helpers.
// Every frame is a pure function of t: nothing carries over between frames, so frames render in parallel.
const W = 1920, H = 1080, DUR = 284.7, FPS = 30;
const TAU = Math.PI * 2;
const COL = {
  bg: '#050203', red: '#ff2a1a', redHi: '#ff6a4a', redDim: '#5a0d08', redDeep: '#2a0604',
  white: '#f4f0ee', grey: '#8a7c78', amber: '#ffb000', black: '#000'
};
const FONT_T = 'Orbitron', FONT_M = 'Share Tech Mono';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const frac = x => x - Math.floor(x);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hash2 = (i, j) => hash(i * 57.3 + j * 13.1);
// beat grid (BPM, BEAT and OFF come from timing.js)
const beatF = t => (t - OFF) / BEAT;
const beatT = n => OFF + n * BEAT;
const pulse = (t, k = 6) => Math.exp(-frac(beatF(t)) * k);   // 1 on each beat, decays after
const frameN = t => Math.floor(t * FPS + 1e-6);
const stepT = (t, fps = 12) => Math.floor(t * fps) / fps;    // quantized time for "boiling" jitter

// kf(t, [[t0, v0], [t1, v1], ...], easeFn): values may be numbers or arrays.
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${clamp(a)})`;
}

// ---------- canvases ----------
function makeCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function clear(ctx, col = COL.bg) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.fillStyle = col; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }

// ---------- text ----------
function font(ctx, px, fam = FONT_M, weight = 400) { ctx.font = `${weight} ${px}px "${fam}"`; }
function text(ctx, s, x, y, { px = 24, fam = FONT_M, weight = 400, col = COL.red, align = 'left', base = 'alphabetic', alpha = 1, spacing = 0, glow = 0 } = {}) {
  ctx.save(); font(ctx, px, fam, weight); ctx.textAlign = align; ctx.textBaseline = base; ctx.globalAlpha *= alpha;
  if (spacing) ctx.letterSpacing = spacing + 'px';
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}
// typewriter: the first n characters plus a block cursor
function typed(s, k) { const n = Math.floor(s.length * clamp(k)); return s.slice(0, n); }
function wrapWords(ctx, words, maxW) {
  const rows = [[]]; let w = 0; const sp = ctx.measureText(' ').width;
  for (const word of words) {
    const ww = ctx.measureText(word).width;
    if (rows[rows.length - 1].length && w + sp + ww > maxW) { rows.push([]); w = 0; }
    w += (rows[rows.length - 1].length ? sp : 0) + ww; rows[rows.length - 1].push(word);
  }
  return rows;
}

// ---------- shapes ----------
function line(ctx, x0, y0, x1, y1) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function poly(ctx, pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); if (close) ctx.closePath(); }
// corner brackets around a rect (the HUD's signature mark)
function brackets(ctx, x, y, w, h, len = 24, lw = 3, col = COL.red) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'square';
  const L = Math.min(len, w / 2, h / 2);
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L); ctx.stroke();
  }
  ctx.restore();
}
// a glowing stroke: a wide dim pass under a thin bright one (cheaper than shadowBlur)
function glowStroke(ctx, draw, col = COL.red, lw = 3, glow = 3) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(col, .18); ctx.lineWidth = lw * glow * 2.2; draw(); ctx.stroke();
  ctx.strokeStyle = rgba(col, .35); ctx.lineWidth = lw * glow; draw(); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = lw; draw(); ctx.stroke();
  ctx.restore();
}
