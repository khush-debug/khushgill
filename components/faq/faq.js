/**
 * FAQ Accordion Component Logic
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.faq-accordion-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        // Close others
        items.forEach(other => {
          if (other !== item) other.classList.remove('is-open');
        });
        if (isOpen) {
          item.classList.remove('is-open');
        } else {
          item.classList.add('is-open');
        }
      });
    });
  });
})();
