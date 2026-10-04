// chorus.js: the chorus wail ("AAAA…") over a saluting robot choir, then the JUST DISGUSTING stamp.
// s.n (1..3) escalates: more robots, more rows, more red.

function waveform(ctx, t, y, amp, col = COL.red) {
  ctx.save(); ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const u = x / W, env = Math.sin(u * Math.PI);
    const v = Math.sin(u * 40 + t * 22) * .5 + Math.sin(u * 97 - t * 31) * .3 + (hash2(x, frameN(t)) - .5) * .4;
    x ? ctx.lineTo(x, y + v * amp * env) : ctx.moveTo(x, y + v * amp * env);
  }
  ctx.strokeStyle = rgba(col, .25); ctx.lineWidth = 10; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

SCENES.chorusRobots = (ctx, t, s) => {
  const n = s.n, wail = seg(t, s.aaa, s.disgust), dis = t >= s.disgust;
  // search lights sweeping from the bottom
  ctx.save();
  for (let i = 0; i < 2 + n; i++) {
    const a = -Math.PI / 2 + Math.sin(t * (.7 + i * .2) + i * 2) * .5, x0 = W * (i + .5) / (2 + n);
    ctx.fillStyle = rgba(COL.red, .07 + .03 * n); ctx.beginPath(); ctx.moveTo(x0, H);
    ctx.lineTo(x0 + Math.cos(a - .08) * 1600, H + Math.sin(a - .08) * 1600); ctx.lineTo(x0 + Math.cos(a + .08) * 1600, H + Math.sin(a + .08) * 1600); ctx.fill();
  }
  ctx.restore();
  // the wail as a waveform across the screen
  waveform(ctx, t, 300, 80 + 120 * pulse(t, 4) * (dis ? .4 : 1) * (.6 + n * .2));
  floorGrid(ctx, t, { hy: 560, alpha: .4 });
  // the choir: they sing, then snap into a salute on the next beat
  const rows = n === 1 ? 1 : n === 2 ? 2 : 3;
  for (let r = 0; r < rows; r++) {
    const z = rows === 1 ? 1 : .55 + .45 * r / (rows - 1), sc = 1.55 * z, y = 610 + 300 * z;
    const cnt = 3 + n * 2 + (rows - 1 - r) * 2, gap = Math.min(250 * z, 1500 / cnt);
    for (let i = 0; i < cnt; i++) {
      const x = W / 2 + (i - (cnt - 1) / 2) * gap;
      const sal = seg(t, s.aaa + .4 + i * .04, s.aaa + .7 + i * .04);
      let P = blendPose(POSES.sing(t + i * .1, 1), POSES.salute(t, 1), sal);
      P.jaw = dis ? .1 : .7 + .3 * Math.sin(t * 14 + i); P.eye = 1 + .6 * pulse(t);
      if (dis) { P.head = Math.sin((t - s.disgust) * 16 + i) * 10 * (1 - seg(t, s.disgust + .8, s.disgust + 1.5)); }
      drawRobot(ctx, x, y, sc, P, { alpha: .45 + .55 * z, lw: Math.max(1.4, 2.4 * sc) });
    }
  }
  // the stamp
  if (dis) {
    const k = seg(t, s.disgust, s.disgust + .16), sc = 1 + 2 * (1 - easeOut(k)), shake = (1 - seg(t, s.disgust, s.disgust + .6)) * 16;
    ctx.save(); ctx.translate(W / 2 + (hash(frameN(t)) - .5) * shake, 380 + (hash(frameN(t) + 3) - .5) * shake); ctx.rotate(-.07); ctx.scale(sc, sc); ctx.globalAlpha = k;
    font(ctx, 132, FONT_T, 900); ctx.textAlign = 'center'; ctx.letterSpacing = '6px';
    ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(-800, -150, 1600, 200);
    // RGB-split copies
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(0,255,255,.35)'; ctx.fillText('JUST DISGUSTING', -6, 0);
    ctx.fillStyle = 'rgba(255,0,60,.6)'; ctx.fillText('JUST DISGUSTING', 6, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = COL.white; ctx.fillText('JUST DISGUSTING', 0, 0);
    ctx.strokeStyle = COL.red; ctx.lineWidth = 10; ctx.strokeRect(-800, -150, 1600, 200);
    ctx.restore();
  } else {
    // the wail counter
    text(ctx, `CHORUS ${n}/3 // HARMONICS ${(wail * 100).toFixed(0)}%`, W / 2, 180, { px: 28, col: COL.redHi, align: 'center', spacing: 3 });
  }
};
