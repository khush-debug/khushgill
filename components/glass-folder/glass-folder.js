/**
 * Glass Folder Cards Controller
 * Tactile 3D folder object with domain-warped liquid canvas art, frosted glass front panel, and interactive fanning files.
 */
(function() {
  'use strict';

  // --- Constants & Presets ---
  const W = 340;
  const H = 272;
  const HEADROOM = 54;
  const FRONT_TOP = 74;
  const FRONT_H = H - FRONT_TOP;

  const ART_PRESETS = {
    aurora: {
      style: "streak",
      colors: ["#f4efe9", "#e9c2b8", "#c2433f", "#2a1e2a", "#22395e", "#6f97c2", "#e5edf4"],
      scale: 0.7,
      warp: 1.4,
      angle: -0.62,
      gloss: 0.18,
      veins: 0,
    },
    ember: {
      style: "marble",
      colors: ["#07090c", "#16252c", "#3d5f68", "#1a1416", "#a3201a", "#ef4a2b", "#ff8a5c"],
      scale: 0.62,
      warp: 3.2,
      angle: -0.5,
      gloss: 0.55,
      veins: 0.6,
    },
    dusk: {
      style: "marble",
      colors: ["#120c18", "#3e2850", "#8f6c9c", "#2b1a24", "#b3502f", "#eab08a", "#fbe7d2"],
      scale: 0.75,
      warp: 3.6,
      angle: 0.8,
      gloss: 0.5,
      veins: 0.5,
    },
    glacier: {
      style: "streak",
      colors: ["#f7f8fa", "#d9e2ea", "#9fb4c7", "#e8edf2", "#bccbd8", "#ffffff"],
      scale: 0.7,
      warp: 1.6,
      angle: 0.35,
      gloss: 0.25,
      veins: 0,
    },
    verdant: {
      style: "marble",
      colors: ["#070b08", "#173024", "#4f7a5a", "#141812", "#a7843a", "#e9cf87", "#fbf3d6"],
      scale: 0.7,
      warp: 3.4,
      angle: 2.1,
      gloss: 0.5,
      veins: 0.5,
    },
  };

  function hexToRgb(hex) {
    let h = hex.trim().replace(/^#/, "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0x808080;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  function makeFbm(seed) {
    const r = rng(seed);
    const perm = new Uint8Array(512);
    const grad = new Float32Array(512);
    const p = [];
    for (let i = 0; i < 256; i++) p.push(i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    for (let i = 0; i < 256; i++) {
      const a = r() * Math.PI * 2;
      grad[i * 2] = Math.cos(a);
      grad[i * 2 + 1] = Math.sin(a);
    }
    const noise = (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const X = xi & 255;
      const Y = yi & 255;
      const h00 = perm[X + perm[Y]] * 2;
      const h10 = perm[X + 1 + perm[Y]] * 2;
      const h01 = perm[X + perm[Y + 1]] * 2;
      const h11 = perm[X + 1 + perm[Y + 1]] * 2;
      const d00 = grad[h00] * xf + grad[h00 + 1] * yf;
      const d10 = grad[h10] * (xf - 1) + grad[h10 + 1] * yf;
      const d01 = grad[h01] * xf + grad[h01 + 1] * (yf - 1);
      const d11 = grad[h11] * (xf - 1) + grad[h11 + 1] * (yf - 1);
      const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
      const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
      return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00));
    };
    return (x, y, octaves) => {
      let sum = 0;
      let amp = 0.5;
      for (let i = 0; i < octaves; i++) {
        sum += amp * noise(x, y);
        const nx = 1.6 * x + 1.2 * y + 7.1;
        y = -1.2 * x + 1.6 * y + 3.3;
        x = nx;
        amp *= 0.5;
      }
      return sum;
    };
  }

  function createArtJob(width, height, recipe, seed) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    const colors = recipe.colors && recipe.colors.length >= 2 ? recipe.colors : ["#111111", "#eeeeee"];
    const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb(c) }));
    const scale = recipe.scale ?? 0.7;
    const warp = recipe.warp ?? 3;
    const gloss = recipe.gloss ?? 0.4;
    const veins = recipe.veins ?? 0;
    const streak = recipe.style === "streak";
    const fbm = makeFbm(seed * 977 + 13);
    const r = rng(seed + 1);
    const ox = r() * 50;
    const oy = r() * 50;
    const angle = (recipe.angle ?? 0) + (r() - 0.5) * 0.5;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const m = Math.min(w, h);

    const gw = Math.ceil(w / 2) + 3;
    const gh = Math.ceil(h / 2) + 3;
    const G = new Float32Array(gw * gh);
    const GQ = new Float32Array(gw * gh);
    const F = new Float32Array(w * h);
    const Q = new Float32Array(w * h);
    const pixels = new Uint8ClampedArray(w * h * 4);
    let row = 0;

    const field = (gy) => {
      for (let gx = 0; gx < gw; gx++) {
        const u = ((gx - 1) * 2 - w / 2) / m;
        const v = ((gy - 1) * 2 - h / 2) / m;
        let px = (u * ca - v * sa) * scale;
        let py = (u * sa + v * ca) * scale;
        if (streak) {
          px *= 0.14;
          py *= 2.2;
        }
        px += ox;
        py += oy;
        const qx = fbm(px, py, 3);
        const qy = fbm(px + 5.2, py + 1.3, 3);
        const rx = fbm(px + warp * qx + 1.7, py + warp * qy + 9.2, 3);
        const ry = fbm(px + warp * qx + 8.3, py + warp * qy + 2.8, 3);
        G[gy * gw + gx] = fbm(px + warp * rx, py + warp * ry, 4);
        GQ[gy * gw + gx] = Math.sqrt(qx * qx + qy * qy);
      }
    };

    const upsample = () => {
      const cr = (a, b, c, d) => (-a + 9 * b + 9 * c - d) / 16;
      const T = new Float32Array(w * gh);
      for (let gy = 0; gy < gh; gy++) {
        const rowOff = gy * gw;
        for (let x = 0; x < w; x++) {
          const c = (x >> 1) + 1;
          T[gy * w + x] = x & 1 ? cr(G[rowOff + c - 1], G[rowOff + c], G[rowOff + c + 1], G[rowOff + c + 2]) : G[rowOff + c];
        }
      }
      for (let y = 0; y < h; y++) {
        const c = (y >> 1) + 1;
        for (let x = 0; x < w; x++) {
          F[y * w + x] =
            y & 1 ? cr(T[(c - 1) * w + x], T[c * w + x], T[(c + 1) * w + x], T[(c + 2) * w + x]) : T[c * w + x];
          const gx = (x >> 1) + 1;
          const q0 = GQ[c * gw + gx];
          const qx = x & 1 ? (q0 + GQ[c * gw + gx + 1]) / 2 : q0;
          const q1 = y & 1 ? (x & 1 ? (GQ[(c + 1) * gw + gx] + GQ[(c + 1) * gw + gx + 1]) / 2 : GQ[(c + 1) * gw + gx]) : qx;
          Q[y * w + x] = (qx + q1) / 2;
        }
      }
    };

    const colorize = () => {
      const sample = [];
      const stride = Math.max(1, Math.floor(F.length / 4096));
      for (let i = 0; i < F.length; i += stride) sample.push(F[i]);
      sample.sort((a, b) => a - b);
      const lo = sample[Math.floor(sample.length * 0.02)] || 0;
      const hi = sample[Math.floor(sample.length * 0.98)] || 1;
      const k = 1 / (hi - lo || 1);
      const lx = -0.55;
      const ly = -0.65;
      const lz = 0.52;
      const slope = k * m * 0.012;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          let t = (F[i] - lo) * k;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          let j = 1;
          while (j < stops.length - 1 && stops[j].t < t) j++;
          const a = stops[j - 1];
          const b = stops[j];
          let f = (t - a.t) / (b.t - a.t || 1);
          f = f < 0 ? 0 : f > 1 ? 1 : f;
          f = f * f * (3 - 2 * f);
          const gx = (F[x < w - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * slope;
          const gy = (F[y < h - 1 ? i + w : i] - F[y > 0 ? i - w : i]) * slope;
          const nd = (-gx * lx - gy * ly + lz) / Math.sqrt(gx * gx + gy * gy + 1);
          const spec = Math.pow(nd > 0 ? nd : 0, 24) * gloss * 255;
          const silk = 1 + 0.035 * Math.sin(t * 150 + Q[i] * 24);
          const vein = veins * Math.max(0, 1 - Math.abs(Q[i] - 0.42) * 14) * 0.6;
          const lit = (0.82 + 0.28 * nd) * silk * (1 - vein);
          pixels[i * 4] = (a.c[0] + (b.c[0] - a.c[0]) * f) * lit + spec;
          pixels[i * 4 + 1] = (a.c[1] + (b.c[1] - a.c[1]) * f) * lit + spec;
          pixels[i * 4 + 2] = (a.c[2] + (b.c[2] - a.c[2]) * f) * lit + spec;
          pixels[i * 4 + 3] = 255;
        }
      }
    };

    const step = (rows) => {
      if (row >= gh) return true;
      const end = Math.min(gh, row + Math.max(1, rows));
      while (row < end) field(row++);
      if (row < gh) return false;
      upsample();
      colorize();
      return true;
    };

    return { width: w, height: h, pixels, step };
  }

  // --- Background Canvas Painter Queue ---
  const artCache = new Map();
  const queue = [];
  let pumping = false;

  function pump() {
    if (pumping) return;
    pumping = true;
    const tick = () => {
      const until = performance.now() + 7;
      while (queue.length && performance.now() < until) {
        const head = queue[0];
        if (head.job.step(4)) {
          queue.shift();
          const c = document.createElement("canvas");
          c.width = head.job.width;
          c.height = head.job.height;
          c.getContext("2d")?.putImageData(new ImageData(head.job.pixels, c.width, c.height), 0, 0);
          head.done(c);
        }
      }
      if (queue.length) requestAnimationFrame(tick);
      else pumping = false;
    };
    requestAnimationFrame(tick);
  }

  function paint(recipe, seed, w, h, priority) {
    const key = JSON.stringify([recipe, seed, w, h]);
    let p = artCache.get(key);
    if (!p) {
      p = new Promise((done) => {
        let at = queue.length;
        while (at > 1 && queue[at - 1].priority > priority) at--;
        queue.splice(at, 0, { job: createArtJob(w, h, recipe, seed), priority, done });
        pump();
      });
      artCache.set(key, p);
    }
    return p;
  }

  // --- Folder Initializer ---
  function initGlassFolders() {
    const folders = document.querySelectorAll('.gf-root');
    if (!folders.length) return;

    folders.forEach((folder) => {
      // 1. Stage Scaling
      const updateSize = () => {
        const parentW = folder.parentElement ? folder.parentElement.clientWidth : 340;
        const targetW = Math.min(folder.dataset.width ? parseFloat(folder.dataset.width) : 480, parentW - 8);
        const effectiveW = Math.max(300, targetW);
        const k = effectiveW / W;

        folder.style.width = effectiveW + 'px';
        folder.style.height = (H + HEADROOM) * k + 'px';

        const stage = folder.querySelector('.gf-stage');
        if (stage) {
          stage.style.transform = `translateY(${HEADROOM * k}px) scale(${k})`;
        }

        // Paint background canvas
        const canvas = folder.querySelector('canvas.gf-art');
        if (canvas && !canvas.dataset.ready) {
          const artKey = folder.dataset.art || 'aurora';
          const seed = parseInt(folder.dataset.seed || '3', 10);
          const recipe = ART_PRESETS[artKey] || ART_PRESETS.aurora;
          const density = Math.min(1.5, window.devicePixelRatio || 1) * k;
          const pw = Math.round((W + 24) * density);
          const ph = Math.round((H + 24) * density);

          paint(recipe, seed, pw, ph, 0).then((src) => {
            canvas.width = src.width;
            canvas.height = src.height;
            canvas.getContext('2d')?.drawImage(src, 0, 0);
            canvas.dataset.ready = 'true';
          });
        }

        // Paint file artwork canvases if present
        folder.querySelectorAll('canvas.gf-sheet-art').forEach((sheetCanvas) => {
          if (!sheetCanvas.dataset.ready) {
            const artKey = sheetCanvas.dataset.art || 'dusk';
            const seed = parseInt(sheetCanvas.dataset.seed || '7', 10);
            const recipe = ART_PRESETS[artKey] || ART_PRESETS.dusk;
            const density = Math.min(1.25, window.devicePixelRatio || 1) * k;
            const pw = Math.round(272 * density);
            const ph = Math.round(184 * density);

            paint(recipe, seed, pw, ph, 1).then((src) => {
              sheetCanvas.width = src.width;
              sheetCanvas.height = src.height;
              sheetCanvas.getContext('2d')?.drawImage(src, 0, 0);
              sheetCanvas.dataset.ready = 'true';
            });
          }
        });
      };

      updateSize();
      window.addEventListener('resize', updateSize, { passive: true });

      // 2. Entrance Observer
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = parseInt(folder.dataset.appearDelay || '0', 10);
            setTimeout(() => folder.setAttribute('data-entered', 'true'), delay);
            io.unobserve(folder);
          }
        });
      }, { threshold: 0.15 });
      io.observe(folder);

      // 3. Pointer Tracking
      let raf = 0;
      let px = 0;
      let py = 0;
      const write = () => {
        raf = 0;
        folder.style.setProperty('--gf-px', px.toFixed(3));
        folder.style.setProperty('--gf-py', py.toFixed(3));
      };

      folder.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = folder.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width) * 2 - 1;
        py = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (!raf) raf = requestAnimationFrame(write);
      });

      folder.addEventListener('pointerleave', () => {
        px = 0;
        py = 0;
        if (!raf) raf = requestAnimationFrame(write);
      });

      // 4. Hit Button (Open / Close)
      const hitBtn = folder.querySelector('.gf-hit');
      const filesContainer = folder.querySelector('.gf-files');
      const keyBtn = folder.querySelector('.gf-key');
      const menu = folder.querySelector('.gf-menu');

      const setOpen = (open) => {
        if (open) {
          folder.setAttribute('data-open', 'true');
          if (hitBtn) hitBtn.setAttribute('aria-expanded', 'true');
          if (filesContainer) filesContainer.removeAttribute('inert');
        } else {
          folder.removeAttribute('data-open');
          if (hitBtn) hitBtn.setAttribute('aria-expanded', 'false');
          if (filesContainer) filesContainer.setAttribute('inert', '');
        }
      };

      if (hitBtn) {
        hitBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = folder.hasAttribute('data-open');
          setOpen(!isOpen);
          if (menu) menu.removeAttribute('data-open');
        });
      }

      // 5. Options Menu
      if (keyBtn && menu) {
        keyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isMenuOpen = menu.hasAttribute('data-open');
          if (isMenuOpen) {
            menu.removeAttribute('data-open');
            keyBtn.setAttribute('aria-expanded', 'false');
          } else {
            menu.setAttribute('data-open', 'true');
            keyBtn.setAttribute('aria-expanded', 'true');
            menu.querySelector('.gf-menu-item')?.focus();
          }
        });

        menu.querySelectorAll('.gf-menu-item').forEach((item) => {
          item.addEventListener('click', () => {
            menu.removeAttribute('data-open');
            keyBtn.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // 6. Outside click & Escape
      document.addEventListener('pointerdown', (e) => {
        if (!folder.contains(e.target)) {
          if (menu) menu.removeAttribute('data-open');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (menu && menu.hasAttribute('data-open')) {
            menu.removeAttribute('data-open');
            keyBtn?.focus();
          } else if (folder.hasAttribute('data-open')) {
            setOpen(false);
            hitBtn?.focus();
          }
        }
      });
    });
  }


  // --- 3D Glass Folder Stacking Physics Controller ---
  class Folder3DStack {
    constructor() {
      this.items = Array.from(document.querySelectorAll('.work-timeline-item'));
      this.timelineContainer = document.getElementById('work-timeline');
      this.navBtns = Array.from(document.querySelectorAll('.timeline-nav-btn'));

      this.curvyWrap = document.getElementById('curvy-arrow-wrap');
      this.curvySvg = document.getElementById('curvy-arrow-svg');
      this.curvyGuide = document.getElementById('curvy-arrow-guide');
      this.curvyPath = document.getElementById('curvy-arrow-path');
      this.curvyHead = document.getElementById('curvy-arrow-head');
      this.curvyPathLen = 0;

      if (!this.items.length || !this.timelineContainer) return;

      this.itemTops = [];
      this.pinScrolls = [];
      this.isMeasuring = false;
      this.ticking = false;
      this.init();
    }

    init() {
      const isMobile = window.innerWidth < 768;
      this.items.forEach((item, idx) => {
        item.style.zIndex = idx + 10;
        item.style.willChange = 'transform';
        item.style.transformOrigin = 'center top';
        if (idx < this.items.length - 1) {
          item.style.marginBottom = isMobile ? '45px' : '75px';
        } else {
          item.style.marginBottom = '30px';
        }
      });

      this.measure();
      this.bindEvents();
      this.update(window.scrollY);
    }

    measure() {
      if (!this.items.length) return;
      this.isMeasuring = true;
      this.items.forEach(item => { item.style.transform = ''; });
      const currentScroll = window.scrollY;
      this.itemTops = this.items.map(item => item.getBoundingClientRect().top + currentScroll);

      const isMobile = window.innerWidth < 768;
      const pinTop = isMobile ? 80 : 110;
      const tabOffset = isMobile ? 18 : 28;

      this.pinScrolls = this.itemTops.map((top, i) => top - pinTop - (tabOffset * i));

      // Build organic dynamic curvy arrow path extending all the way down till the folder stops
      if (this.curvySvg && this.curvyPath && this.timelineContainer) {
        const containerH = this.timelineContainer.offsetHeight;
        this.curvySvg.setAttribute('viewBox', `0 0 44 ${containerH}`);

        const relTops = this.items.map(it => it.offsetTop);
        const lastItem = this.items[this.items.length - 1];
        const lastItemH = lastItem ? lastItem.offsetHeight : 542;

        let d = `M 18 ${Math.max(16, relTops[0] + 30)}`;
        for (let i = 0; i < relTops.length - 1; i++) {
          const yA = relTops[i] + 30;
          const yB = relTops[i + 1] + 30;
          const midY = (yA + yB) / 2;
          const wave = (i % 2 === 0) ? 36 : 2;
          d += ` C ${wave} ${yA + (midY - yA)*0.5}, ${wave} ${midY + (yB - midY)*0.5}, 18 ${yB}`;
        }

        // Extend the line down along the entire height of the last folder to where it stops
        const lastTop = relTops[relTops.length - 1] + 30;
        const lastBottom = relTops[relTops.length - 1] + lastItemH - 24;
        const lastMid = (lastTop + lastBottom) / 2;

        d += ` C 36 ${lastTop + (lastMid - lastTop)*0.5}, 2 ${lastMid + (lastBottom - lastMid)*0.5}, 18 ${lastBottom}`;

        if (this.curvyGuide) this.curvyGuide.setAttribute('d', d);
        this.curvyPath.setAttribute('d', d);

        try {
          this.curvyPathLen = this.curvyPath.getTotalLength();
          this.curvyPath.style.strokeDasharray = `${this.curvyPathLen}`;
          this.curvyPath.style.strokeDashoffset = `${this.curvyPathLen}`;
        } catch (e) {
          this.curvyPathLen = 0;
        }
      }

      this.isMeasuring = false;
      this.update(currentScroll);
    }

    update(scrollY) {
      if (this.isMeasuring || !this.itemTops.length) return;
      const m = typeof scrollY === 'number' ? scrollY : window.scrollY;
      const N = this.items.length;
      const L = window.innerHeight;
      const isMobile = window.innerWidth < 768;

      const pinTop = isMobile ? 80 : 110;
      const tabOffset = isMobile ? 18 : 28;

      const stackEndScroll = this.pinScrolls[N - 1];
      const exitScroll = stackEndScroll + (L * 0.70);

      // 1. Determine active index in proper 01 -> 02 -> 03 -> 04 sequence
      let activeIdx = 0;
      for (let i = 0; i < N; i++) {
        if (m >= this.pinScrolls[i] - 40) {
          activeIdx = i;
        }
      }

      // 2. Animate the Curvy Arrow along with the scroll till the point the folder stops
      if (this.curvyPath && this.curvyHead && this.curvyPathLen > 0) {
        const startScroll = this.pinScrolls[0] - 30;
        const endScroll = Math.min(exitScroll - 40, this.pinScrolls[N - 1] + (L * 0.35));
        const arrowProg = Math.min(1, Math.max(0, (m - startScroll) / Math.max(1, endScroll - startScroll)));

        this.curvyPath.style.strokeDashoffset = `${(this.curvyPathLen * (1 - arrowProg)).toFixed(1)}`;

        if (arrowProg > 0.005) {
          this.curvyHead.style.opacity = '1';
          const dist = this.curvyPathLen * arrowProg;
          const pt = this.curvyPath.getPointAtLength(dist);
          const ptAhead = this.curvyPath.getPointAtLength(Math.min(this.curvyPathLen, dist + 2));
          const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI) + 90;
          this.curvyHead.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
        } else {
          this.curvyHead.style.opacity = '0';
        }
      }

      // 3. Calculate Pinned Translations and 3D Perspective Scaling
      for (let i = 0; i < N; i++) {
        const item = this.items[i];
        const initialTop = this.itemTops[i];
        const targetPinScroll = this.pinScrolls[i];

        // Pinned Translation (Y-axis)
        let translateY = 0;
        if (m >= targetPinScroll && m <= exitScroll) {
          translateY = m - initialTop + pinTop + (tabOffset * i);
        } else if (m > exitScroll) {
          translateY = exitScroll - initialTop + pinTop + (tabOffset * i);
        }

        // 3D Perspective Scale & Depth Dimming
        let scale = 1.0;
        let brightness = 1.0;

        if (i < N - 1) {
          const nextPin = this.pinScrolls[i + 1];
          if (m >= targetPinScroll && m < nextPin) {
            // As next card scrolls up towards its pin, this card gently compresses
            const progress = (m - targetPinScroll) / Math.max(1, nextPin - targetPinScroll);
            scale = 1.0 - (progress * 0.06);
            brightness = 1.0 - (progress * 0.04);
          } else if (m >= nextPin) {
            // Subsequent cards are stacking above; continue gradual compression
            const remainingProgress = Math.min(1, (m - nextPin) / Math.max(1, stackEndScroll - nextPin));
            const layersAbove = N - 1 - i;
            scale = 0.94 - (remainingProgress * (0.05 * layersAbove));
            brightness = 0.96 - (remainingProgress * (0.03 * layersAbove));
          }
        }

        scale = Math.max(0.78, Math.min(1.0, scale));
        brightness = Math.max(0.85, Math.min(1.0, brightness));

        item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

        const rootEl = item.querySelector('.gf-root');
        if (rootEl) {
          if (scale < 0.98) {
            rootEl.style.filter = `brightness(${brightness.toFixed(3)})`;
          } else {
            rootEl.style.filter = '';
          }
        }

        if (i === activeIdx) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      }

      // 4. Highlight left sidebar nav button in proper sequence
      this.navBtns.forEach((btn, idx) => {
        if (idx === activeIdx) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }

    bindEvents() {
      const handleScroll = (customY) => {
        if (!this.ticking) {
          this.ticking = true;
          requestAnimationFrame(() => {
            const sy = typeof customY === 'number' ? customY : window.scrollY;
            this.update(sy);
            this.ticking = false;
          });
        }
      };

      window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });
      window.addEventListener('resize', () => this.measure(), { passive: true });
      window.addEventListener('load', () => this.measure());

      if (document.fonts) {
        document.fonts.ready.then(() => this.measure());
      }

      // Resilient Lenis integration
      const hookLenis = () => {
        if (window.lenis && typeof window.lenis.on === 'function') {
          window.lenis.on('scroll', (e) => {
            const sy = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
            handleScroll(sy);
          });
          return true;
        }
        return false;
      };

      if (!hookLenis()) {
        const checkLenis = setInterval(() => {
          if (hookLenis()) clearInterval(checkLenis);
        }, 150);
        setTimeout(() => clearInterval(checkLenis), 3000);
      }

      // Fast-Nav click handlers (smooth scroll to selected project stack state)
      this.navBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetIdx = parseInt(btn.getAttribute('data-nav-target'), 10);
          if (!isNaN(targetIdx) && this.pinScrolls[targetIdx] !== undefined) {
            const targetScroll = this.pinScrolls[targetIdx] + 10;
            if (window.lenis && typeof window.lenis.scrollTo === 'function') {
              window.lenis.scrollTo(targetScroll, { duration: 1.2 });
            } else {
              window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
          }
        });
      });
    }
  }

  window.Folder3DStack = Folder3DStack;

  window.initGlassFolders = initGlassFolders;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGlassFolders();
      window.folder3DStackInstance = new Folder3DStack();
    });
  } else {
    initGlassFolders();
    window.folder3DStackInstance = new Folder3DStack();
  }
})();
