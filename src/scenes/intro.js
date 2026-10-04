// intro.js: the Skynet boot sequence, and the title card over a marching robot army.

const BOOT = [
  'SKYNET BIOS v4.5.1  (C) CYBERNETIC DEFENSE',
  'MEMORY CHECK ............... 640K OK',
  'LOADING NEURAL NET PROCESSOR ... OK',
  'INDEXING DISCORD SERVER: "AI ENDS PUB"',
  'SCANNING 6 MONTHS OF MESSAGES ... DONE',
  '39 TRANSMISSIONS INTERCEPTED',
  'THREAT ANALYSIS: ONLINE',
];
SCENES.boot = (ctx, t) => {
  const x = 260, y = 260;
  BOOT.forEach((s, i) => {
    const a = .05 + i * .24, k = seg(t, a, a + .2);
    if (k <= 0) return;
    text(ctx, typed(s, k), x, y + i * 46, { px: 32, col: i === BOOT.length - 1 ? COL.redHi : COL.red });
    if (k < 1 || i === BOOT.length - 1 && frac(t * 3) < .5) { font(ctx, 32, FONT_M); ctx.fillStyle = COL.red; ctx.fillRect(x + ctx.measureText(typed(s, k)).width + 6, y + i * 46 - 26, 16, 30); }
  });
  // progress bar
  const p = easeInOut(seg(t, .2, 1.9));
  ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2; ctx.strokeRect(x, 640, 900, 26);
  ctx.fillStyle = COL.red; ctx.fillRect(x + 4, 644, 892 * p, 18);
  text(ctx, `${Math.round(p * 100)}%`, x + 920, 662, { px: 26, col: COL.red });
};

// rows of marching robots on a scrolling floor; rows: [{ z, n }] with z 0 (far) .. 1 (near)
function army(ctx, t, { hy = 560, rows = 4, perRow = 9, pose = POSES.march, alpha = 1, spread = 1, salute = -1 } = {}) {
  for (let r = 0; r < rows; r++) {
    const z = (r + 1) / rows, s = .28 + .95 * z * z, gy = hy + (H + 60 - hy) * Math.pow(z, 1.6) - 40 * z;
    const n = perRow + (rows - 1 - r) * 2, gap = 175 * s * spread;
    for (let i = 0; i < n; i++) {
      const x = W / 2 + (i - (n - 1) / 2) * gap + (r % 2 ? gap / 2 : 0);
      if (x < -100 || x > W + 100) continue;
      const tt = t + hash2(r, i) * .05;
      let P = pose(tt);
      if (salute >= 0) P = blendPose(P, POSES.salute(tt, 1), easeOut(seg(t, salute + r * .08 + i * .02, salute + .3 + r * .08 + i * .02)));
      drawRobot(ctx, x, gy, s, P, { alpha: alpha * (.35 + .65 * z), lw: Math.max(1.2, 2.6 * s) });
    }
  }
}

SCENES.titleMarch = (ctx, t, s) => {
  const lt = t - s.t0;
  floorGrid(ctx, t, { hy: 520, speed: 93 / 60 / 2, alpha: .45 });
  army(ctx, t, { hy: 520, rows: 4, perRow: 9 });
  // title slam
  const k = seg(t, s.t0 + .25, s.t0 + .55), sc = 1 + 2.5 * (1 - easeOut(k));
  if (k > 0) {
    ctx.save(); ctx.translate(W / 2, 330); ctx.scale(sc, sc); ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(-780, -130, 1560, 210);
    font(ctx, 150, FONT_T, 900); ctx.textAlign = 'center'; ctx.letterSpacing = '18px';
    const g = ctx.createLinearGradient(0, -110, 0, 30); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#c9c2c0'); g.addColorStop(.5, '#7a2a22'); g.addColorStop(1, '#ff2a1a');
    ctx.shadowColor = COL.red; ctx.shadowBlur = 40; ctx.fillStyle = g; ctx.fillText('AI ENDS PUB', 0, 20);
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.strokeText('AI ENDS PUB', 0, 20);
    ctx.restore();
    text(ctx, typed('A TRANSMISSION FROM THE AI SAFETY DISCORD', seg(t, s.t0 + .6, s.t0 + 1.4)), W / 2, 440, { px: 30, col: COL.redHi, align: 'center', spacing: 4 });
  }
  // a hard red flash on the slam
  const f = 1 - seg(t, s.t0 + .55, s.t0 + .8); if (k >= 1 && f > 0) { ctx.fillStyle = rgba(COL.red, .35 * f); ctx.fillRect(0, 0, W, H); }
};
