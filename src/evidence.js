// evidence.js: the "INTERCEPTED TRANSMISSION" window. A meme image opens red-duotoned, a T-800 reticle
// scans it and locks onto the detail the lyric is about (MATCH FOUND), the camera zooms in, and the locked
// box shows in full colour.
//
// cfg: { img: catalog key | 'T2', locks: [{ t, box, label }], t0, t1, video: { at } (T2 only), id, zmax, tilt }

const PANEL = { x: 200, y: 112, w: 1520, h: 740 };   // main content area between the HUD columns
let EV_SERIAL = 0;

function evSource(cfg, t) {
  if (cfg.img === 'T2') return t2Frame(t - cfg.video.at);
  return IMG[cfg.img];
}
function evBoxes(cfg) { return cfg.img === 'T2' ? T2.boxes : CATALOG[cfg.img].boxes; }
const padBox = (b, p = .015) => [b[0] - p, b[1] - p, b[2] + p, b[3] + p];

// camera view for a box: centre (normalized image coords) and zoom multiplier over "fit"
function viewFor(box, fitW, fitH, inW, inH, zmax) {
  const bw = (box[2] - box[0]) * fitW, bh = (box[3] - box[1]) * fitH;
  const zfit = Math.min(inW * .82 / bw, inH * .7 / bh);
  return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2, clamp(lerp(1, zfit, .9), 1, zmax)];
}

// the camera (cx, cy, z) and the reticle state at time t
function evState(cfg, t, fitW, fitH, inW, inH) {
  const boxes = evBoxes(cfg), zmax = cfg.zmax || 4.2, L = cfg.locks;
  const views = [[.5, .5, 1], ...L.map(l => viewFor(padBox(boxes[l.box]), fitW, fitH, inW, inH, zmax))];
  // the camera holds the previous view, then moves to lock i's view across its lock time
  let cam = views[0];
  for (let i = 0; i < L.length; i++) {
    const a = L[i].t - .35, b = L[i].t + .75;
    if (t >= a) {
      const k = easeInOut(seg(t, a, b)), v0 = cam, v1 = views[i + 1];
      // zoom out a little mid-move so long pans read as a search
      const dip = Math.sin(k * Math.PI) * (i > 0 ? .25 : 0);
      cam = [lerp(v0[0], v1[0], k), lerp(v0[1], v1[1], k), lerp(v0[2], v1[2], k) * (1 - dip)];
    }
  }
  if (cfg.drift) cam = [cam[0], cam[1], cam[2] * (1 + .008 * (t - cfg.t0))];
  // reticle: which lock we are heading to (or holding), and how far along the search is
  let idx = -1; for (let i = 0; i < L.length; i++) if (t >= L[i].t - .9) idx = i;
  return { cam, idx, boxes };
}

function drawEvidence(ctx, t, cfg, rect = PANEL) {
  const t0 = cfg.t0, open = seg(t, t0 - .05, t0 + .3), src = evSource(cfg, t);
  if (!src) return;
  const { x, y, w, h } = rect, bar = 34;
  // window open: a line that grows into the frame
  const oh = h * easeOut(open), oy = y + (h - oh) / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(10,2,2,.92)'; ctx.fillRect(x, oy, w, oh);
  if (open < 1) { ctx.fillStyle = COL.red; ctx.fillRect(x, y + h / 2 - 1.5, w * easeOut(seg(t, t0 - .2, t0)), 3); }
  ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2; ctx.strokeRect(x, oy, w, oh);
  brackets(ctx, x - 8, oy - 8, w + 16, oh + 16, 34, 4, COL.red);
  if (open < .2) { ctx.restore(); return; }

  // title bar
  const id = String(cfg.id ?? 0).padStart(3, '0'), meta = cfg.img === 'T2' ? { src: 'ARCHIVE / 1991 FOOTAGE', file: 'terminator2.mp4' } : { src: CATALOG[cfg.img].src, file: CATALOG[cfg.img].file };
  ctx.fillStyle = COL.redDeep; ctx.fillRect(x, oy, w, Math.min(bar, oh));
  text(ctx, w < 1000 ? `TRANSMISSION #${id}` : `INTERCEPTED TRANSMISSION #${id}`, x + 14, oy + 24, { px: 20, fam: FONT_T, weight: 700, col: COL.red, spacing: 2 });
  text(ctx, `SRC: ${meta.src}`, x + w - 14, oy + 23, { px: w < 1000 ? 16 : 19, col: COL.redHi, align: 'right' });

  // image area
  const ix = x + 10, iy = oy + bar + 6, iw = w - 20, ih = oh - bar - 40;
  if (ih < 20) { ctx.restore(); return; }
  const s = Math.min(iw / src.w, ih / src.h), fitW = src.w * s, fitH = src.h * s;
  const { cam, idx, boxes } = evState(cfg, t, fitW, fitH, iw, ih);
  const z = s * cam[2];
  // image → screen
  const sx = u => ix + iw / 2 + (u - cam[0]) * src.w * z, sy = v => iy + ih / 2 + (v - cam[1]) * src.h * z;
  ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
  // decode reveal: the image arrives top-down behind a bright scan line
  const rev = easeOut(seg(t, t0 + .05, t0 + .55)), revY = iy + ih * rev;
  ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, revY - iy); ctx.clip();
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src.red, sx(0), sy(0), src.w * z, src.h * z);
  // locked box in full colour
  if (idx >= 0) {
    const L = cfg.locks[idx], lk = seg(t, L.t, L.t + .18);
    if (lk > 0) {
      const b = padBox(boxes[L.box], .008), bx = sx(b[0]), by = sy(b[1]), bw = sx(b[2]) - bx, bh = sy(b[3]) - by;
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip(); ctx.globalAlpha = lk;
      ctx.drawImage(src.img, sx(0), sy(0), src.w * z, src.h * z); ctx.restore();
    }
  }
  ctx.restore();
  if (rev < 1) {
    ctx.fillStyle = COL.redHi; ctx.fillRect(ix, revY - 2, iw, 4);
    for (let k = 0; k < 40; k++) { const r = hash2(k, frameN(t)); ctx.fillStyle = rgba(COL.red, .5 * r); ctx.fillRect(ix + hash2(k, 3 + frameN(t)) * iw, revY + r * 40, 30 + r * 120, 6); }
  }
  // the reticle
  if (idx >= 0) drawReticle(ctx, t, cfg, idx, boxes, sx, sy, { ix, iy, iw, ih });
  ctx.restore();

  // footer: file, resolution, zoom
  const fy = oy + oh - 12;
  text(ctx, `${meta.file.toUpperCase()}  ${src.w}x${src.h}`, x + 14, fy, { px: 18, col: COL.grey });
  const decode = Math.round(100 * rev);
  text(ctx, `DECRYPT ${String(decode).padStart(3, ' ')}%   ZOOM x${cam[2].toFixed(2)}   REF ${(hash(cfg.id || 1) * 1e6 | 0).toString(16).toUpperCase()}`, x + w - 14, fy, { px: 18, col: COL.redHi, align: 'right' });
  ctx.restore();
}

function drawReticle(ctx, t, cfg, idx, boxes, sx, sy, area) {
  const L = cfg.locks[idx], b = padBox(boxes[L.box]);
  const tx = sx(b[0]), ty = sy(b[1]), tw = sx(b[2]) - tx, th = sy(b[3]) - ty;
  const searchStart = Math.max(L.t - .9, (idx ? cfg.locks[idx - 1].t + .4 : cfg.t0 + .35));
  const k = seg(t, searchStart, L.t), locked = t >= L.t;
  let rx = tx, ry = ty, rw = tw, rh = th;
  if (!locked) {
    // the search: hop between pseudo-random spots (snapped to 10 hops/s) closing in on the target
    const hop = Math.floor(t * 10), cx = area.ix + area.iw * (.2 + .6 * hash2(hop, idx + 1)), cy = area.iy + area.ih * (.2 + .6 * hash2(hop + 7, idx + 3));
    const sw = area.iw * .22, sh = area.ih * .22, m = easeIn(k);
    rx = lerp(cx - sw / 2, tx, m); ry = lerp(cy - sh / 2, ty, m); rw = lerp(sw, tw, m); rh = lerp(sh, th, m);
  }
  const lockK = seg(t, L.t, L.t + .25), pop = locked ? 1 + .25 * (1 - easeOut(lockK)) : 1;
  const cxr = rx + rw / 2, cyr = ry + rh / 2, pw = rw * pop, ph = rh * pop;
  ctx.save();
  // crosshair lines out to the window edges
  ctx.strokeStyle = rgba(COL.red, .45); ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
  line(ctx, area.ix, cyr, cxr - pw / 2, cyr); line(ctx, cxr + pw / 2, cyr, area.ix + area.iw, cyr);
  line(ctx, cxr, area.iy, cxr, cyr - ph / 2); line(ctx, cxr, cyr + ph / 2, cxr, area.iy + area.ih);
  ctx.setLineDash([]);
  if (locked) { ctx.fillStyle = rgba('#ffffff', .35 * (1 - lockK)); ctx.fillRect(cxr - pw / 2, cyr - ph / 2, pw, ph); }
  brackets(ctx, cxr - pw / 2 - 6, cyr - ph / 2 - 6, pw + 12, ph + 12, 26, locked ? 5 : 3, locked ? COL.red : COL.redHi);
  if (locked) { ctx.strokeStyle = rgba(COL.red, .9); ctx.lineWidth = 2; ctx.strokeRect(cxr - pw / 2, cyr - ph / 2, pw, ph); }
  // centre pip
  ctx.strokeStyle = COL.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cxr, cyr, 7, 0, TAU); ctx.stroke();
  // label tag above (or below when there is no room)
  const label = locked ? (L.label || 'MATCH FOUND') : 'SCANNING' + '.'.repeat(1 + Math.floor(t * 6) % 3);
  font(ctx, 22, FONT_M); const lw = ctx.measureText(label).width + 22;
  let ly = cyr - ph / 2 - 16 - 30; if (ly < area.iy + 4) ly = cyr + ph / 2 + 16;
  const lx = clamp(cxr - pw / 2 - 6, area.ix + 4, area.ix + area.iw - lw - 4);
  ctx.fillStyle = locked ? COL.red : rgba(COL.redDeep, .9); ctx.fillRect(lx, ly, lw, 30);
  text(ctx, label, lx + 11, ly + 22, { px: 22, col: locked ? '#000' : COL.redHi });
  if (locked) {
    const conf = (.9 + .09 * hash(idx + (cfg.id || 0))).toFixed(3);
    text(ctx, `CONF ${conf}`, lx + lw + 8, ly + 22, { px: 20, col: COL.redHi, alpha: easeOut(lockK * 2) });
  }
  ctx.restore();
}
