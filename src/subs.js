// subs.js: subtitles in the bottom band. Each line types out as it is sung; the word being sung is red,
// sung words are white. Long lines wrap; only the last two rows stay up.

const SUB = { y: 968, maxW: 1480, px: 44, rowH: 56 };

function currentLine(t) {
  for (let i = LINES.length - 1; i >= 0; i--) if (t >= LINES[i].t0 && t < LINES[i].t1) return LINES[i];
  return null;
}

function drawSubs(ctx, t) {
  const L = currentLine(t); if (!L) return;
  const fadeOut = 1 - seg(t, L.t1 - .2, L.t1);
  ctx.save(); ctx.globalAlpha = fadeOut;
  const ws = L.words, n = ws.length;
  // the visible text of each word: typed out in the 0.14 s after its timestamp
  const vis = ws.map(([wt, w], i) => {
    if (t < wt - .04) return '';
    const nextT = i + 1 < n ? ws[i + 1][0] : wt + .6;
    let s = w;
    if (/^A{5,}$/.test(w)) { const k = seg(t, wt, wt + 2.2); s = 'A'.repeat(Math.max(1, Math.round(4 + 22 * k))); }
    return typed(s, seg(t, wt - .04, wt - .04 + Math.min(.14, Math.max(.05, nextT - wt))));
  });
  let cur = -1; for (let i = 0; i < n; i++) if (t >= ws[i][0] - .04) cur = i;
  const px = n > 16 ? 38 : SUB.px; font(ctx, px, FONT_T, 600);
  // wrap on the full line so words don't jump when the next one arrives
  const full = ws.map(([, w]) => /^A{5,}$/.test(w) ? 'A'.repeat(26) : w);
  const rowsIdx = (() => { const out = [[]]; let wsum = 0; const sp = ctx.measureText(' ').width; full.forEach((w, i) => { const ww = ctx.measureText(w).width; if (out[out.length - 1].length && wsum + sp + ww > SUB.maxW) { out.push([]); wsum = 0; } wsum += (out[out.length - 1].length ? sp : 0) + ww; out[out.length - 1].push(i); }); return out; })();
  let curRow = 0; rowsIdx.forEach((r, ri) => { if (r.includes(cur)) curRow = ri; });
  const firstRow = Math.max(0, curRow - 1), shownRows = rowsIdx.slice(firstRow, firstRow + 2);
  const y0 = SUB.y - (shownRows.length - 1) * SUB.rowH / 2 - (shownRows.length > 1 ? 10 : 0);
  // band backdrop
  ctx.fillStyle = 'rgba(5,1,1,.72)'; ctx.fillRect(170, SUB.y - 66 - (shownRows.length > 1 ? 34 : 0), W - 340, 96 + (shownRows.length > 1 ? 56 : 0));
  shownRows.forEach((r, ri) => {
    const y = y0 + ri * SUB.rowH, sp = ctx.measureText(' ').width;
    const tw = r.reduce((a, i, k) => a + ctx.measureText(full[i]).width + (k ? sp : 0), 0);
    let x = W / 2 - tw / 2;
    if (!r.some(i => vis[i])) return;
    if (ri === 0) text(ctx, '>', x - 40, y, { px: px * .9, fam: FONT_M, col: COL.red });
    r.forEach(i => {
      const s = vis[i], isCur = i === cur;
      if (s) {
        if (isCur) { text(ctx, s, x, y, { px, fam: FONT_T, weight: 700, col: COL.red, glow: 18 }); }
        else text(ctx, s, x, y, { px, fam: FONT_T, weight: 600, col: COL.white });
      }
      if (isCur && frac(t * 3) < .6) { const cw = ctx.measureText(s).width; ctx.fillStyle = COL.red; ctx.fillRect(x + cw + 4, y - px * .78, px * .45, px * .85); }
      x += ctx.measureText(full[i]).width + sp;
    });
  });
  ctx.restore();
}
