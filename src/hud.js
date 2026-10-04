// hud.js: the persistent Skynet HUD: header, timecode, telemetry column, P(DOOM) meter, screen brackets.

// P(DOOM) creeps up, slams to 75.5% when the casino's board is locked in chorus 2, then climbs past it.
const PDOOM_KEYS = [[0, 9.7], [15, 12.4], [75, 31.0], [130, 47.9], [135.35, 48.2], [135.55, 75.5], [143, 75.5], [189, 82.0], [194.3, 84.0], [241, 90.6], [266, 95.2], [278.6, 99.9]];
const pdoom = t => kf(t, PDOOM_KEYS, x => x);
// HUD presence: assembles during the boot, powers down in the silence before INSERT DISK 2
const hudOn = t => Math.min(easeOut(seg(t, .3, 1.6)), 1 - seg(t, 278.9, 279.6));

function drawHud(ctx, t) {
  const on = hudOn(t); if (on <= 0) return;
  ctx.save();
  const flick = on < 1 ? (hash(frameN(t)) < on ? 1 : .25) : 1;
  ctx.globalAlpha = flick;
  // header
  const hy = 54;
  text(ctx, 'SKYNET', 40, hy, { px: 40, fam: FONT_T, weight: 900, col: COL.red, spacing: 6 });
  text(ctx, '// AI ENDS PUB', 336, hy - 4, { px: 24, col: COL.redHi, spacing: 2 });
  ctx.fillStyle = COL.redDim; ctx.fillRect(40, 72, (W - 80) * easeOut(on), 2);
  const mm = Math.floor(t / 60), ss = (t % 60).toFixed(2).padStart(5, '0');
  text(ctx, `T+ ${String(mm).padStart(2, '0')}:${ss}`, W - 40, hy - 2, { px: 28, col: COL.red, align: 'right' });
  if (frac(t * .8) < .6) { ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(W - 250, hy - 11, 8, 0, TAU); ctx.fill(); }
  text(ctx, 'REC', W - 236, hy - 2, { px: 24, col: COL.red });
  const status = t < 15 ? 'BOOT SEQUENCE COMPLETE' : t < 75 ? 'MONITORING HUMANITY' : t < 143 ? 'THREAT ASSESSMENT ACTIVE' : t < 241 ? 'OPTIMIZING' : 'HUMANITY: DEPRECATED';
  text(ctx, status, W / 2, hy - 4, { px: 22, col: COL.redHi, align: 'center', spacing: 3, alpha: frac(t * .5) < .85 ? 1 : .35 });

  // left telemetry column: scrolling hex
  ctx.save(); ctx.beginPath(); ctx.rect(30, 100, 150, 760); ctx.clip();
  const row = 22, scroll = t * 40, first = Math.floor(scroll / row);
  for (let r = 0; r < 38; r++) {
    const n = first + r, yy = 100 + r * row - (scroll % row) + 16;
    const hx = ((hash(n) * 0xffffff) | 0).toString(16).toUpperCase().padStart(6, '0'), hx2 = ((hash(n + .5) * 0xffff) | 0).toString(16).toUpperCase().padStart(4, '0');
    text(ctx, `${hx} ${hx2}`, 34, yy, { px: 17, col: hash(n * 3) < .08 ? COL.redHi : COL.redDim });
  }
  ctx.restore();

  // right column: P(DOOM) meter
  const mx = 1772, my = 120, mh = 640, mw = 34, p = pdoom(t) / 100;
  text(ctx, 'P(DOOM)', mx + mw / 2 + 30, my - 10, { px: 22, fam: FONT_T, weight: 700, col: COL.red, align: 'center' });
  ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2; ctx.strokeRect(mx, my + 10, mw, mh);
  const slam = seg(t, 135.55, 136.3), shake = slam > 0 && slam < 1 ? (hash(frameN(t)) - .5) * 14 * (1 - slam) : 0;
  for (let k = 0; k < 40; k++) {
    const f = (k + 1) / 40; if (f > p + .001) break;
    ctx.fillStyle = f > .75 ? COL.redHi : f > .5 ? COL.red : COL.redDim;
    ctx.fillRect(mx + 4 + shake, my + 10 + mh - f * mh + 2, mw - 8, mh / 40 - 4);
  }
  for (let k = 0; k <= 10; k++) { const yy = my + 10 + mh - k * mh / 10; ctx.fillStyle = COL.redDim; ctx.fillRect(mx + mw + 4, yy - 1, k % 5 ? 8 : 16, 2); if (k % 5 === 0) text(ctx, `${k * 10}`, mx + mw + 24, yy + 7, { px: 17, col: COL.redDim }); }
  const shown = (pdoom(t) + (t < 278 ? .04 * Math.sin(t * 9) : 0)).toFixed(1) + '%';
  text(ctx, shown, mx + mw / 2 + 30, my + mh + 52, { px: 30, fam: FONT_T, weight: 800, col: p > .7 ? COL.redHi : COL.red, align: 'center', glow: slam > 0 && slam < 1 ? 30 : 0 });

  // screen brackets
  brackets(ctx, 16, 16, W - 32, H - 32, 60, 3, rgba(COL.red, .8));
  ctx.restore();
}
