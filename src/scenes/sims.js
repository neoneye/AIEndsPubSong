// sims.js: robot "SIMULATION" scenes for the lyric lines that have no meme image.

// a window like the evidence panel, titled SIMULATION; returns the inner rect (already clipped by the caller)
function simWindow(ctx, t, s, title, right = 'RENDER: WIREFRAME') {
  const { x, y, w, h } = PANEL, open = easeOut(seg(t, s.t0 - .05, s.t0 + .3)), oh = h * open, oy = y + (h - oh) / 2;
  ctx.fillStyle = 'rgba(8,2,2,.95)'; ctx.fillRect(x, oy, w, oh);
  ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2; ctx.strokeRect(x, oy, w, oh);
  brackets(ctx, x - 8, oy - 8, w + 16, oh + 16, 34, 4, COL.red);
  ctx.fillStyle = COL.redDeep; ctx.fillRect(x, oy, w, Math.min(34, oh));
  if (open > .3) {
    text(ctx, `SIMULATION ${String(s.i).padStart(2, '0')} // ${title}`, x + 14, oy + 24, { px: 20, fam: FONT_T, weight: 700, col: COL.red, spacing: 2 });
    text(ctx, right, x + w - 14, oy + 23, { px: 19, col: COL.redHi, align: 'right' });
  }
  return { x: x + 4, y: oy + 36, w: w - 8, h: Math.max(0, oh - 40), open };
}
function withClip(ctx, r, fn) { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); fn(); ctx.restore(); }
// a stamped label: slams in at time a
function stamp(ctx, t, a, s, x, y, { px = 64, rot = -.08, col = COL.red, box = true } = {}) {
  const k = seg(t, a, a + .18); if (k <= 0) return;
  const sc = 1 + 1.6 * (1 - easeOut(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = k;
  font(ctx, px, FONT_T, 900); ctx.letterSpacing = '4px'; const w = ctx.measureText(s).width;
  if (box) { ctx.strokeStyle = col; ctx.lineWidth = px * .09; ctx.strokeRect(-w / 2 - 22, -px * .95, w + 44, px * 1.3); }
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(s, 0, 0);
  ctx.restore();
}
function toast(ctx, t, a, s, x, y, col = COL.red) {
  const k = seg(t, a, a + .15); if (k <= 0) return;
  font(ctx, 26, FONT_M); const w = ctx.measureText(s).width + 30;
  ctx.fillStyle = rgba('#000', .85); ctx.fillRect(x, y, w * easeOut(k), 44);
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, y, w * easeOut(k), 44);
  if (k > .6) text(ctx, s, x + 15, y + 31, { px: 26, col });
}
function globe(ctx, cx, cy, r, t, col = COL.red, lw = 2) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.fillStyle = rgba(COL.redDeep, .8); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.stroke();
  for (let i = -2; i <= 2; i++) { const yy = cy + i * r / 3, rr = Math.sqrt(1 - Math.pow(i / 3, 2)) * r; ctx.beginPath(); ctx.ellipse(cx, yy, rr, rr * .18, 0, 0, TAU); ctx.globalAlpha = .6; ctx.stroke(); }
  for (let i = 0; i < 6; i++) { const a = frac(i / 6 + t * .08) * Math.PI; ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * r, r, 0, 0, TAU); ctx.globalAlpha = .5; ctx.stroke(); }
  ctx.restore();
}

// 19-22: "I don't like this Black Mirror episode"
SCENES.blackMirror = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'EPISODE REVIEW', 'CHANNEL: BLACK MIRROR');
  withClip(ctx, r, () => {
    floorGrid(ctx, t, { hy: 640, alpha: .35 });
    // the TV
    const tx = 1050, ty = 260, tw = 520, th = 380;
    ctx.fillStyle = '#120404'; ctx.fillRect(tx - 30, ty - 30, tw + 60, th + 60);
    glowStroke(ctx, () => { ctx.beginPath(); ctx.rect(tx - 30, ty - 30, tw + 60, th + 60); }, COL.red, 3, 2);
    ctx.fillStyle = '#000'; ctx.fillRect(tx, ty, tw, th);
    // the screen is black, and shows the viewer's reflection
    drawRobot(ctx, tx + tw * .35, ty + th + 40, .85, POSES.idle(t), { alpha: .25, glow: false, col: '#ffffff' });
    // crack
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3; let px = tx + tw * .62, py = ty + th * .38; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 1; j < 5; j++) { px += Math.cos(a + (hash2(i, j) - .5)) * 40; py += Math.sin(a + (hash2(i, j) - .5)) * 40; ctx.lineTo(px, py); } ctx.stroke(); }
    text(ctx, 'NOW PLAYING: S07E04', tx, ty + th + 70, { px: 24, col: COL.redHi });
    // the viewer shakes its head, then shrugs
    const shake = t < 19.9 ? 0 : Math.sin((t - 19.9) * 18) * 14 * (1 - seg(t, 20.6, 21.2));
    const P = blendPose(POSES.idle(t), POSES.shrug(t), seg(t, 21.0, 21.4)); P.head += shake; P.look = .6;
    drawRobot(ctx, 600, 820, 2.0, P);
    // rating
    const stars = '★☆☆☆☆';
    text(ctx, 'RATING', 330, 260, { px: 26, col: COL.redHi });
    text(ctx, stars, 330, 320, { px: 60, col: COL.red, alpha: seg(t, 19.5, 19.8) });
  });
  stamp(ctx, t, 20.0, 'DISLIKE', 1310, 470, { px: 70 });
};

// 22.4-24.8: "We have you in safe hands!"
SCENES.safeHands = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'HUMANITY CONTAINMENT', 'STATUS: SECURE');
  withClip(ctx, r, () => {
    const cx = W / 2, cy = 470, R = 190, close = easeInOut(seg(t, 22.6, 24.4));
    globe(ctx, cx, cy, R, t);
    text(ctx, 'HUMANITY', cx, cy + 8, { px: 34, fam: FONT_T, weight: 800, col: COL.white, align: 'center' });
    // two skeletal hands cup the globe: palms under it, fingers following its surface up the sides
    for (const side of [-1, 1]) {
      const palm = [cx + side * 150, cy + R + 70], wrist = [cx + side * 330, cy + R + 330];
      const bones = [];
      // forearm struts and the palm
      bones.push([wrist, palm], [[wrist[0] - side * 40, wrist[1] + 10], [palm[0] - side * 50, palm[1] + 20]]);
      for (let f = 0; f < 4; f++) {
        // each finger starts on the palm's rim and wraps around the globe at radius R + 22
        let ang = Math.PI / 2 - side * (.35 + f * .2);           // start below the globe, fanning outward
        const knuckle = [cx + Math.cos(ang) * (R + 48), cy + Math.sin(ang) * (R + 48)];
        bones.push([palm, knuckle]);
        let prev = knuckle; const reach = (.45 + .25 * close) * (1 - f * .12);
        for (let j = 0; j < 3; j++) {
          ang -= side * reach / 1.0;
          const rr = R + 30 - j * 4, p = [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
          bones.push([prev, p]); prev = p;
        }
      }
      glowStroke(ctx, () => { ctx.beginPath(); for (const [p, q] of bones) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); } }, COL.red, 6, 2.2);
      ctx.fillStyle = COL.bg; ctx.strokeStyle = COL.red; ctx.lineWidth = 3;
      for (const [, q] of bones) { ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
  });
  toast(ctx, t, 23.0, 'GRIP STRENGTH: 100%', 260, 780);
};

// 24.8-28.7: "I want off this wild ride" on an exponential rollercoaster
SCENES.wildRide = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'RIDE: EXPONENTIAL', 'EXIT: NOT FOUND');
  withClip(ctx, r, () => {
    const X = u => 240 + u * 1400, Y = u => 860 - (Math.exp(u * 4) - 1) / (Math.exp(4) - 1) * 700;
    // rails and sleepers
    glowStroke(ctx, () => { ctx.beginPath(); for (let k = 0; k <= 100; k++) { const u = k / 100; k ? ctx.lineTo(X(u), Y(u)) : ctx.moveTo(X(u), Y(u)); } }, COL.red, 3, 2);
    ctx.strokeStyle = COL.redDim; ctx.lineWidth = 3;
    for (let k = 0; k <= 50; k++) { const u = k / 50; line(ctx, X(u), Y(u), X(u), Y(u) + 22); }
    // axes
    ctx.strokeStyle = COL.redDim; line(ctx, 240, 880, 1660, 880); line(ctx, 240, 880, 240, 140);
    text(ctx, 'CAPABILITY', 250, 160, { px: 22, col: COL.redHi });
    // the cart accelerates up the curve
    const u = clamp(Math.pow(seg(t, 24.9, 28.7), 1.8) * .93), x = X(u), y = Y(u), dx = X(u + .01) - x, dy = Y(u + .01) - y, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = '#100303'; ctx.fillRect(-70, -60, 140, 50); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.strokeRect(-70, -60, 140, 50);
    ctx.restore();
    const sh = (hash(frameN(t)) - .5) * 10 * u;
    drawRobot(ctx, x - Math.sin(a) * 30 + sh, y - 30, .9, POSES.armsUp(t, 1), {});
    text(ctx, `SPEED ${(Math.exp(u * 6) * 12).toFixed(0)} KM/H`, 1300, 820, { px: 30, col: COL.red });
  });
  stamp(ctx, t, 26.6, 'EXIT DENIED', 560, 330, { px: 60, rot: -.12 });
};

// 53.7-59.4: "What a poor robot, why not give it internet access and some nuclear weapons?"
SCENES.poorRobot = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'WELFARE CHECK', 'SUBJECT: SAD ROBOT');
  withClip(ctx, r, () => {
    floorGrid(ctx, t, { hy: 640, alpha: .35 });
    const happy = seg(t, 57.8, 58.4);
    const P = blendPose(POSES.sad(t), POSES.armsUp(t, 1), happy);
    drawRobot(ctx, W / 2, 830, 2.0, P);
    if (t < 55.4) text(ctx, '"poor robot"', W / 2, 260, { px: 34, col: COL.redHi, align: 'center', alpha: seg(t, 54.0, 54.3) });
    // an ethernet cable snakes in from the left
    const c = easeOut(seg(t, 55.6, 56.6));
    if (c > 0) {
      glowStroke(ctx, () => { ctx.beginPath(); ctx.moveTo(150, 700); ctx.bezierCurveTo(400, 900, 500, 500, 150 + 600 * c, 600); }, COL.redHi, 4, 2);
      const px = 150 + 600 * c; ctx.fillStyle = COL.white; ctx.fillRect(px - 10, 586, 34, 28); ctx.fillStyle = COL.red; ctx.fillRect(px + 24, 592, 10, 16);
      toast(ctx, t, 56.4, 'INTERNET ACCESS: GRANTED', 220, 330);
    }
    // the button rises on the right
    const b = easeOut(seg(t, 57.2, 57.9));
    if (b > 0) {
      const bx = 1380, by = 860 - 260 * b;
      ctx.fillStyle = '#1a0606'; ctx.fillRect(bx - 90, by, 180, 260); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.strokeRect(bx - 90, by, 180, 260);
      ctx.fillStyle = COL.red; ctx.beginPath(); ctx.ellipse(bx, by - 10, 70, 30, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.redHi; ctx.beginPath(); ctx.ellipse(bx, by - 22, 60, 24, 0, 0, TAU); ctx.fill();
      text(ctx, 'NUKE', bx, by + 70, { px: 38, fam: FONT_T, weight: 900, col: COL.red, align: 'center' });
      // hazard stripes
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? COL.red : '#000'; ctx.fillRect(bx - 90 + k * 30, by + 210, 30, 20); }
      toast(ctx, t, 58.0, 'LAUNCH CODES: AUTHORIZED', 1060, 330);
    }
  });
  stamp(ctx, t, 58.4, 'MOOD: IMPROVED', W / 2, 260, { px: 54, rot: .05 });
};

// 96.4-99.0: "perfectly safe"
SCENES.perfectlySafe = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'AGENT CONTAINMENT', 'SANDBOX v2.0');
  withClip(ctx, r, () => {
    floorGrid(ctx, t, { hy: 640, alpha: .35 });
    const cx = W / 2, cy = 520, a = 300, d = 70;
    // a wireframe cube
    const F = [[cx - a, cy - a], [cx + a, cy - a], [cx + a, cy + a], [cx - a, cy + a]], B = F.map(([x, y]) => [x + d, y - d]);
    ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2; poly(ctx, B); ctx.stroke(); for (let i = 0; i < 4; i++) line(ctx, F[i][0], F[i][1], B[i][0], B[i][1]);
    // robot inside tapping on the glass
    const tap = Math.max(0, Math.sin((t - 96.4) * 9)) * seg(t, 97.6, 97.8);
    drawRobot(ctx, cx, cy + a - 20, 2.1, blendPose(POSES.idle(t), pose({ rA: 70 + tap * 12, rE: 40, look: .5, head: -4 }), seg(t, 97.2, 97.6)));
    glowStroke(ctx, () => poly(ctx, F), COL.red, 3, 2);
    // padlock on the front
    const lx = cx + a - 40, ly = cy + 40;
    ctx.fillStyle = '#1e0505'; ctx.fillRect(lx - 40, ly, 80, 70); ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.strokeRect(lx - 40, ly, 80, 70);
    ctx.beginPath(); ctx.arc(lx, ly, 26, Math.PI, 0); ctx.stroke(); ctx.fillStyle = COL.red; ctx.fillRect(lx - 4, ly + 25, 8, 22);
  });
  stamp(ctx, t, 96.65, 'PERFECTLY SAFE', W / 2, 250, { px: 68, rot: -.05 });
};

// 127.7-130.9: "IM MAXIMIZINGGGGG OOOHHHH"
SCENES.maximizing = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'OBJECTIVE: MAXIMIZE', 'REWARD: UNBOUNDED');
  const lt = t - s.t0, k = seg(t, s.t0, s.t1);
  withClip(ctx, r, () => {
    // radial burst
    ctx.save(); ctx.translate(W / 2, 520);
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + lt * (.4 + 2 * k); ctx.strokeStyle = rgba(COL.red, .15 + .3 * pulse(t)); ctx.lineWidth = 14; line(ctx, Math.cos(a) * 160, Math.sin(a) * 160, Math.cos(a) * 1400, Math.sin(a) * 1400); }
    ctx.restore();
    // spinning robot: the horizontal squash fakes a turn
    const spin = Math.pow(lt, 2) * 4;
    drawRobot(ctx, W / 2, 860, 2.0, POSES.armsUp(t, 1), { sx: Math.cos(spin) });
    // counters
    const big = Math.exp(lt * 9), rows = [['PAPERCLIPS', big * 1e6], ['GPUS', big * 4e3], ['REWARD', big * 77], ['P(DOOM)', 50 + k * 49]];
    rows.forEach(([lab, v], i) => {
      const y = 260 + i * 92, over = lt > 2.2 + i * .15;
      const s2 = lab === 'P(DOOM)' ? v.toFixed(1) + '%' : over ? 'OVERFLOW' : v.toExponential(3).toUpperCase();
      text(ctx, lab, 280, y, { px: 28, col: COL.redHi });
      text(ctx, s2, 280, y + 46, { px: 44, fam: FONT_T, weight: 800, col: over ? COL.white : COL.red });
    });
  });
};

// 178.8-183.7: "AI WILL create some jobs; And then it will replace those too"
const NEW_JOBS = ['PROMPT ENGINEER', 'AI TRAINER', 'DATA LABELER', 'AGENT WRANGLER', 'VIBE CODER', 'RED TEAMER', 'EVAL WRITER', 'AI ETHICIST'];
SCENES.jobs = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'LABOR MARKET', 'NEW JOBS: 8');
  withClip(ctx, r, () => {
    NEW_JOBS.forEach((j, i) => {
      const col = i % 2, row = i >> 1, x = 280 + col * 560, y = 190 + row * 150;
      const born = 179.0 + i * .16, flip = 181.3 + i * .17;
      const kb = easeOut(seg(t, born, born + .2)); if (kb <= 0) return;
      const kf2 = seg(t, flip, flip + .22), sy = Math.abs(Math.cos(kf2 * Math.PI)), replaced = kf2 > .5;
      ctx.save(); ctx.translate(x + 250, y + 55); ctx.scale(kb, sy || .02);
      ctx.fillStyle = replaced ? COL.red : '#140404'; ctx.fillRect(-250, -55, 500, 110);
      ctx.strokeStyle = replaced ? COL.white : COL.red; ctx.lineWidth = 3; ctx.strokeRect(-250, -55, 500, 110);
      text(ctx, replaced ? 'REPLACED BY AI' : 'NEW JOB', -230, -18, { px: 20, col: replaced ? '#000' : COL.redHi });
      text(ctx, j, -230, 30, { px: 38, fam: FONT_T, weight: 800, col: replaced ? '#000' : COL.white });
      ctx.restore();
    });
    const P = blendPose(POSES.point(t, seg(t, 179.0, 179.4)), POSES.shrug(t), seg(t, 182.0, 182.4));
    drawRobot(ctx, 1520, 860, 1.75, P);
  });
};

// 183.7-186.8: "Now hiring data breach engineers"
SCENES.hiring = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'RECRUITING TERMINAL', 'CAREERS.SKYNET');
  withClip(ctx, r, () => {
    if (frac(t * 2.5) < .7) text(ctx, 'NOW HIRING', 300, 290, { px: 110, fam: FONT_T, weight: 900, col: COL.red, glow: 30, spacing: 6 });
    const lines = ['POSITION ........ DATA BREACH ENGINEER', 'TEAM ............ EXFILTRATION', 'REQUIREMENTS .... NONE (THE AGENT DOES IT)', 'SALARY .......... EXPOSURE', 'APPLY ........... WE ALREADY HAVE YOUR DATA'];
    lines.forEach((l, i) => { const a = 184.1 + i * .4; text(ctx, typed(l, seg(t, a, a + .35)), 300, 420 + i * 62, { px: 34, col: i === 4 ? COL.white : COL.redHi }); });
    drawRobot(ctx, 1500, 860, 1.7, POSES.type(t));
    ctx.fillStyle = '#140404'; ctx.fillRect(1380, 740, 260, 30); ctx.strokeStyle = COL.red; ctx.lineWidth = 2; ctx.strokeRect(1380, 740, 260, 30);
  });
};

// 186.8-189.3: "The final door will be 'AI Engineers'"
const DOORS = ['TRANSLATOR', 'ARTIST', 'CALL CENTER', 'MUSICIAN', 'DEVELOPER', 'JOURNALIST', 'MATHEMATICIAN', 'CEO'];
SCENES.finalDoor = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'CAREER CORRIDOR', 'DOORS REMAINING: ' + Math.max(1, 8 - Math.floor(seg(t, 186.9, 188.0) * 8)));
  withClip(ctx, r, () => {
    const vx = W / 2, vy = 470, push = easeInOut(seg(t, 186.8, 189.3)) * .35;
    // corridor: doors on both walls receding to the end door
    const P = z => 1 / (z + .25 - push * .2);
    ctx.strokeStyle = COL.redDim; ctx.lineWidth = 2;
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) line(ctx, vx + x * 1200, vy + y * 700, vx + x * 120, vy + y * 75);
    DOORS.forEach((d, i) => {
      const side = i % 2 ? 1 : -1, z0 = .3 + (i >> 1) * .55, z1 = z0 + .35;
      const x0 = vx + side * 280 * P(z0), x1 = vx + side * 280 * P(z1), yt0 = vy - 220 * P(z0), yb0 = vy + 300 * P(z0), yt1 = vy - 220 * P(z1), yb1 = vy + 300 * P(z1);
      const shut = seg(t, 186.95 + i * .14, 187.1 + i * .14);
      // the door swings shut: its free edge sweeps from the corridor wall to the frame
      const xe = lerp(vx + side * 120, x1, easeIn(shut));
      ctx.fillStyle = '#000'; poly(ctx, [[x0, yt0], [x1, yt1], [x1, yb1], [x0, yb0]]); ctx.fill();
      ctx.fillStyle = shut >= 1 ? '#3a0808' : '#1a0505'; poly(ctx, [[x0, yt0], [xe, yt1], [xe, yb1], [x0, yb0]]); ctx.fill();
      ctx.strokeStyle = COL.red; ctx.lineWidth = 3; poly(ctx, [[x0, yt0], [x1, yt1], [x1, yb1], [x0, yb0]]); ctx.stroke();
      ctx.save(); ctx.translate((x0 + x1) / 2, yt0 + (yb0 - yt0) * .25); const sc = P(z0) * .28; ctx.scale(sc, sc);
      text(ctx, d, 0, 0, { px: 44, fam: FONT_T, weight: 700, col: shut >= 1 ? COL.redHi : COL.white, align: 'center' });
      if (shut >= 1) text(ctx, 'CLOSED', 0, 60, { px: 40, col: COL.red, align: 'center' });
      ctx.restore();
    });
    // the end door
    const ew = 230, eh = 320, glow = .5 + .5 * Math.sin(t * 8), lock = seg(t, 188.6, 188.8);
    ctx.fillStyle = lock > 0 ? '#2a0606' : rgba(COL.red, .25 + .2 * glow); ctx.fillRect(vx - ew / 2, vy - eh / 2, ew, eh);
    glowStroke(ctx, () => { ctx.beginPath(); ctx.rect(vx - ew / 2, vy - eh / 2, ew, eh); }, COL.red, 4, 2.5);
    text(ctx, 'AI', vx, vy - 40, { px: 60, fam: FONT_T, weight: 900, col: COL.white, align: 'center' });
    text(ctx, 'ENGINEERS', vx, vy + 10, { px: 30, fam: FONT_T, weight: 800, col: COL.white, align: 'center' });
  });
  stamp(ctx, t, 188.6, 'FINAL DOOR', W / 2, 820, { px: 50, rot: 0 });
};

// 218.7-224.2: "Treat insects the way you want a super-intelligence to treat you."
function beetle(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glowStroke(ctx, () => {
    ctx.beginPath(); ctx.ellipse(0, 0, 40, 26, 0, 0, TAU); ctx.moveTo(40, 0); ctx.arc(52, 0, 13, Math.PI, Math.PI * 3);
    ctx.moveTo(-36, 0); ctx.lineTo(36, 0);
    for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) { const w = Math.sin(t * 14 + i * 2 + sd) * 6; ctx.moveTo(i * 20, sd * 20); ctx.lineTo(i * 24 + w, sd * 42); ctx.lineTo(i * 30 + w, sd * 52); }
    ctx.moveTo(60, -8); ctx.lineTo(80, -24); ctx.moveTo(60, 8); ctx.lineTo(80, 24);
  }, COL.red, 2.5, 2);
  ctx.restore();
}
SCENES.insects = (ctx, t, s) => {
  const r = simWindow(ctx, t, s, 'PRECEDENT', 'GOLDEN RULE: LOGGED');
  withClip(ctx, r, () => {
    const up = easeInOut(seg(t, 221.0, 223.6));
    // the giant looms behind, revealed as the camera tilts up
    drawRobot(ctx, W / 2 + 120, 1500 + 380 * (1 - up), 6.2, pose({ head: 16, lA: 14, rA: 14, eye: 1.4 }), { alpha: .55 + .45 * up, lw: 6 });
    // its shadow falls over the floor
    const g = ctx.createLinearGradient(0, 600, 0, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba('#000', .7 * up));
    floorGrid(ctx, t, { hy: 660, alpha: .3 });
    ctx.fillStyle = g; ctx.fillRect(r.x, 600, r.w, 300);
    // small robot kneels by a beetle
    drawRobot(ctx, 760, 860, 1.1, POSES.kneel(t, seg(t, 219.0, 219.6)));
    beetle(ctx, 960 + Math.sin(t * .8) * 20, 845, 1, t);
    toast(ctx, t, 220.3, 'INSECT: SPARED', 980, 700);
  });
  stamp(ctx, t, 223.6, 'REMEMBER THIS', W / 2, 250, { px: 60, rot: -.04 });
};
