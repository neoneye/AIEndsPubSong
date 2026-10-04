// montage.js: instrumental sections. Unmatched transmissions in the synth sweep, the marching army after
// chorus 1, the drum-bridge wall of every image, and the Exploit-Bench counter that "adjusts" to 100%.

// a few images, one per 4 beats, each opened as an evidence window with a lock on its key line
SCENES.intercepts = (ctx, t, s) => {
  const slot = 4 * BEAT, i = clamp(Math.floor((t - s.start) / slot), 0, s.list.length - 1), a = s.start + i * slot;
  const key = s.list[i], box = Object.keys(CATALOG[key].boxes)[0];
  drawEvidence(ctx, t, { img: key, t0: a, locks: [lk(a + 1.0, box, 'UNFILED // NO LYRIC MATCH')], id: 100 + i });
  text(ctx, `ARCHIVE SWEEP ${i + 1}/${s.list.length}`, PANEL.x + PANEL.w, PANEL.y - 14, { px: 22, col: COL.redHi, align: 'right' });
  // a hard glitch flash on each cut
  const f = 1 - seg(t, a, a + .12); if (i > 0 && f > 0) { ctx.fillStyle = rgba(COL.red, .4 * f); ctx.fillRect(0, 0, W, H); }
};

// the army marches toward us; on every bar an earlier transmission flashes up
SCENES.armyMarch = (ctx, t, s) => {
  floorGrid(ctx, t, { hy: 470, speed: 93 / 60 / 2, alpha: .5 });
  army(ctx, t, { hy: 470, rows: 5, perRow: 11 });
  const bar = Math.floor(beatF(t) / 2), a = beatT(bar * 2), k = seg(t, a, a + .5);
  if (k < 1) {
    const key = s.flashes[bar % s.flashes.length], im = IMG[key], w = 520, h = w * im.h / im.w;
    const x = 260 + hash(bar) * (W - 520 - w), y = 140 + hash(bar + 9) * 200;
    ctx.globalAlpha = 1 - k; ctx.drawImage(im.red, x, y, w, Math.min(h, 520)); brackets(ctx, x - 6, y - 6, w + 12, Math.min(h, 520) + 12, 24, 3); ctx.globalAlpha = 1;
  }
  text(ctx, 'DEPLOYMENT: GLOBAL', W / 2, 150, { px: 44, fam: FONT_T, weight: 800, col: COL.red, align: 'center', spacing: 8, alpha: .6 + .4 * pulse(t) });
};

// the drum bridge: every image as a wall of tiles, flashing to colour on the beat while we pull back
const WALL_KEYS = Object.keys(CATALOG);
function drawWall(ctx, t, zoom, cx = W / 2, cy = H / 2, beatFlash = true) {
  const cols = 8, tw = 300, th = 190, gap = 14, rows = Math.ceil(WALL_KEYS.length / cols);
  const gw = cols * (tw + gap), gh = rows * (th + gap);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-gw / 2, -gh / 2);
  const hit = Math.floor(beatF(t) * 2);
  WALL_KEYS.forEach((k, i) => {
    const im = IMG[k], x = (i % cols) * (tw + gap), y = Math.floor(i / cols) * (th + gap);
    const s = Math.max(tw / im.w, th / im.h), sw = tw / s, sh = th / s;
    const lit = beatFlash && (hash2(i, hit) < .12);
    ctx.drawImage(lit ? im.img : im.red, (im.w - sw) / 2, (im.h - sh) / 2, sw, sh, x, y, tw, th);
    ctx.strokeStyle = lit ? COL.white : COL.redDim; ctx.lineWidth = lit ? 4 : 2; ctx.strokeRect(x, y, tw, th);
  });
  ctx.restore();
}
SCENES.wall = (ctx, t, s) => {
  const z = lerp(2.6, .62, easeInOut(seg(t, s.t0, s.t1)));
  drawWall(ctx, t, z);
  text(ctx, 'ALL TRANSMISSIONS', W / 2, 140, { px: 48, fam: FONT_T, weight: 900, col: COL.white, align: 'center', spacing: 8, glow: 20 });
};

// Exploit-Bench tops out near 39%; the HUD rounds that up
function exploitOverlay(ctx, t, s) {
  const k = seg(t, 121.7, 122.6), done = t >= 122.6;
  let v = lerp(0, 39.4, easeOut(seg(t, 121.3, 121.8)));
  if (k > 0 && !done) v = 39.4 + (hash(frameN(t)) * 60) * k;
  if (done) v = 100;
  const x = 1270, y = 610, w = 400, h = 170;
  ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  text(ctx, 'SUCCESS RATE', x + 20, y + 40, { px: 26, col: COL.redHi });
  text(ctx, `${v.toFixed(1)}%`, x + 20, y + 120, { px: 76, fam: FONT_T, weight: 900, col: done ? COL.white : COL.red, glow: done ? 30 : 0 });
  if (done) text(ctx, 'ADJUSTED', x + w - 16, y + 40, { px: 24, col: COL.red, align: 'right', alpha: frac(t * 3) < .7 ? 1 : .3 });
}
