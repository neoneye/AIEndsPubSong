// finale.js: the military finish (salute, the archive wall, a skull close-up), then INSERT DISK 2.

SCENES.finale = (ctx, t, s) => {
  // 266.2-271: the army snaps to a salute
  if (t < 271.2) {
    floorGrid(ctx, t, { hy: 470, alpha: .5 });
    army(ctx, t, { hy: 470, rows: 5, perRow: 11, pose: POSES.idle, salute: 266.6 });
    stamp(ctx, t, 267.4, 'MISSION COMPLETE', W / 2, 260, { px: 76, rot: 0 });
    return;
  }
  // 271.2-275.6: pull back over the wall of every transmission
  if (t < 275.6) {
    const z = lerp(1.6, .5, easeInOut(seg(t, 271.2, 275.6)));
    drawWall(ctx, t, z, W / 2, H / 2 + 20, true);
    const k = seg(t, 272.0, 273.2);
    if (k > 0) {
      ctx.fillStyle = rgba('#000', .7 * k); ctx.fillRect(W / 2 - 620, 400, 1240, 220);
      text(ctx, 'ARCHIVE COMPLETE', W / 2, 500, { px: 84, fam: FONT_T, weight: 900, col: COL.white, align: 'center', spacing: 6, alpha: k });
      text(ctx, typed('39 TRANSMISSIONS // 6 MONTHS // 1 DISCORD', seg(t, 272.6, 273.6)), W / 2, 570, { px: 30, col: COL.redHi, align: 'center', spacing: 3 });
    }
    return;
  }
  // 275.6-278.9: a skull close-up; the eyes flare and go out
  const k = easeOut(seg(t, 275.6, 278.2)), flare = seg(t, 277.9, 278.3), out = seg(t, 278.4, 278.85);
  const P = pose({ eye: lerp(1, 1.6, flare) * (1 - out), jaw: 0, head: 0 });
  const sc = lerp(6.6, 8.6, k); drawRobot(ctx, W / 2, H / 2 - 40 + 204 * sc, sc, P, { lw: 8 });
  if (flare > 0 && out < 1) { const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 900); g.addColorStop(0, rgba(COL.red, .5 * flare * (1 - out))); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.fillStyle = rgba('#000', .8 * seg(t, 276.6, 277.0)); ctx.fillRect(0, 930, W, 80);
  text(ctx, 'END OF DISK 1', W / 2, 988, { px: 40, fam: FONT_T, weight: 800, col: COL.red, align: 'center', spacing: 10, alpha: seg(t, 276.6, 277.0) * (1 - out) });
  if (out > 0) { ctx.fillStyle = rgba('#000', out); ctx.fillRect(0, 0, W, H); }
};

// a 3.5" floppy, centred at (0,0), 400 units wide
function floppy(ctx, x, y, s, rot, label) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 400, h = 412, c = 26;
  // body with the bevelled corner
  poly(ctx, [[-w / 2, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2], [-w / 2, h / 2]]);
  ctx.fillStyle = '#17181c'; ctx.fill(); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.stroke();
  // metal shutter with the read window
  ctx.fillStyle = '#b9bcc4'; ctx.fillRect(-90, -h / 2, 210, 150);
  ctx.fillStyle = '#8d9099'; ctx.fillRect(-90, -h / 2 + 140, 210, 10);
  ctx.fillStyle = '#17181c'; ctx.fillRect(10, -h / 2 + 22, 50, 104);
  // label
  ctx.fillStyle = '#efe9e2'; ctx.fillRect(-150, -20, 300, 210);
  ctx.fillStyle = COL.red; ctx.fillRect(-150, -20, 300, 30);
  text(ctx, 'SKYNET', 0, 3, { px: 24, fam: FONT_T, weight: 900, col: '#fff', align: 'center', spacing: 4 });
  label.forEach((l, i) => text(ctx, l, 0, 62 + i * 40, { px: i ? 26 : 34, fam: i ? FONT_M : FONT_T, weight: 800, col: '#1a1a1a', align: 'center' }));
  ctx.strokeStyle = '#c9c1b8'; ctx.lineWidth = 1.5; for (let k = 0; k < 2; k++) line(ctx, -130, 140 + k * 22, 130, 140 + k * 22);
  // write-protect and density holes, the hub notch
  ctx.fillStyle = '#000'; ctx.fillRect(-w / 2 + 16, h / 2 - 40, 22, 22); ctx.fillRect(w / 2 - 38, h / 2 - 40, 22, 22);
  ctx.restore();
}

let FLOPPY_TMP = null;
SCENES.floppy = (ctx, t, s) => {
  // terminal prompt
  const x = 260, PX = 64;
  const l1 = 'END OF DISK 1.', l2 = 'PLEASE INSERT DISK 2';
  text(ctx, typed(l1, seg(t, 279.4, 279.9)), x, 230, { px: PX, col: COL.red });
  const blink = frac((t - 280.4) * 1.4) < .62;
  if (t > 280.3) {
    if (blink || t < 281.2) text(ctx, typed(l2, seg(t, 280.3, 280.9)), x, 320, { px: PX, col: COL.white, glow: 18 });
  }
  if (frac(t * 2) < .5) { font(ctx, PX, FONT_M); const cx = x + ctx.measureText(t > 280.3 ? typed(l2, seg(t, 280.3, 280.9)) : typed(l1, seg(t, 279.4, 279.9))).width + 12; ctx.fillStyle = COL.red; ctx.fillRect(cx, t > 280.3 ? 270 : 180, 32, 60); }
  // the floppy slides up into view and bobs; it sags a little on the sigh
  const k = easeOut(seg(t, 280.6, 281.7)), sag = easeInOut(seg(t, 282.6, 283.8)) * .5;
  const y = lerp(H + 420, 660, k) + Math.sin(t * 2.2) * 8 + sag * 40;
  if (k > 0) floppy(ctx, W / 2 + 330, y, 1.55, -.06 + Math.sin(t * 1.3) * .02 + sag * .08, ['DISK 2 OF 2', 'AI ENDS PUB']);
  // drive LED
  if (k >= 1) { ctx.fillStyle = frac(t * 3) < .5 ? COL.red : COL.redDeep; ctx.beginPath(); ctx.arc(x + 16, 440, 14, 0, TAU); ctx.fill(); text(ctx, 'DRIVE A: WAITING', x + 46, 452, { px: 34, col: COL.redHi }); }
  // the CRT switches off at the very end
  const off = seg(t, 284.05, 284.55);
  if (off > 0) {
    const sy = Math.max(.004, 1 - easeIn(clamp(off * 1.6))), sx = Math.max(.002, 1 - easeIn(clamp((off - .55) * 2.2)));
    FLOPPY_TMP = FLOPPY_TMP || makeCanvas().getContext('2d');
    FLOPPY_TMP.clearRect(0, 0, W, H); FLOPPY_TMP.drawImage(ctx.canvas, 0, 0);
    clear(ctx, '#000'); ctx.drawImage(FLOPPY_TMP.canvas, W / 2 - W * sx / 2, H / 2 - H * sy / 2, W * sx, H * sy);
    ctx.fillStyle = rgba('#ffffff', off); ctx.fillRect(W / 2 - W * sx / 2, H / 2 - 3, W * sx, 6);
  }
  if (t > 284.55) clear(ctx, '#000');
};
