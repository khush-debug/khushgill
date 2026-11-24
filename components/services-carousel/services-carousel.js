/**
 * 3D Curved Services Carousel Logic
 * Interactive 3D perspective slider with gesture swipe, navigation buttons, and responsive 3D math.
 */
(function() {
  'use strict';

  class Services3DCarousel {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.track = wrapper.querySelector('.services-carousel-track');
      this.cards = Array.from(wrapper.querySelectorAll('.services-card-3d'));
      this.prevBtn = wrapper.querySelector('[data-carousel-prev]');
      this.nextBtn = wrapper.querySelector('[data-carousel-next]');
      this.dotsContainer = wrapper.querySelector('.services-dots');
      
      this.currentIndex = 0;
      this.total = this.cards.length;
      if (this.total === 0) return;

      this.startX = 0;
      this.currentX = 0;
      this.isDragging = false;
      this.isVisible = true;
      this.dragThreshold = 45;

      this.init();
    }

    init() {
      // Pause carousel listeners/layers when scrolled off-screen
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            this.isVisible = entry.isIntersecting;
            this.wrapper.classList.toggle('is-offscreen', !entry.isIntersecting);
          });
        }, { rootMargin: '100px 0px', threshold: 0 });
        io.observe(this.wrapper);
      }

      // Build dots
      if (this.dotsContainer) {
        this.dotsContainer.innerHTML = '';
        this.cards.forEach((_, idx) => {
          const dot = document.createElement('button');
          dot.className = `services-dot ${idx === 0 ? 'is-active' : ''}`;
          dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
          dot.addEventListener('click', () => this.goTo(idx));
          this.dotsContainer.appendChild(dot);
        });
      }

      // Card click to center
      this.cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
          if (idx !== this.currentIndex) {
            e.preventDefault();
            this.goTo(idx);
          }
        });
      });

      // Navigation arrows
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Touch / Mouse gestures
      this.track.addEventListener('mousedown', (e) => this.dragStart(e));
      window.addEventListener('mousemove', (e) => this.dragMove(e));
      window.addEventListener('mouseup', () => this.dragEnd());

      this.track.addEventListener('touchstart', (e) => this.dragStart(e), { passive: true });
      window.addEventListener('touchmove', (e) => this.dragMove(e), { passive: true });
      window.addEventListener('touchend', () => this.dragEnd());

      window.addEventListener('resize', () => {
        if (this.isVisible) this.updateLayout();
      }, { passive: true });

      this.updateLayout();
    }

    dragStart(e) {
      if (!this.isVisible) return;
      this.isDragging = true;
      this.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      this.currentX = this.startX;
    }

    dragMove(e) {
      if (!this.isDragging) return;
      this.currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    dragEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      const diff = this.startX - this.currentX;
      if (Math.abs(diff) > this.dragThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    prev() {
      this.goTo((this.currentIndex - 1 + this.total) % this.total);
    }

    next() {
      this.goTo((this.currentIndex + 1) % this.total);
    }

    goTo(index) {
      this.currentIndex = index;
      this.updateLayout();
    }

    updateLayout() {
      const isMobile = window.innerWidth < 768;
      const spacing = isMobile ? 260 : 350;
      const depthStep = isMobile ? 80 : 120;
      const rotateAngle = isMobile ? 15 : 20;

      this.cards.forEach((card, i) => {
        // Calculate shortest circular offset from active index
        let offset = i - this.currentIndex;
        if (offset > this.total / 2) offset -= this.total;
        if (offset < -this.total / 2) offset += this.total;

        const absOffset = Math.abs(offset);
        const translateX = offset * spacing;
        const translateZ = -absOffset * depthStep;
        const rotateY = -offset * rotateAngle;
        const scale = Math.max(0.72, 1 - absOffset * 0.12);
        const opacity = absOffset > 2 ? 0 : Math.max(0.2, 1 - absOffset * 0.35);
        const zIndex = 20 - absOffset * 2;
        const brightness = absOffset === 0 ? 1 : 0.65;

        card.style.transform = `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.zIndex = zIndex;
        card.style.opacity = opacity;
        card.style.filter = `brightness(${brightness})`;
        card.style.pointerEvents = absOffset > 2 ? 'none' : 'auto';

        if (absOffset === 0) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.services-dot');
        dots.forEach((dot, idx) => {
          if (idx === this.currentIndex) {
            dot.classList.add('is-active');
          } else {
            dot.classList.remove('is-active');
          }
        });
      }
    }
  }

  // Initialize all instances on page load
  document.addEventListener('DOMContentLoaded', () => {
    const wrappers = document.querySelectorAll('.services-carousel-wrapper');
    wrappers.forEach(wrapper => new Services3DCarousel(wrapper));
  });
})();
