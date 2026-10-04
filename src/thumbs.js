// thumbs.js: three YouTube thumbnail candidates, drawn with the video's own parts.
//   node render.mjs --thumbs   → out/thumbnails/thumbnail_{A,B,C}.jpg (1280×720)

function chromeTitle(ctx, s, x, y, px, align = 'center') {
  ctx.save(); font(ctx, px, FONT_T, 900); ctx.textAlign = align; ctx.letterSpacing = Math.round(px * .08) + 'px';
  const g = ctx.createLinearGradient(0, y - px, 0, y + px * .1);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#d8d0ce'); g.addColorStop(.52, '#7a2a22'); g.addColorStop(1, '#ff2a1a');
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#000'; ctx.lineWidth = px * .16; ctx.strokeText(s, x, y);
  ctx.shadowColor = COL.red; ctx.shadowBlur = px * .4; ctx.fillStyle = g; ctx.fillText(s, x, y);
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.strokeText(s, x, y);
  ctx.restore();
}

const THUMBS = {
  // A: a skull close-up, eyes blazing, P(DOOM) maxed
  A(ctx) {
    clear(ctx);
    floorGrid(ctx, 0, { hy: 700, alpha: .5 });
    const g = ctx.createRadialGradient(1260, 420, 0, 1260, 420, 700); g.addColorStop(0, rgba(COL.red, .45)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sc = 9.4; drawRobot(ctx, 1290, 470 + 204 * sc, sc, pose({ eye: 1.6, jaw: .35 }), { lw: 9 });
    chromeTitle(ctx, 'AI ENDS', 520, 360, 190);
    chromeTitle(ctx, 'PUB', 520, 570, 190);
    ctx.fillStyle = COL.red; ctx.fillRect(120, 690, 800, 120);
    text(ctx, 'P(DOOM) 99.9%', 520, 778, { px: 82, fam: FONT_T, weight: 900, col: '#000', align: 'center' });
  },
  // B: the reticle locked on Elon's AI-nightmares post
  B(ctx) {
    clear(ctx);
    drawEvidence(ctx, 8.5, { img: 'elon_nightmares', t0: 2, locks: [lk(5.4, 'text', 'MATCH: "AI NIGHTMARES"')], id: 1, zmax: 2.4 }, { x: 400, y: 330, w: 1440, h: 520 });
    chromeTitle(ctx, 'AI ENDS PUB', W / 2, 230, 170);
    ctx.save(); ctx.translate(1540, 930); ctx.rotate(-.06);
    ctx.fillStyle = COL.red; ctx.fillRect(-330, -70, 660, 120);
    text(ctx, 'THE SONG', 0, 18, { px: 84, fam: FONT_T, weight: 900, col: '#000', align: 'center' });
    ctx.restore();
    drawRobot(ctx, 200, 1150, 2.5, POSES.point(0, 1), { lw: 5 });
  },
  // C: please insert disk 2
  C(ctx) {
    clear(ctx);
    const g = ctx.createRadialGradient(1300, 560, 0, 1300, 560, 800); g.addColorStop(0, rgba(COL.red, .3)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    floppy(ctx, 1380, 560, 2.15, -.1, ['DISK 2 OF 2', 'AI ENDS PUB']);
    chromeTitle(ctx, 'AI ENDS', 80, 330, 170, 'left');
    chromeTitle(ctx, 'PUB', 80, 520, 170, 'left');
    text(ctx, 'PLEASE INSERT', 90, 720, { px: 76, fam: FONT_M, col: COL.white, glow: 20 });
    text(ctx, 'DISK 2', 90, 820, { px: 96, fam: FONT_M, col: COL.white, glow: 20 });
    ctx.fillStyle = COL.red; ctx.fillRect(470, 744, 46, 82);
  },
};
window.renderThumb = name => {
  THUMBS[name](SCX);
  post(SC, 3.3, { ca: 2.5, glitch: 0, noise: .04, barrel: .08, flash: 0, bright: 1.05 });
  return document.getElementById('out').toDataURL('image/png');
};
