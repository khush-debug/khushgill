/**
 * Kinetic Wheel Component
 * 
 * Manages the sweeping circular arc kinetic typography that orbits through
 * the viewport during the 3D scroll stack's void perspective flight.
 * 
 * Strict lifecycle: strictly hidden before 3D fly-away (m < stackComplete or I <= 0)
 * and after completion (I >= 1).
 */
(function() {
  'use strict';

  class KineticWheel {
    constructor() {
      this.wheelEl = null;
      this.initialized = false;
      this.init();
    }

    init() {
      this.wheelEl = document.getElementById('kinetic-wheel');
      if (!this.wheelEl) return;

      // Force initial hidden state so it never displays over Hero or About
      this.hide();

      // Listen to scroll stack progress events
      window.addEventListener('scroll-stack:progress', (e) => {
        this.update(e.detail);
      });

      // If ScrollStack instance already exists, subscribe directly
      if (window.scrollStackInstance && typeof window.scrollStackInstance.onProgress === 'function') {
        window.scrollStackInstance.onProgress((data) => this.update(data));
      }

      this.initialized = true;
    }

    hide() {
      if (!this.wheelEl) return;
      this.wheelEl.style.display = 'none';
      this.wheelEl.style.visibility = 'hidden';
      this.wheelEl.style.opacity = '0';
    }

    update(data) {
      if (!this.wheelEl || !data) return;
      const { progress: I, scrollY: m, stackCompleteScroll: ne, isMobile } = data;

      // Strict lifecycle guard:
      // Never visible before cards complete stacking (m < ne - 20) or after void flight completes (I >= 1)
      if (I <= 0 || I >= 1 || (typeof ne === 'number' && m < (ne - 20))) {
        this.hide();
        if (!isMobile) {
          this.wheelEl.style.transform = I <= 0 ? 'rotate(180deg)' : 'rotate(0deg)';
        }
        return;
      }

      // 0 < I < 1: Active 3D void perspective flight!
      this.wheelEl.style.display = 'block';
      this.wheelEl.style.visibility = 'visible';

      if (isMobile) {
        let alpha = 0;
        if (I <= 0.25) alpha = 0.5 * (I / 0.25);
        else if (I <= 0.5) alpha = 0.5 + 0.5 * ((I - 0.25) / 0.25);
        else if (I <= 0.8) alpha = 1;
        else alpha = Math.max(0, 1 - (I - 0.8) / 0.2);

        this.wheelEl.style.opacity = alpha.toFixed(3);
        this.wheelEl.style.transform = 'translate3d(0, 0, 0)';
      } else {
        // Desktop smooth entrance fade (0 to 0.15) and exit fade (0.85 to 1.0)
        let alpha = 1;
        if (I < 0.15) {
          alpha = I / 0.15;
        } else if (I > 0.85) {
          alpha = Math.max(0, (1 - I) / 0.15);
        }
        this.wheelEl.style.opacity = alpha.toFixed(3);

        // Rotates 180deg (horizon) -> 0deg as cards vanish into the void
        const rot = 180 * (1 - I);
        this.wheelEl.style.transformOrigin = '50% 100%';
        this.wheelEl.style.transform = `rotate(${rot.toFixed(2)}deg)`;
      }
    }
  }

  // Expose global controller
  window.KineticWheel = KineticWheel;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.kineticWheelInstance = new KineticWheel();
    });
  } else {
    window.kineticWheelInstance = new KineticWheel();
  }
})();
