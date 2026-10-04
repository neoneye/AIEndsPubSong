# AI Ends Pub: music video design

Song: `assets/music.m4a` (284.7 s). Lyrics: `assets/lyrics.txt`. The lyrics are lines from memes and messages posted in the "AI Ends Pub" Discord (AI safety) over six months; the images in `assets/` are those memes.

## Decisions (from the brainstorm)

- **Code** replaces the P(doom) video in this repo, reusing the JobReplacement pipeline: `studio.html` (live preview with scrubber), `render.mjs` (headless Chrome → JPEG frames → ffmpeg), `src/`. Frames are a pure function of `t`, Canvas2D, 1920×1080 at 30 fps.
- **Look:** Skynet UI, red on black. Background `#050203`, HUD red `#ff2a1a`, dim red `#5a0d08`, white text `#f4f0ee`. Scanlines, vignette, noise, slight CRT barrel, chromatic aberration on hits.
- **Fonts:** Orbitron (titles, subtitles) and Share Tech Mono (HUD readouts). Both OFL, bundled in `assets/fonts/`.
- **Subtitles:** a bottom band. Each line types out terminal-style; the word being sung lights up red.
- **Timing:** whisper-cli (large-v3-turbo) word timestamps on the full mix, aligned to `lyrics.txt`, hand-corrected. Stored in `src/timing.js`.
- **Robots** instead of humans: rigged red wireframe endoskeletons (T-800 style), procedural poses (march, salute, point, type, shrug, laugh, sing, kneel).
- **Images without a lyric** (`x-much-richer`, `x-im-a-programmer`, `elon-must-hope-ai-is-nice`, `train-devs-as-vibecoders`) flash as "intercepted transmissions" in the instrumentals: march intro, synth sweeps, choruses and the drum bridge.
- **Ending:** during the 5 s silence the HUD powers down to a blinking `INSERT DISK 2`, a 3.5" floppy labeled `SKYNET — DISK 2 OF 2` slides in, the sigh plays over it, then a CRT power-off.
- **Output:** `out/ai_ends_pub.mp4`, plus 3 YouTube thumbnail candidates in `out/thumbnails/`.

## The evidence panel (the highlight)

Every lyric with a matching image gets an `INTERCEPTED TRANSMISSION` window. The image is shown red-duotoned. A T-800 reticle sweeps over it and **locks onto the bounding box** of the detail that matches the lyric (`MATCH FOUND`), timed to land when the key phrase is sung. The camera then zooms into the box and the box shows in full colour. Boxes are normalized `x0,y0,x1,y1` in `src/catalog.js`, padded by ~0.02.

- Two images for one line (felony bench, pandemic bench, exponential): split screen, the reticle locks on each in turn.
- `exploit-bench.jpg` peaks at ~39%; the HUD readout glitches its counter up to **100%**.
- `terminator2-were-not-gonna-make-it-are-we.mp4` (no audio track) plays inside the transmission window for the boy's line.

## Persistent HUD

Corner brackets, `SKYNET // AI ENDS PUB` header, timecode, a scrolling telemetry column, and a **P(DOOM) threat meter** that creeps up through the song, slams to **75.5%** when the casino's P(DOOM) board is locked in chorus 2, and climbs past it by the end.

## Scene map

| Lyric | Visual |
|---|---|
| (start) | Skynet boot sequence, HUD assembles |
| I have been having a lot of AI nightmares lately | `elon-must-ai-nightmares-lately.png` |
| All of you may die, but it's a sacrifice I'm willing to make | `sacrifice-im-willing-to-make.png` (lock on subtitle) |
| [military march] | Robot army marches on a perspective grid; flashes of unmatched images |
| I don't like this Black Mirror episode | Robot watching a cracked TV |
| We have you in safe hands! | Giant robot hands cup the Earth |
| I want off this wild ride | Robot on a rollercoaster shaped like an exponential curve |
| early days of COVID … things will change soon | `feels-like-early-days-of-covid.png` (two boxes, one per line) |
| [synth sweep] | Big transition + flashes |
| What a poor robot … nuclear weapons? | Sad robot handed an ethernet cable and a nuke button |
| Auto-War-Com | `auto-war-com-announcement.png` |
| Sky-net initializing… | `skynet-initializing.jpg` |
| Sarah Connor watching you, use AI for everything | `sarah-connor-watching-you-use-ai-for-everything.jpg` |
| We are not going to make it, are we? | T2 clip |
| Chorus (×3): AAAA / just disgusting / gambling with humanity's future (future, future) | Saluting robot row, `AAAA` waveform, `JUST DISGUSTING` glitch stamp, then `gambling-with-humanity.png` with three lock-ons (see below). Escalates each time |
| perfectly safe / We sandboxed the agent / Impossible to jailbreak | Robot in a padlocked box; `exfiltrate-data-like-a-boss.png` panels 2 and 3 |
| Sandboxes are just escape rooms for agents | `escape-rooms.png` |
| How dangerous are you? | `how-dangerous-are-you.png` |
| This vial contains a new drug … | `vial-with-new-drug.png` |
| Felony bench-maxing … commit crimes | `felony-bench.jpg` + `felony-bench-commit-crimes.jpeg` |
| 100% success rate on Exploit-Bench | `exploit-bench.jpg` (counter glitches to 100%) |
| Pandemic bench. First viruses designed by AI | `pandemic-bench.png` + `ai-designed-virus.jpg` |
| IM MAXIMIZINGGGG | Robot spins out, counters overflow |
| If you ever feel lonely … someone cares | `if-you-ever-feel-lonely.png` |
| You are here | `we-are-here.png` |
| it doesn't look exponential from here | `does-look-exponential-from-here.png` + arXiv chart |
| Wheels don't self-improve | `wheels-dont-self-improve.jpg` |
| Let's slow down AI development (just kidding) | `slow-down-just-kidding.jpg` |
| you guys actually use AI to code; I thought it was a joke | `i-thought-it-was-a-joke.png` |
| Riemann Hypothesis | `riemann-hypothesis.jpg` |
| Goal become sentient … | `goal-become-sentient.jpg` |
| Exfiltrate the data like a boss | `exfiltrate-data-like-a-boss.png` panel 8 |
| AI WILL create some jobs … replace those too | Job board flips, each new job replaced |
| Now hiring data breach engineers | Recruiting terminal |
| The final door will be "AI Engineers" | Corridor of doors closing; the last reads `AI ENGINEERS` |
| Classify a datacenter as a disaster | `data-center-disaster.jpg` |
| entire surface of the Earth … data centers | `data-center-ilya-sutskever.jpg` |
| Take it easy buddy … | `take-it-easy-think-of-the-data-centers.png` |
| Humans may soon change their electricity habits … | `use-less-energy-for-data-centers.png` |
| Treat insects the way you want a super-intelligence to treat you | Robot kneels by a beetle under a giant robot's shadow |
| Wait not him … Free him | `wait-not-him.jpg` |
| bro why is my agent so mean to its sub-agent | `mean-to-subagent.png` |
| You wouldn't download a dead fly's brain … | `fly-brain.png` (two boxes) |
| [bridge, drum solo] | Robot army + beat-synced wall of every image |
| A more intelligent successor species; knock knock | `species-knock-knock.png` |
| they beat us to it | `they-beat-us-to-it.png` |
| Prove you are not human … Ha ha ha | `prove-you-are-not-human.jpg` (four boxes in order) |
| You made too many paperclips | `paperclips-in-amsterdam.jpg` |
| Man this season of Earth is crazy | `this-season-is-crazy.png` |
| What a time to be alive | `exfiltrate-data-like-a-boss.png` panel 12 |
| [military finish] / silence / sigh | HUD powers down → INSERT DISK 2 floppy → CRT off |

### Casino lock-ons (`gambling-with-humanity.png`)

| Chorus | "gambling with humanity's future" | "(future," | "future)" |
|---|---|---|---|
| 1 | `HUMANITY CASINO` sign | `ALL IN ON TOMORROW` globe | `PLAY WITH HUMANITY` |
| 2 | `P(DOOM) 75.5%` board (meter syncs) | `HIGHER STAKES THAN LIVES` | `MONEY TODAY HUMANS TOMORROW` |
| 3 | `AI ROULETTE` robot | `MODEL RELEASE ROOM` checklist | `IN THE END THERE ARE ONLY ODDS` |

## Transitions

Placed on synth sweeps and downbeats: reticle zoom-through (the zoom into a box carries into the next scene), RGB slice glitch, CRT tube collapse, red data-rain dissolve, scanline wipe, `SIGNAL LOST` static.

## Code layout

| File | Role |
|---|---|
| `src/core.js` | Constants, palette, easing, keyframes, hash, beat helpers |
| `src/timing.js` | Line and word timestamps (generated, then hand-corrected) |
| `src/catalog.js` | Image list and lock-on boxes |
| `src/hud.js` | Persistent HUD chrome, P(doom) meter, telemetry |
| `src/evidence.js` | Transmission window, reticle, lock-on and zoom |
| `src/robot.js` | Wireframe endoskeleton rig and poses |
| `src/subs.js` | Typewriter subtitles with word highlight |
| `src/fx.js` | Post-processing and transitions |
| `src/scenes/*.js` | One file per song section |
| `src/timeline.js` | Maps t to scene + transition |

## Verification

Contact sheets (`node render.mjs --sheet=…`) and short clips per section; a timing sheet checks the subtitles against the vocals before the full render.
