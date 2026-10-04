// robot.js: a rigged red wireframe endoskeleton (T-800 style), seen from the front, plus a pose library.
// Robot space: origin on the ground between the feet, y down, ~220 units tall. Angles in degrees.
// Arms: a = upper arm angle from straight down, rotating outward; e = elbow bend, continuing the rotation.
// Legs: a = outward splay; lift (0..1) raises the knee toward the camera (the thigh foreshortens).

const POSE0 = { bob: 0, lean: 0, head: 0, look: 0, jaw: 0, eye: 1, crouch: 0,
  lA: 8, lE: 8, rA: 8, rE: 8, lL: 4, rL: 4, lLift: 0, rLift: 0, lHand: 0, rHand: 0 };
const pose = o => Object.assign({}, POSE0, o);
const blendPose = (a, b, k) => { const o = {}; for (const key in POSE0) o[key] = lerp(a[key] ?? POSE0[key], b[key] ?? POSE0[key], clamp(k)); return o; };

const POSES = {
  idle: t => pose({ bob: 1.5 * Math.sin(t * 2.1), lA: 8 + Math.sin(t * 1.3) * 2, rA: 8 - Math.sin(t * 1.1) * 2, head: Math.sin(t * .7) * 3 }),
  // in-place march on the beat: knees lift alternately, arms swing stiffly
  march: (t, amp = 1) => {
    const b = beatF(t) * Math.PI, s = Math.sin(b);
    return pose({ bob: -Math.abs(s) * 4 * amp, lLift: Math.max(0, s) * .9 * amp, rLift: Math.max(0, -s) * .9 * amp,
      lA: 6 + 14 * Math.max(0, -s) * amp, rA: 6 + 14 * Math.max(0, s) * amp, lE: 20, rE: 20, head: 0 });
  },
  salute: (t, k = 1) => blendPose(POSES.idle(t), pose({ rA: 92, rE: 128, lA: 4, lE: 4, head: -2, rHand: 1 }), easeOut(k)),
  point: (t, k = 1) => blendPose(POSES.idle(t), pose({ rA: 128, rE: 4, lA: 10, lE: 20, look: .4 }), easeOut(k)),
  shrug: (t, k = 1) => blendPose(POSES.idle(t), pose({ lA: 38, lE: 95, rA: 38, rE: 95, head: 8, bob: -4, lHand: 1, rHand: 1 }), easeOut(k)),
  laugh: t => { const j = .5 + .5 * Math.sin(t * 26); return pose({ jaw: j, head: -10 + 4 * Math.sin(t * 13), bob: -3 * j, lA: 22, lE: 60, rA: 22, rE: 60, eye: 1.3 }); },
  sing: (t, k = 1) => pose({ jaw: .6 + .4 * Math.sin(t * 9), lA: 70 * k + 8, rA: 70 * k + 8, lE: 25, rE: 25, head: -6, eye: 1.4, bob: 2 * Math.sin(t * 3) }),
  sad: t => pose({ head: 18, eye: .35, lA: 3, rA: 3, lE: 2, rE: 2, bob: 4 }),
  kneel: (t, k = 1) => pose({ crouch: easeOut(k), lA: 12, rA: 40, rE: 70, head: 14, lL: 10, rL: 10 }),
  type: t => pose({ lA: 18, lE: 105 + 6 * Math.sin(t * 31), rA: 18, rE: 105 + 6 * Math.sin(t * 27 + 1), head: 10, look: 0 }),
  armsUp: (t, k = 1) => blendPose(POSES.idle(t), pose({ lA: 160, rA: 160, lE: 10, rE: 10, head: -12, jaw: .8, eye: 1.5 }), easeOut(k)),
  hold: t => pose({ lA: 28, lE: 75, rA: 28, rE: 75, head: 6 }),           // hands together in front (holding something)
  reach: (t, k = 1) => blendPose(POSES.idle(t), pose({ rA: 60, rE: 10, lA: 10, head: 6, look: .3 }), easeOut(k)),
};

const D2R = Math.PI / 180;
// draw one robot. opts: { col, alpha, lw (screen px), sx (horizontal squash, fakes turning), glow }
function drawRobot(ctx, x, y, s, P, opts = {}) {
  const col = opts.col || COL.red, lw = opts.lw || Math.max(1.3, s * 2.4), sxf = opts.sx ?? 1;
  const crouch = P.crouch * 52;
  const hipY = -104 + P.bob + crouch, neckY = -168 + P.bob + crouch, shY = -160 + P.bob + crouch;
  const lean = P.lean * D2R;
  // robot → screen (with torso lean about the hip)
  const S = (px, py) => {
    if (py < hipY) { const dy = py - hipY; px += -Math.sin(lean) * dy; }
    return [x + px * s * sxf, y + py * s];
  };
  const segs = [];       // line segments, stroked in one path
  const M = (a, b) => segs.push([S(a[0], a[1]), S(b[0], b[1])]);
  const chain = pts => { for (let i = 1; i < pts.length; i++) M(pts[i - 1], pts[i]); };
  const bone = (a, b, wd = 3.2) => {   // a doubled bone: two parallel struts
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * wd, ny = dx / L * wd;
    M([a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]); M([a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny]);
  };
  const joints = [];

  // legs
  for (const side of [-1, 1]) {
    const a = (side < 0 ? P.lL : P.rL) * D2R, lift = side < 0 ? P.lLift : P.rLift;
    const hip = [side * 15, hipY];
    // crouch: knees splay outward and the thighs shorten
    const thighL = 50 * Math.cos(lift * 1.15) * (1 - P.crouch * .35), spread = a + P.crouch * .55;
    const knee = [hip[0] + side * Math.sin(spread) * thighL, hip[1] + Math.cos(spread) * thighL];
    const footY = P.crouch > 0 ? 0 : Math.min(0, knee[1] + 48);
    const ankle = [knee[0] + side * (P.crouch * 14), P.crouch > 0 ? -6 : knee[1] + 46];
    bone(hip, knee); bone(knee, ankle, 2.6);
    chain([[ankle[0] - 9, ankle[1] + 6], [ankle[0] + side * 16, ankle[1] + 6], [ankle[0] + side * 12, ankle[1] - 2], [ankle[0] - 6, ankle[1] - 2], [ankle[0] - 9, ankle[1] + 6]]);
    joints.push(knee, hip);
  }
  // pelvis
  chain([[-22, hipY - 10], [22, hipY - 10], [15, hipY + 6], [6, hipY + 12], [-6, hipY + 12], [-15, hipY + 6], [-22, hipY - 10]]);
  // spine with vertebrae
  M([0, hipY - 10], [0, neckY]);
  for (let k = 1; k < 9; k++) { const vy = lerp(hipY - 10, neckY, k / 9), w = 5 + (k > 4 ? 0 : 2); M([-w, vy], [w, vy]); }
  // ribcage: four pairs of ribs curving down from the spine
  for (let r = 0; r < 4; r++) {
    const ry = shY + 10 + r * 9, wd = 30 - r * 3;
    for (const side of [-1, 1]) chain([[0, ry], [side * wd * .6, ry - 3], [side * wd, ry + 4], [side * wd * .9, ry + 12], [side * wd * .45, ry + 15]]);
  }
  // clavicles and shoulders
  M([-36, shY], [36, shY]);
  // arms
  for (const side of [-1, 1]) {
    const a = (side < 0 ? P.lA : P.rA) * D2R, e = (side < 0 ? P.lE : P.rE) * D2R, hand = side < 0 ? P.lHand : P.rHand;
    const sh = [side * 36, shY];
    const el = [sh[0] + side * Math.sin(a) * 40, sh[1] + Math.cos(a) * 40];
    const fa = a + e, wr = [el[0] + side * Math.sin(fa) * 38, el[1] + Math.cos(fa) * 38];
    bone(sh, el, 3); bone(el, wr, 2.4);
    // fingers: three short spokes (spread when hand = 1, an open palm)
    for (let f = -1; f <= 1; f++) {
      const fa2 = fa + f * (.25 + .35 * hand);
      M(wr, [wr[0] + side * Math.sin(fa2) * 13, wr[1] + Math.cos(fa2) * 13]);
    }
    joints.push(sh, el, wr);
  }
  // neck pistons
  M([-5, neckY], [-6, neckY - 12]); M([5, neckY], [6, neckY - 12]);
  // skull (tilted by P.head about the neck)
  const hr = P.head * D2R, hx = 0, hy = neckY - 12, lk = P.look * 6;
  const H2 = (px, py) => { const c = Math.cos(hr), sn = Math.sin(hr); return [hx + px * c - py * sn, hy + px * sn + py * c]; };
  const skull = [[-17, -4], [-20, -22], [-18, -36], [-10, -46], [0, -48], [10, -46], [18, -36], [20, -22], [17, -4]];
  chain(skull.map(p => H2(p[0], p[1])));
  // cheekbones and the nasal cavity
  chain([[-17, -4], [-12, -12], [-4, -14]].map(p => H2(p[0], p[1]))); chain([[17, -4], [12, -12], [4, -14]].map(p => H2(p[0], p[1])));
  chain([[-3, -15], [0, -21], [3, -15], [-3, -15]].map(p => H2(p[0], p[1])));
  // eye sockets
  for (const side of [-1, 1]) chain([[side * 4, -27], [side * 9, -32], [side * 16, -30], [side * 16, -24], [side * 9, -22], [side * 4, -27]].map(p => H2(p[0], p[1])));
  // jaw with teeth, dropping open with P.jaw
  const jd = P.jaw * 9;
  chain([[-14, -6], [-12, 2 + jd], [12, 2 + jd], [14, -6]].map(p => H2(p[0], p[1])));
  for (let k = -3; k <= 3; k++) { M(H2(k * 3, -9), H2(k * 3, -5)); M(H2(k * 3, -2 + jd), H2(k * 3, 2 + jd)); }

  ctx.save(); ctx.globalAlpha *= opts.alpha ?? 1;
  const path = () => { ctx.beginPath(); for (const [a, b] of segs) { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } };
  if (opts.glow === false) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; path(); ctx.stroke(); }
  else glowStroke(ctx, path, col, lw, 2.6);
  // joints
  ctx.fillStyle = COL.bg; ctx.strokeStyle = col; ctx.lineWidth = lw * .8;
  for (const j of joints) { const [px, py] = S(j[0], j[1]); ctx.beginPath(); ctx.arc(px, py, Math.max(2, 4.2 * s), 0, TAU); ctx.fill(); ctx.stroke(); }
  // glowing eyes
  const eyeA = clamp(P.eye, 0, 1.6);
  for (const side of [-1, 1]) {
    const [ex, ey] = S(...H2(side * 10 + lk, -27));
    const r = Math.max(2.2, 4.4 * s);
    ctx.fillStyle = rgba(COL.red, .25 * eyeA); ctx.beginPath(); ctx.arc(ex, ey, r * 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(COL.redHi, .95 * Math.min(1, eyeA)); ctx.beginPath(); ctx.arc(ex, ey, r, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba('#ffffff', .8 * Math.min(1, eyeA)); ctx.beginPath(); ctx.arc(ex, ey, r * .4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// perspective floor grid (the classic HUD ground plane), horizon at hy
function floorGrid(ctx, t, { hy = 600, col = COL.red, alpha = .5, speed = 0, top = 0 } = {}) {
  ctx.save(); ctx.strokeStyle = rgba(col, alpha); ctx.lineWidth = 1.5;
  const vx = W / 2;
  for (let i = -24; i <= 24; i++) line(ctx, vx + i * 14, hy, vx + i * 260, H + 40);
  const off = frac(t * speed);
  for (let j = 0; j < 18; j++) {
    const z = Math.pow((j + off) / 18, 2.2), yy = hy + (H + 40 - hy) * z;
    ctx.globalAlpha = .3 + .7 * z; line(ctx, 0, yy, W, yy);
  }
  ctx.restore();
}
