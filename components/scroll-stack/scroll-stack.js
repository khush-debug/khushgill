/**
 * 3D Scroll Stacking Component
 * 
 * Manages physical card stacking with top-tab pinning, accelerated scaling,
 * and 3D void perspective fly-away physics.
 */
(function() {
  'use strict';

  // Configurable physics parameters
  const DEFAULT_CONFIG = {
    itemDistance: 100,        // Natural flow margin between cards before stack
    itemScale: 0.015,         // Scale increment per card layer in stack
    itemStackDistance: 18,    // Vertical tab offset visible per stacked card
    stackPosition: 0.08,      // Viewport pinning target ratio
    scaleEndPosition: 0.05,   // Scaling compression reference ratio
    baseScale: 0.92,          // Scale factor of bottom-most pinned card
    perspective: 1500,        // 3D CSS perspective in pixels
    flyAwayDistance: 3000     // 3D Z-translation depth in pixels
  };

  class ScrollStack {
    constructor(config = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.scrollCards = [];
      this.perspectiveContainer = null;
      this.voidContainer = null;
      this.stackEnd = null;

      this.cardTops = [];
      this.endTop = 0;
      this.perspectiveTop = 0;
      this.isCalculating = false;
      this.scrollTicking = false;
      this.initialized = false;

      this.onProgressCallbacks = [];
      this.init();
    }

    init() {
      this.scrollCards = Array.from(document.querySelectorAll('.scroll-stack-card'));
      this.perspectiveContainer = document.getElementById('scroll-stack-inner');
      this.voidContainer = document.getElementById('void-container');
      this.stackEnd = document.getElementById('scroll-stack-end');

      if (!this.scrollCards.length || !this.voidContainer) {
        return;
      }

      // Initial card styles
      this.scrollCards.forEach((c, idx) => {
        if (idx < this.scrollCards.length - 1) {
          c.style.marginBottom = `${this.config.itemDistance}px`;
        } else {
          c.style.marginBottom = '0px';
        }
        c.style.willChange = 'transform';
        c.style.transformOrigin = 'top center';
      });

      this.measure();
      this.bindEvents();
      this.initialized = true;

      // Initial layout update
      this.update(window.scrollY);
    }

    measure() {
      if (!this.scrollCards.length) return;
      this.isCalculating = true;

      // Temporarily clear inline transforms for accurate DOM measurement
      this.scrollCards.forEach(c => { c.style.transform = ''; });
      if (this.voidContainer) {
        this.voidContainer.style.transform = '';
        this.voidContainer.style.transformOrigin = '';
        this.voidContainer.style.opacity = '1';
        this.voidContainer.style.visibility = 'visible';
      }

      const currentScroll = window.scrollY;
      this.cardTops = this.scrollCards.map(c => c.getBoundingClientRect().top + currentScroll);
      this.endTop = this.stackEnd ? (this.stackEnd.getBoundingClientRect().top + currentScroll) : 0;
      this.perspectiveTop = this.perspectiveContainer ? (this.perspectiveContainer.getBoundingClientRect().top + currentScroll) : 0;
      this.isCalculating = false;

      // Restore active transforms immediately
      this.update(currentScroll);
    }

    update(scrollY) {
      if (this.isCalculating || !this.cardTops.length) return;
      const m = typeof scrollY === 'number' ? scrollY : window.scrollY;
      const E = this.scrollCards;
      const P = this.cardTops;
      const C = this.endTop;
      const k = this.perspectiveTop;
      if (!E.length || !P.length) return;

      const L = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const j = E[0].offsetHeight;
      const $ = (L - j) / 2;
      const U = $ - (this.config.stackPosition - this.config.scaleEndPosition) * L;
      const ne = P[E.length - 1] - U;
      const K = L * 1.2;

      let I = 0;
      if (m > ne) {
        I = (m - ne) / K;
        I = Math.min(Math.max(I, 0), 1);
      }

      // 1. Physical card pinning & scaling
      for (let X = 0; X < E.length; X++) {
        const Q = E[X];
        const ae = P[X];
        const me = ae - $ - (this.config.itemStackDistance * X);
        const Z = ae - U;
        const xe = me;
        const ee = Math.max(C - L * 0.5, ne + K);

        let Fe = 0;
        if (m >= Z) {
          Fe = 1;
        } else if (m > me) {
          Fe = (m - me) / (Z - me);
        }
        Fe = Math.min(Math.max(Fe, 0), 1);

        const Ze = this.config.baseScale + (X * this.config.itemScale);
        const Ge = Number((1 - Fe * (1 - Ze)).toFixed(4));

        let Je = 0;
        if (m >= xe && m <= ee) {
          Je = m - ae + $ + (this.config.itemStackDistance * X);
        } else if (m > ee) {
          Je = ee - ae + $ + (this.config.itemStackDistance * X);
        }

        Q.style.transform = `translate3d(0, ${Je.toFixed(2)}px, 0) scale(${Ge})`;
      }

      // 2. 3D Perspective on Void Container
      const A = this.voidContainer;
      const M = this.perspectiveContainer;
      if (A && M) {
        const X = m + L / 2 - k;
        M.style.perspectiveOrigin = `50% ${X.toFixed(1)}px`;
        M.style.perspective = `${this.config.perspective}px`;

        if (I > 0) {
          if (isMobile) {
            const Q = Math.min(I / 0.35, 1);
            const ae = 1 - Q;
            A.style.transformOrigin = `50% ${X.toFixed(1)}px`;
            A.style.transform = 'translate3d(0, 0, 0) scale(1)';
            A.style.opacity = Math.max(0, ae).toFixed(3);
            if (I >= 1) {
              A.style.visibility = 'hidden';
              A.style.opacity = '0';
              A.style.pointerEvents = 'none';
            } else {
              A.style.visibility = 'visible';
              A.style.pointerEvents = 'auto';
            }
          } else {
            const Q = Math.pow(I, 1.5);
            const ae = -Q * this.config.flyAwayDistance;
            const me = 1 - Q;
            const Z = 1 - Math.pow(I, 2.5);
            A.style.transformOrigin = `50% ${X.toFixed(1)}px`;
            A.style.transform = `translate3d(0, 0, ${ae.toFixed(2)}px) scale(${Math.max(0, me).toFixed(4)})`;
            A.style.opacity = Math.max(0, Z).toFixed(3);
            if (I >= 1) {
              A.style.visibility = 'hidden';
              A.style.opacity = '0';
              A.style.pointerEvents = 'none';
            } else {
              A.style.visibility = 'visible';
              A.style.pointerEvents = 'auto';
            }
          }
        } else {
          A.style.transformOrigin = '';
          A.style.transform = 'translate3d(0, 0, 0) scale(1)';
          A.style.opacity = '1';
          A.style.visibility = 'visible';
          A.style.pointerEvents = 'auto';
        }
      }

      // Notify external subscribers (e.g. Kinetic Wheel) of void flight progress
      const progressPayload = {
        progress: I,
        scrollY: m,
        stackCompleteScroll: ne,
        flightTravel: K,
        isMobile: isMobile,
        isFlightActive: I > 0 && I < 1
      };

      for (let i = 0; i < this.onProgressCallbacks.length; i++) {
        try {
          this.onProgressCallbacks[i](progressPayload);
        } catch (err) {
          console.warn('ScrollStack progress callback error:', err);
        }
      }

      // Also dispatch a custom event on window
      window.dispatchEvent(new CustomEvent('scroll-stack:progress', { detail: progressPayload }));
    }

    onProgress(cb) {
      if (typeof cb === 'function') {
        this.onProgressCallbacks.push(cb);
      }
    }

    bindEvents() {
      const handleScroll = (customY) => {
        if (!this.scrollTicking) {
          requestAnimationFrame(() => {
            const sy = typeof customY === 'number' ? customY : window.scrollY;
            this.update(sy);
            this.scrollTicking = false;
          });
          this.scrollTicking = true;
        }
      };

      // Native scroll listener
      window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });

      // Lenis scroll integration if present
      if (window.lenis && typeof window.lenis.on === 'function') {
        window.lenis.on('scroll', (e) => {
          const sy = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
          handleScroll(sy);
        });
      }

      // Resize & load re-measurements
      window.addEventListener('resize', () => this.measure(), { passive: true });
      window.addEventListener('load', () => this.measure());

      if (document.fonts) {
        document.fonts.ready.then(() => this.measure());
      }

      const resizeObserver = new ResizeObserver(() => this.measure());
      this.scrollCards.forEach(c => resizeObserver.observe(c));
      if (this.perspectiveContainer) resizeObserver.observe(this.perspectiveContainer);
    }
  }

  // Expose global controller
  window.ScrollStack = ScrollStack;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scrollStackInstance = new ScrollStack();
    });
  } else {
    window.scrollStackInstance = new ScrollStack();
  }
})();
