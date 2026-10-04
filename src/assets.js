// assets.js: loads the meme images and the T2 clip frames, and pre-renders a red duotone of each image
// (white → Skynet red, black → black). Locked-on details are drawn from the full-colour original.
const IMG = {};   // key → { img, red, w, h }
let T2F = [];     // T2 clip frames (Image)

function loadImage(src) {
  return new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => bad(new Error('failed to load ' + src)); im.src = src; });
}
function duotone(im, tint = '#ff3322') {
  const c = makeCanvas(im.naturalWidth, im.naturalHeight), x = c.getContext('2d');
  x.filter = 'grayscale(1) contrast(1.25) brightness(1.05)'; x.drawImage(im, 0, 0); x.filter = 'none';
  x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'lighter'; x.fillStyle = '#140302'; x.fillRect(0, 0, c.width, c.height);
  return c;
}
async function loadAssets() {
  await Promise.all(Object.entries(CATALOG).map(async ([k, e]) => {
    const img = await loadImage('assets/' + e.file);
    IMG[k] = { img, red: duotone(img), w: img.naturalWidth, h: img.naturalHeight };
  }));
  T2F = await Promise.all(Array.from({ length: T2.frames }, (_, i) => loadImage(`${T2.dir}/f${String(i + 1).padStart(4, '0')}.jpg`).catch(() => null)));
  T2F = T2F.map(im => im && { img: im, red: duotone(im), w: im.naturalWidth, h: im.naturalHeight });
}
// a frame of the T2 clip at clip time ct (seconds), as an IMG-like record
function t2Frame(ct) {
  const i = clamp(Math.round(ct * T2.fps), 0, T2.frames - 1);
  for (let k = i; k >= 0; k--) if (T2F[k]) return T2F[k];
  return null;
}
