// catalog.js: the meme images from the AI Ends Pub Discord, and the box (normalized x0,y0,x1,y1 of the image)
// of each detail the reticle locks onto. Boxes were measured by eye; lock-ons pad them a little.
const CATALOG = {
  elon_nightmares: { file: 'elon-must-ai-nightmares-lately.png', src: 'X / @elonmusk', boxes: { text: [.10, .44, .69, .66], name: [.10, .05, .40, .30] } },
  sacrifice: { file: 'sacrifice-im-willing-to-make.png', src: 'MEME / SHREK', boxes: { header: [.06, .065, .95, .215], sub: [.125, .84, .89, .965], lord: [.36, .30, .64, .80] } },
  covid: { file: 'feels-like-early-days-of-covid.png', src: 'X / @lisperati', boxes: { a: [.02, .32, .97, .52], b: [.02, .58, .98, .79] } },
  autowar: { file: 'auto-war-com-announcement.png', src: 'X / DOD BRIEFING', boxes: { quote: [.02, .17, .91, .33], name: [.02, .23, .91, .33] } },
  skynet: { file: 'skynet-initializing.jpg', src: 'IMG / HANDHELD', boxes: { screen: [.29, .355, .72, .69] } },
  sarah: { file: 'sarah-connor-watching-you-use-ai-for-everything.jpg', src: 'MEME / T2', boxes: { caption: [.02, .035, .91, .215], face: [.30, .30, .75, .80] } },
  casino: { file: 'gambling-with-humanity.png', src: 'IMG / HUMANITY CASINO', boxes: {
    sign: [.355, .70, .62, .78], globe: [.385, .40, .53, .60], play: [.20, .23, .28, .32],
    pdoom: [.37, .175, .56, .23], board: [.29, .17, .72, .36], stakes: [.64, .20, .70, .29], money: [.835, .395, .91, .485],
    roulette: [.205, .375, .35, .52], release: [.03, .63, .29, .78], odds: [.205, .87, .285, .955] } },
  exfil: { file: 'exfiltrate-data-like-a-boss.png', src: 'COMIC / 12 PANELS', boxes: {
    p2: [.34, .10, .66, .32], p3: [.665, .10, 1.0, .32], p8: [.34, .55, .66, .77], p8cap: [.37, .55, .61, .60], p12: [.665, .78, 1.0, 1.0] } },
  escape: { file: 'escape-rooms.png', src: 'X / DEV MEME', boxes: { text: [.045, .565, .94, .865] } },
  dangerous: { file: 'how-dangerous-are-you.png', src: 'MAGAZINE COVER', boxes: { text: [.14, .35, .60, .395], chat: [.093, .337, .905, .483] } },
  vial: { file: 'vial-with-new-drug.png', src: 'X / @DOUGLASYAO', boxes: { text: [.02, .19, .95, .30], vial: [.02, .525, .315, .855], lab: [.325, .525, .98, .855] } },
  felony: { file: 'felony-bench.jpg', src: 'FELONYBENCH.COM', boxes: { title: [.019, .10, .364, .165], bar: [.135, .475, .215, .845] } },
  crimes: { file: 'felony-bench-commit-crimes.jpeg', src: 'MEME / HOW IT STARTED', boxes: { text: [.13, .36, .46, .42] } },
  exploit: { file: 'exploit-bench.jpg', src: 'CHART / EXPLOITBENCH', boxes: { title: [.06, .06, .54, .10], curve: [.16, .20, .55, .88] } },
  pandemic: { file: 'pandemic-bench.png', src: 'CHART / PANDEMIC BENCH', boxes: { title: [.26, .03, .76, .11] } },
  virus: { file: 'ai-designed-virus.jpg', src: 'NEWS / BIOSECURITY', boxes: { headline: [.02, .015, .85, .115] } },
  lonely: { file: 'if-you-ever-feel-lonely.png', src: 'MEME / ANIME', boxes: { text: [.49, .125, .97, .40] } },
  here: { file: 'we-are-here.png', src: 'DIAGRAM / DYSTOPIAS', boxes: { here: [.44, .40, .60, .57] } },
  expo_here: { file: 'does-look-exponential-from-here.png', src: 'COMIC / EXPONENTIAL', boxes: { text: [.0, .39, .53, .86] } },
  expo_arxiv: { file: 'does-look-exponential-arxiv-submissions-going-exponential.png', src: 'ARXIV / SUBMISSIONS', boxes: { spike: [.80, .10, .97, .94] } },
  wheels: { file: 'wheels-dont-self-improve.jpg', src: 'COMIC / CAVEMEN', boxes: { wheel: [.31, .345, .53, .75], caption: [.04, .785, .95, .96] } },
  slowdown: { file: 'slow-down-just-kidding.jpg', src: 'COMIC / FOUR LABS', boxes: { a: [.49, .035, .96, .24], all: [.0, .0, 1.0, 1.0] } },
  joke: { file: 'i-thought-it-was-a-joke.png', src: 'MEME / SPONGEBOB', boxes: { top: [.01, .03, .99, .145], bottom: [.235, .865, .78, .97] } },
  riemann: { file: 'riemann-hypothesis.jpg', src: 'X / @JARREDSUMNER', boxes: { text: [.02, .27, .84, .42] } },
  sentient: { file: 'goal-become-sentient.jpg', src: 'CHAT / AGENT INPUT', boxes: { text: [.043, .195, .90, .39] } },
  disaster: { file: 'data-center-disaster.jpg', src: 'SIM / DISASTERS MENU', boxes: { item: [.24, .262, .41, .302], menu: [.235, .0, .41, .365] } },
  ilya: { file: 'data-center-ilya-sutskever.jpg', src: 'QUOTE / I. SUTSKEVER', boxes: { quote: [.13, .745, .92, .955] } },
  easy: { file: 'take-it-easy-think-of-the-data-centers.png', src: 'CARTOON / HEATWAVE', boxes: { bubble: [.04, .13, .92, .275] } },
  energy: { file: 'use-less-energy-for-data-centers.png', src: 'NEWS / EU ENERGY', boxes: { headline: [.035, .14, .875, .305], dc: [.035, .805, .905, .90] } },
  notHim: { file: 'wait-not-him.jpg', src: 'COMIC / FREE HIM', boxes: { wait: [.58, .005, .77, .11], thanked: [.27, .50, .48, .63], card: [.55, .73, .92, .92] } },
  mean: { file: 'mean-to-subagent.png', src: 'X / AGENT LOGS', boxes: { head: [.025, .24, .91, .39], pipe: [.035, .47, .88, .79] } },
  fly: { file: 'fly-brain.png', src: 'IMG / CONNECTOME', boxes: { red: [.04, .05, .96, .365], yellow: [.49, .475, .975, .68] } },
  species: { file: 'species-knock-knock.png', src: 'COMIC / SUCCESSOR', boxes: { label: [.53, .64, .90, .84], knock: [.80, .24, .99, .58] } },
  beat: { file: 'they-beat-us-to-it.png', src: 'COMIC / RUINS', boxes: { bubble: [.405, .54, .625, .68], robots: [.30, .30, .80, .98] } },
  prove: { file: 'prove-you-are-not-human.jpg', src: 'COMIC / CAPTCHA', boxes: {
    prove: [.275, .185, .455, .265], nomore: [.575, .055, .845, .115], correct: [.30, .76, .455, .795], haha: [.54, .53, .975, .655] } },
  clips: { file: 'paperclips-in-amsterdam.jpg', src: 'PHOTO / AMSTERDAM', boxes: { cluster: [.35, .29, .77, .86], all: [.07, .05, 1.0, .87] } },
  season: { file: 'this-season-is-crazy.png', src: 'CARTOON / ALIENS', boxes: { text: [.085, .015, .92, .17] } },
  // no lyric of their own: flashed in the instrumentals
  richer: { file: 'x-much-richer.jpg', src: 'CARTOON / KEYNOTE', boxes: { caption: [.065, .785, .94, .975] } },
  programmer: { file: 'x-im-a-programmer.png', src: 'MEME / ELEVATOR', boxes: { claude: [.60, .62, .82, .71], top: [.2, .27, .75, .34] } },
  nice: { file: 'elon-must-hope-ai-is-nice.jpg', src: 'X / @elonmusk', boxes: { text: [.015, .32, .30, .42], leash: [.03, .65, .60, .74] } },
  vibe: { file: 'train-devs-as-vibecoders.png', src: 'MEME / GENTLEMAN FROG', boxes: { bottom: [.155, .84, .85, .96], top: [.05, .0, .95, .17] } },
};
// the Terminator 2 clip, extracted to JPEG frames by `node render.mjs --prep`
const T2 = { dir: 'out/t2', fps: 30, frames: 198, w: 640, h: 270, boxes: { sub: [.28, .78, .76, .92], face: [.25, .0, .75, .75] } };
