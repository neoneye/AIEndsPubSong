// fx.js: transitions between shots (Canvas2D) and the CRT post-process (WebGL): barrel curve, chromatic
// aberration, glitch row-tearing, scanlines, noise, vignette and a soft red bloom.

// ---------- transitions: combine shot A (outgoing) and B (incoming) at progress k (0..1) into ctx ----------
const TRANSITIONS = {
  cut(ctx, A, B, k) { ctx.drawImage(k < .5 ? A : B, 0, 0); },
  // horizontal slices tear sideways, each switching from A to B at its own moment
  slice(ctx, A, B, k, seed = 1) {
    const n = 18, sh = H / n;
    for (let i = 0; i < n; i++) {
      const sw = hash2(i, seed) * .6 + .2, src = k < sw ? A : B, d = 1 - Math.abs(k - sw) * 3.5;
      const off = d > 0 ? (hash2(i, seed + 9) - .5) * 600 * d : 0;
      ctx.drawImage(src, 0, i * sh, W, sh, off, i * sh, W, sh);
      if (d > 0) { ctx.fillStyle = rgba(COL.red, .5 * d * hash2(i, seed + 3)); ctx.fillRect(off, i * sh, W, sh); }
    }
  },
  // A zooms in through its centre and burns out; B zooms down into place
  zoom(ctx, A, B, k) {
    if (k < .5) { const s = 1 + easeIn(k * 2) * 3; ctx.globalAlpha = 1 - easeIn(k * 2) * .6; ctx.drawImage(A, W / 2 - W * s / 2, H / 2 - H * s / 2, W * s, H * s); }
    else { const s = 1 + (1 - easeOut((k - .5) * 2)) * .6; ctx.globalAlpha = easeOut((k - .5) * 2); ctx.drawImage(B, W / 2 - W * s / 2, H / 2 - H * s / 2, W * s, H * s); }
    ctx.globalAlpha = 1;
    const f = 1 - Math.abs(k - .5) * 4; if (f > 0) { ctx.fillStyle = rgba('#ffffff', f * .8); ctx.fillRect(0, 0, W, H); }
  },
  // CRT tube collapse: A squashes to a line then a dot, B opens back out
  crt(ctx, A, B, k) {
    const src = k < .5 ? A : B, q = k < .5 ? k * 2 : 1 - (k - .5) * 2;  // 0 = full, 1 = collapsed
    const sy = Math.max(.004, 1 - easeIn(clamp(q * 1.6))), sx = Math.max(.002, 1 - easeIn(clamp((q - .55) * 2.2)));
    ctx.drawImage(src, W / 2 - W * sx / 2, H / 2 - H * sy / 2, W * sx, H * sy);
    if (q > .4) { ctx.fillStyle = rgba('#ffffff', (q - .4) * 1.6); ctx.fillRect(W / 2 - W * sx / 2, H / 2 - 3, W * sx, 6); }
  },
  // red data rain: columns fall and wipe A into B
  rain(ctx, A, B, k, seed = 2) {
    ctx.drawImage(A, 0, 0);
    const cw = 40, n = W / cw; font(ctx, 30, FONT_M);
    for (let i = 0; i < n; i++) {
      const d = hash2(i, seed) * .45, y = clamp((k - d) / .5) * (H + 300) - 150;
      if (y > -150) ctx.drawImage(B, i * cw, 0, cw, Math.max(0, y), i * cw, 0, cw, Math.max(0, y));
      for (let j = 0; j < 8; j++) {
        const gy = y - j * 34; if (gy < 0 || gy > H) continue;
        ctx.fillStyle = j ? rgba(COL.red, 1 - j / 8) : '#fff';
        ctx.fillText(String.fromCharCode(0x30A0 + ((hash2(i * 9 + j, frameN(k * 100)) * 96) | 0)), i * cw + 6, gy);
      }
    }
  },
  // a bright scan bar sweeps down, revealing B
  wipe(ctx, A, B, k) {
    const y = easeInOut(k) * (H + 80) - 40;
    ctx.drawImage(A, 0, 0); ctx.drawImage(B, 0, 0, W, Math.max(1, y), 0, 0, W, Math.max(1, y));
    ctx.fillStyle = rgba(COL.red, .35); ctx.fillRect(0, y - 40, W, 40); ctx.fillStyle = '#fff'; ctx.fillRect(0, y - 3, W, 6);
  },
  // SIGNAL LOST static burst
  static(ctx, A, B, k) {
    const f = 1 - Math.abs(k - .5) * 2;
    ctx.drawImage(k < .5 ? A : B, 0, 0);
    const n = frameN(k * 37);
    for (let i = 0; i < 260 * f; i++) { const r = hash2(i, n); ctx.fillStyle = r < .5 ? rgba('#ffffff', .7) : rgba(COL.red, .8); ctx.fillRect(hash2(i + 1, n) * W, hash2(i + 2, n) * H, 20 + r * 260, 2 + r * 10); }
    if (f > .4) {
      ctx.fillStyle = rgba('#000', .7 * f); ctx.fillRect(W / 2 - 360, H / 2 - 70, 720, 120);
      text(ctx, 'SIGNAL LOST', W / 2, H / 2 + 20, { px: 64, fam: FONT_T, weight: 900, col: COL.red, align: 'center', spacing: 8, alpha: f });
    }
  },
};

// ---------- CRT post-process ----------
let GL = null;
function initPost(outCanvas) {
  const gl = outCanvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) { console.warn('no WebGL: post-process disabled'); return; }
  const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0, 1); }`;
  const fs = `precision highp float; varying vec2 uv; uniform sampler2D tex; uniform vec2 res;
    uniform float time, ca, glitch, noise, barrel, flash, bright, seed;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    vec3 samp(vec2 u){ return texture2D(tex, u).rgb; }
    void main(){
      vec2 c = uv - .5; vec2 u = .5 + c * (1. + barrel * dot(c, c));
      // glitch: some horizontal blocks shift sideways
      float row = floor(u.y * 54.); float g = h(vec2(row, seed));
      if (g < glitch * .55) u.x += (h(vec2(row, seed + 1.)) - .5) * glitch * .12;
      if (u.x < 0. || u.x > 1. || u.y < 0. || u.y > 1.) { gl_FragColor = vec4(0, 0, 0, 1); return; }
      vec2 d = (u - .5) * ca / res.x * 2.;
      vec3 col = vec3(samp(u + d).r, samp(u).g, samp(u - d).b);
      // soft bloom from a few taps
      vec3 b = vec3(0.); float r = 3.5 / res.y;
      for (int i = 0; i < 8; i++) { float a = float(i) * .785; b += samp(u + vec2(cos(a), sin(a)) * r * 2.5) + samp(u + vec2(cos(a + .39), sin(a + .39)) * r * 6.); }
      b /= 16.; col += max(b - .25, 0.) * vec3(.55, .25, .2);
      // scanlines and noise
      float sl = .86 + .14 * sin(u.y * res.y * 3.14159 / 1.5);
      col *= sl;
      col += (h(u * res + time * 61.) - .5) * noise;
      // vignette
      col *= 1. - .55 * pow(length(c) * 1.25, 2.4);
      col = col * bright + flash;
      gl_FragColor = vec4(col, 1.);
    }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const U = {}; for (const n of ['res', 'time', 'ca', 'glitch', 'noise', 'barrel', 'flash', 'bright', 'seed']) U[n] = gl.getUniformLocation(pr, n);
  GL = { gl, U };
}
function post(src, t, p) {
  if (!GL) return false;
  const { gl, U } = GL;
  gl.viewport(0, 0, W, H);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.uniform2f(U.res, W, H); gl.uniform1f(U.time, t); gl.uniform1f(U.seed, frameN(t) % 97);
  gl.uniform1f(U.ca, p.ca); gl.uniform1f(U.glitch, p.glitch); gl.uniform1f(U.noise, p.noise);
  gl.uniform1f(U.barrel, p.barrel); gl.uniform1f(U.flash, p.flash); gl.uniform1f(U.bright, p.bright);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return true;
}
