/**
 * Work Timeline Component
 * Smooth interactive timeline with glowing progress line and sticky narrative sidebar.
 */
(function() {
  'use strict';

  class WorkTimeline {
    constructor() {
      this.container = document.getElementById('work-timeline');
      this.progressLine = document.getElementById('work-timeline-progress');
      this.items = [];
      this.navBtns = [];
      this.ticking = false;
      this.init();
    }

    init() {
      if (!this.container || !this.progressLine) return;

      this.items = Array.from(this.container.querySelectorAll('.work-timeline-item'));
      this.navBtns = Array.from(document.querySelectorAll('.timeline-nav-btn'));

      if (this.items.length === 0) return;

      // Click to scroll to project
      this.navBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetIdx = parseInt(btn.getAttribute('data-nav-target'), 10);
          if (!isNaN(targetIdx) && this.items[targetIdx]) {
            const targetEl = this.items[targetIdx];
            if (window.lenis && typeof window.lenis.scrollTo === 'function') {
              window.lenis.scrollTo(targetEl, { offset: -120, duration: 1.2 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      });

      // Unified scroll listener (Lenis + Native window scroll)
      const onScroll = () => {
        if (!this.ticking) {
          this.ticking = true;
          requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
          });
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      if (window.lenis && typeof window.lenis.on === 'function') {
        window.lenis.on('scroll', onScroll);
      } else {
        const checkLenis = setInterval(() => {
          if (window.lenis && typeof window.lenis.on === 'function') {
            window.lenis.on('scroll', onScroll);
            clearInterval(checkLenis);
          }
        }, 150);
        setTimeout(() => clearInterval(checkLenis), 3000);
      }

      // Initial update
      this.update();
    }

    update() {
      if (!this.container || !this.progressLine || this.items.length === 0) return;

      const rect = this.container.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const triggerY = viewportH * 0.5; // Midpoint of screen

      // Calculate progress line height based on trigger line
      const totalH = rect.height;
      const currentPassed = triggerY - rect.top;
      let progress = currentPassed / totalH;
      progress = Math.max(0, Math.min(1, progress));

      this.progressLine.style.height = `${(progress * 100).toFixed(2)}%`;

      // Check each item
      let activeIdx = 0;
      this.items.forEach((item, idx) => {
        const itemRect = item.getBoundingClientRect();
        const itemTrigger = itemRect.top + 60; // Top node position

        if (itemTrigger <= triggerY + 80) {
          item.classList.add('is-active');
          activeIdx = idx;
        } else {
          item.classList.remove('is-active');
        }
      });

      // Always keep first card active if scrolled into the section
      if (rect.top <= triggerY + 100 && this.items[0]) {
        this.items[0].classList.add('is-active');
      }

      // Update sidebar nav buttons
      this.navBtns.forEach((btn, idx) => {
        if (idx === activeIdx && rect.top <= triggerY + 100 && rect.bottom >= triggerY - 100) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }
  }

  window.WorkTimeline = WorkTimeline;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.workTimelineInstance = new WorkTimeline();
    });
  } else {
    window.workTimelineInstance = new WorkTimeline();
  }
})();
