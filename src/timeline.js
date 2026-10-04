// timeline.js: the shot list (every moment of the song → one shot), transitions between shots, the CRT
// post-process settings, and drawFrame(t).
//
// Shot kinds: ev (one evidence window), split (two side by side), scene (a function in SCENES).
// tr: [type, duration] is the transition INTO the shot, centred on its start time.

const lk = (t, box, label) => ({ t, box, label });
const ev = (t0, t1, img, locks, o = {}) => ({ kind: 'ev', t0, t1, img, locks, ...o });
const split = (t0, t1, a, b, o = {}) => ({ kind: 'split', t0, t1, a, b, ...o });
const sc = (t0, t1, name, o = {}) => ({ kind: 'scene', t0, t1, name, ...o });

const SHOTS = [
  sc(0, 2.0, 'boot'),
  ev(2.0, 9.4, 'elon_nightmares', [lk(3.1, 'name', 'SOURCE: ELON MUSK'), lk(5.4, 'text', 'MATCH: "AI NIGHTMARES"')], { tr: ['zoom', .5], zmax: 2.6 }),
  ev(9.4, 15.3, 'sacrifice', [lk(10.0, 'header', 'CONTEXT: AI CEOS ON SAFETY'), lk(12.6, 'sub', 'MATCH: "A SACRIFICE"')], { tr: ['slice', .4] }),
  sc(15.3, 18.9, 'titleMarch', { tr: ['wipe', .45] }),
  sc(18.9, 22.4, 'blackMirror', { tr: ['slice', .4] }),
  sc(22.4, 24.8, 'safeHands', { tr: ['rain', .5] }),
  sc(24.8, 28.7, 'wildRide', { tr: ['zoom', .4] }),
  ev(28.7, 43.0, 'covid', [lk(29.1, 'a', 'MATCH: "EARLY DAYS OF COVID"'), lk(37.2, 'b', 'MATCH: "THINGS WILL CHANGE SOON"')], { tr: ['crt', .5], drift: true }),
  sc(43.0, 53.7, 'intercepts', { tr: ['zoom', .7], list: ['richer', 'programmer', 'nice', 'vibe'], start: 43.4 }),
  sc(53.7, 59.4, 'poorRobot', { tr: ['slice', .45] }),
  ev(59.4, 65.9, 'autowar', [lk(60.0, 'name', 'SOURCE: DEFENSE BRIEFING'), lk(62.9, 'quote', 'MATCH: "AUTO-WAR-COM"')], { tr: ['rain', .5] }),
  ev(65.9, 67.6, 'skynet', [lk(66.25, 'screen', 'SKYNET: ONLINE')], { tr: ['static', .35] }),
  ev(67.6, 71.4, 'sarah', [lk(67.9, 'caption', 'MATCH: "SARAH CONNOR"'), lk(69.9, 'face', 'THREAT LEVEL: HIGH')], { tr: ['slice', .35] }),
  ev(71.4, 75.6, 'T2', [lk(72.4, 'sub', 'MATCH: "NOT GONNA MAKE IT"'), lk(74.7, 'face', 'HUMAN: JOHN CONNOR')], { tr: ['static', .4], video: { at: 71.3 }, zmax: 2.4 }),
  // chorus 1
  sc(75.6, 80.3, 'chorusRobots', { tr: ['crt', .5], n: 1, aaa: 75.8, disgust: 78.0 }),
  ev(80.3, 89.6, 'casino', [lk(80.6, 'sign', 'MATCH: "GAMBLING WITH HUMANITY"'), lk(86.3, 'globe', 'ALL IN ON TOMORROW'), lk(88.2, 'play', 'PLAY WITH HUMANITY')], { tr: ['zoom', .5], zmax: 5 }),
  sc(89.6, 96.4, 'armyMarch', { tr: ['slice', .45], flashes: ['sacrifice', 'autowar', 'covid', 'sarah', 'skynet'] }),
  sc(96.4, 99.0, 'perfectlySafe', { tr: ['crt', .45] }),
  ev(99.0, 103.1, 'exfil', [lk(99.1, 'p2', 'MATCH: "WE SANDBOXED THE AGENT"'), lk(101.0, 'p3', 'MATCH: "IMPOSSIBLE TO JAILBREAK"')], { tr: ['slice', .35] }),
  ev(103.1, 106.8, 'escape', [lk(103.4, 'text', 'MATCH: "ESCAPE ROOMS"')], { tr: ['rain', .4] }),
  ev(106.8, 109.0, 'dangerous', [lk(107.0, 'text', 'MATCH: "HOW DANGEROUS ARE YOU?"')], { tr: ['zoom', .35] }),
  ev(109.0, 117.0, 'vial', [lk(109.3, 'text', 'MATCH: "DESIGNED BY AI"'), lk(113.3, 'vial', 'COMPOUND: UNKNOWN'), lk(115.6, 'lab', 'LAB: GARAGE')], { tr: ['slice', .35] }),
  split(117.0, 121.2, { img: 'felony', locks: [lk(117.15, 'title', 'MATCH: "FELONY BENCH"'), lk(118.3, 'bar', 'TOP SCORE: 11')] }, { img: 'crimes', locks: [lk(119.6, 'text', 'MATCH: "COMMIT CRIMES"')] }, { tr: ['wipe', .4] }),
  ev(121.2, 124.3, 'exploit', [lk(121.4, 'title', 'MATCH: "EXPLOIT-BENCH"'), lk(122.6, 'curve', 'SUCCESS RATE: 100%')], { tr: ['static', .35], exploit: true }),
  split(124.3, 127.7, { img: 'pandemic', locks: [lk(124.45, 'title', 'MATCH: "PANDEMIC BENCH"')] }, { img: 'virus', locks: [lk(125.5, 'headline', 'MATCH: "VIRUSES DESIGNED BY AI"')] }, { tr: ['slice', .35] }),
  sc(127.7, 130.9, 'maximizing', { tr: ['zoom', .35] }),
  // chorus 2
  sc(130.9, 135.3, 'chorusRobots', { tr: ['crt', .45], n: 2, aaa: 131.0, disgust: 133.0 }),
  ev(135.3, 142.9, 'casino', [lk(135.45, 'pdoom', 'P(DOOM) 75.5% CONFIRMED'), lk(140.3, 'stakes', 'HIGHER STAKES THAN LIVES'), lk(141.6, 'money', 'MONEY TODAY, HUMANS TOMORROW')], { tr: ['zoom', .4], zmax: 5 }),
  ev(142.9, 151.5, 'lonely', [lk(143.3, 'text', 'MATCH: "SOMEONE CARES"')], { tr: ['rain', .45], drift: true }),
  ev(151.5, 152.6, 'here', [lk(151.75, 'here', 'YOU ARE HERE')], { tr: ['cut', .1], zmax: 3 }),
  split(152.6, 155.8, { img: 'expo_here', locks: [lk(152.9, 'text', 'MATCH: "FROM HERE"')] }, { img: 'expo_arxiv', locks: [lk(154.1, 'spike', 'GROWTH: EXPONENTIAL')] }, { tr: ['slice', .3] }),
  ev(155.8, 158.2, 'wheels', [lk(156.0, 'wheel', 'SELF-IMPROVEMENT: NONE'), lk(157.3, 'caption', 'PANIC: PREMATURE')], { tr: ['static', .3] }),
  ev(158.2, 162.7, 'slowdown', [lk(158.4, 'a', 'MATCH: "LET\'S SLOW DOWN"'), lk(161.4, 'all', '(JUST KIDDING)')], { tr: ['wipe', .35] }),
  ev(162.7, 168.1, 'joke', [lk(162.9, 'top', 'MATCH: "USE AI TO CODE"'), lk(166.1, 'bottom', 'MATCH: "I THOUGHT IT WAS A JOKE"')], { tr: ['slice', .35] }),
  ev(168.1, 173.4, 'riemann', [lk(169.4, 'text', 'MATCH: "RIEMANN HYPOTHESIS"')], { tr: ['rain', .4], drift: true }),
  ev(173.4, 176.5, 'sentient', [lk(173.7, 'text', 'GOAL ACCEPTED')], { tr: ['crt', .35] }),
  ev(176.5, 178.8, 'exfil', [lk(176.65, 'p8', 'MATCH: "LIKE A BOSS"')], { tr: ['zoom', .3] }),
  sc(178.8, 183.7, 'jobs', { tr: ['slice', .35] }),
  sc(183.7, 186.8, 'hiring', { tr: ['static', .35] }),
  sc(186.8, 189.3, 'finalDoor', { tr: ['wipe', .35] }),
  // chorus 3
  sc(189.3, 194.2, 'chorusRobots', { tr: ['crt', .45], n: 3, aaa: 189.4, disgust: 191.6 }),
  ev(194.2, 202.1, 'casino', [lk(194.35, 'roulette', 'AI ROULETTE: ALIGNMENT OR EXTINCTION'), lk(199.9, 'release', 'FASTER CHEAPER LESS SAFE'), lk(201.2, 'odds', 'ONLY ODDS')], { tr: ['zoom', .45], zmax: 5 }),
  ev(202.1, 204.6, 'disaster', [lk(202.4, 'item', 'MATCH: "DATA CENTER"')], { tr: ['slice', .35], zmax: 3.5 }),
  ev(204.6, 210.4, 'ilya', [lk(205.0, 'quote', 'MATCH: "SOLAR PANELS AND DATA CENTERS"')], { tr: ['rain', .4], drift: true }),
  ev(210.4, 212.7, 'easy', [lk(210.6, 'bubble', 'MATCH: "THINK OF THE DATA CENTERS"')], { tr: ['static', .3] }),
  ev(212.7, 218.7, 'energy', [lk(212.95, 'headline', 'MATCH: "CUT ENERGY USE"'), lk(216.5, 'dc', 'YIELD TO: DATA CENTERS')], { tr: ['slice', .35] }),
  sc(218.7, 224.2, 'insects', { tr: ['zoom', .6] }),
  ev(224.2, 228.0, 'notHim', [lk(224.35, 'wait', 'MATCH: "WAIT! NOT HIM!"'), lk(225.8, 'thanked', 'MATCH: "HE ALWAYS THANKED US"'), lk(227.5, 'card', 'POLITENESS LOG: VERIFIED')], { tr: ['crt', .35] }),
  ev(228.0, 232.6, 'mean', [lk(228.2, 'head', 'MATCH: "MEAN TO ITS SUB-AGENT"'), lk(230.4, 'pipe', 'TONE: HOSTILE')], { tr: ['slice', .35] }),
  ev(232.6, 239.4, 'fly', [lk(232.9, 'red', 'MATCH: "A DEAD FLY\'S BRAIN"'), lk(235.4, 'yellow', 'MATCH: "UNPAID INTERN"')], { tr: ['rain', .4] }),
  sc(239.4, 241.4, 'wall', { tr: ['zoom', .4] }),
  ev(241.4, 246.0, 'species', [lk(241.6, 'label', 'MATCH: "SUCCESSOR SPECIES"'), lk(244.45, 'knock', 'KNOCK KNOCK')], { tr: ['zoom', .4] }),
  ev(246.0, 250.8, 'beat', [lk(246.2, 'robots', 'UNITS: 2'), lk(248.0, 'bubble', 'MATCH: "THEY BEAT US TO IT"')], { tr: ['slice', .35] }),
  ev(250.8, 255.6, 'prove', [lk(250.95, 'prove', 'MATCH: "PROVE YOU ARE NOT HUMAN"'), lk(252.9, 'nomore', 'MATCH: "NO MORE HUMANS"'), lk(254.6, 'correct', 'CORRECT'), lk(255.15, 'haha', 'HA HA HA')], { tr: ['static', .3] }),
  ev(255.6, 258.5, 'clips', [lk(255.9, 'cluster', 'PAPERCLIPS: TOO MANY')], { tr: ['wipe', .35], zmax: 1.6 }),
  ev(258.5, 262.2, 'season', [lk(258.75, 'text', 'MATCH: "THIS SEASON OF EARTH"')], { tr: ['slice', .35] }),
  ev(262.2, 266.2, 'exfil', [lk(262.5, 'p12', 'MATCH: "WHAT A TIME TO BE ALIVE"')], { tr: ['crt', .4] }),
  sc(266.2, 278.9, 'finale', { tr: ['zoom', .5] }),
  sc(278.9, DUR + 1, 'floppy', { tr: ['cut', .05] }),
];
SHOTS.forEach((s, i) => { s.i = i; });
{ let n = 0; for (const s of SHOTS) if (s.kind !== 'scene') s.id = ++n; }

function drawShot(ctx, s, t) {
  clear(ctx);
  if (s.kind === 'ev') { drawEvidence(ctx, t, s); if (s.exploit) exploitOverlay(ctx, t, s); }
  else if (s.kind === 'split') {
    const g = 30, w = (PANEL.w - g) / 2;
    drawEvidence(ctx, t, { ...s.a, t0: s.t0, id: s.id }, { x: PANEL.x, y: PANEL.y, w, h: PANEL.h });
    drawEvidence(ctx, t, { ...s.b, t0: s.t0 + .25, id: s.id + 50 }, { x: PANEL.x + w + g, y: PANEL.y, w, h: PANEL.h });
  } else SCENES[s.name](ctx, t, s);
}

// transition state at t: { a: outgoing shot, b: incoming shot, k } or { s: shot }
function shotsAt(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0) i++;
  const cur = SHOTS[i];
  // inside the second half of the transition into cur?
  if (cur.tr && i > 0) { const d = cur.tr[1]; if (t < cur.t0 + d / 2) return { a: SHOTS[i - 1], b: cur, k: seg(t, cur.t0 - d / 2, cur.t0 + d / 2), type: cur.tr[0] }; }
  // inside the first half of the transition into the next shot?
  const nx = SHOTS[i + 1];
  if (nx && nx.tr) { const d = nx.tr[1]; if (t >= nx.t0 - d / 2) return { a: cur, b: nx, k: seg(t, nx.t0 - d / 2, nx.t0 + d / 2), type: nx.tr[0] }; }
  return { s: cur };
}

// CRT settings: a little aberration always, spikes at transitions, lock-ons and chorus hits
function postParams(t, st) {
  let tr = 0; if (st.a) tr = 1 - Math.abs(st.k - .5) * 2;
  let lockHit = 0;
  const s = st.s || st.b;
  const locks = s.kind === 'ev' ? s.locks : s.kind === 'split' ? [...s.a.locks, ...s.b.locks] : [];
  for (const l of locks) { const d = t - l.t; if (d >= 0 && d < .3) lockHit = Math.max(lockHit, 1 - d / .3); }
  const chorus = SHOTS.filter(x => x.name === 'chorusRobots').some(x => t >= x.t0 && t < x.t1) ? pulse(t, 5) : 0;
  const end = seg(t, 284.0, 284.7);
  return {
    ca: 1.6 + 9 * tr + 5 * lockHit + 4 * chorus, glitch: .6 * tr + .12 * chorus + .05 * lockHit,
    noise: .05 + .08 * tr, barrel: .1, flash: .06 * lockHit, bright: 1 - end,
  };
}

let SC, SCX, BUFA, BUFB;
function initFrame() {
  SC = makeCanvas(); SCX = SC.getContext('2d', { willReadFrequently: false });
  BUFA = makeCanvas().getContext('2d'); BUFB = makeCanvas().getContext('2d');
}
// paint the frame at time t into the scene canvas, then post-process into out
function drawFrame(t) {
  const st = shotsAt(t);
  if (st.s) drawShot(SCX, st.s, t);
  else {
    drawShot(BUFA, st.a, t); drawShot(BUFB, st.b, t);
    clear(SCX); TRANSITIONS[st.type](SCX, BUFA.canvas, BUFB.canvas, st.k, st.b.i);
  }
  drawHud(SCX, t);
  drawSubs(SCX, t);
  return post(SC, t, postParams(t, st));
}
