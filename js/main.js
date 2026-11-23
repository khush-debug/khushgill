/**
 * Khushman Gill — Portfolio Interactive Controller (Editorial Edition)
 * Inspired by brutalist-luxury typography, interactive star-border physics,
 * fullscreen curtain navigation, and dynamic case study views.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. LENIS LUXURY SMOOTH SCROLL (MANAN RAJKHOWA EXACT ENGINE)
  // Options: duration: 1.2, wheelMultiplier: 0.9, syncTouch: true, expoOut easing
  // ==========================================
  let lenis = null;
  try {
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        wheelMultiplier: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: true,
        syncTouchLerp: 0.15,
        touchMultiplier: 1.2,
        touchInertiaExponent: 1.55,
        autoRaf: false
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } catch (e) {
    console.warn('Lenis failed to load, falling back to native scroll:', e);
  }

  // Smooth anchor links with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // ==========================================
  // 1. FULLSCREEN CURTAIN MENU
  // ==========================================
  const menuBtn = document.getElementById('menu-toggle');
  const menuCloseBtn = document.getElementById('menu-close');
  const fullscreenMenu = document.getElementById('fullscreen-menu');
  const menuLinks = document.querySelectorAll('.menu-link-item');

  const openMenu = () => {
    if (fullscreenMenu) {
      fullscreenMenu.classList.add('open');
      if (menuBtn) {
        menuBtn.classList.add('is-active');
        menuBtn.setAttribute('aria-label', 'Close menu');
      }
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
  };

  const closeMenu = () => {
    if (fullscreenMenu) {
      fullscreenMenu.classList.remove('open');
      if (menuBtn) {
        menuBtn.classList.remove('is-active');
        menuBtn.setAttribute('aria-label', 'Open menu');
      }
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  };

  const toggleMenu = () => {
    if (fullscreenMenu && fullscreenMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Global smooth scroll for internal anchors via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeMenu();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ESC to close menu or modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeModal();
    }
  });


  // ==========================================
  // 2. STATS COUNT-UP ANIMATION
  // ==========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateStats = () => {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1800;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const currentVal = target * easeOutQuad;

        el.textContent = currentVal.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const statsSection = document.getElementById('philosophy');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
        }
      });
    }, { threshold: 0.25 });
    statsObserver.observe(statsSection);
  }


  // ==========================================
  // 4. SCROLL REVEAL OBSERVER
  // ==========================================
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 5. CASE STUDY DATA & MODAL CONTROLLER
  // ==========================================
  const projectDetails = {
    supreme: {
      title: 'Lally Computers',
      subtitle: 'A business website presenting products and services through a clear, accessible interface.',
      badge: '● Live Website',
      date: '2026',
      link: 'https://lallycomputers.vercel.app/',
      linkText: 'Visit Live Website ↗',
      body: `
        <p><strong>Overview:</strong> A business website presenting products and services through a clear, accessible interface.</p>
        <p><strong>Design & Development:</strong> Designed and developed with responsive layouts, an intuitive product catalog, and smooth customer communication pathways.</p>
        <p><strong>Key Highlights:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Engineered responsive, clean layouts across mobile, tablet, and desktop viewports.</li>
          <li>Organized hardware specifications and product categories for effortless browsing.</li>
          <li>Deployed on Vercel with high-performance edge speeds and 99.9% uptime.</li>
          <li>Clean interface prioritizing accessibility and intuitive navigation.</li>
        </ul>
      `,
      chips: ['Frontend Development', 'UI/UX Design', 'Next.js / React', 'Tailwind CSS', 'Vercel', 'Responsive Web']
    },
    branding: {
      title: 'Personal Portfolio',
      subtitle: 'A collection of my work across web development, design, and branding.',
      badge: 'Personal Project',
      date: '2026',
      link: 'https://github.com/khush-debug/khushgill',
      linkText: 'View Portfolio Source ↗',
      body: `
        <p><strong>Overview:</strong> A collection of my work across web development, design, and branding.</p>
        <p><strong>Design Direction:</strong> Built with clean layouts, smooth interactions, and attention to detail. Blends brutalist editorial aesthetics with smooth motion and tactile interactions.</p>
        <p><strong>Key Features:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Custom architectural framing with fixed coordinates and responsive viewports.</li>
          <li>Tactile physics, 3D scroll stacking, and interactive star-border cards.</li>
          <li>Clear narrative hierarchy showcasing design and frontend capabilities.</li>
        </ul>
      `,
      chips: ['Frontend Development', 'UI/UX Design', 'Brand Direction', 'Web Architecture', 'Three.js']
    },
    ai: {
      title: 'Brand Identity & Strategy',
      subtitle: 'Visual identities and digital direction that reflect a business’s goals.',
      badge: 'Brand Direction',
      date: '2026',
      link: 'https://github.com/khush-debug',
      linkText: 'Explore Work ↗',
      body: `
        <p><strong>Overview:</strong> Develop visual identities and digital direction that reflect a business’s goals.</p>
        <p><strong>Strategic Approach:</strong> Shaping how brands look, feel, and connect with people. From shaping a brand’s identity to designing its interface and building its website, I help turn early concepts into polished work.</p>
        <p><strong>Key Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Distinctive brand identities and visual style systems.</li>
          <li>Digital direction aligning design choices with business objectives.</li>
          <li>Unified design tokens across typography, color, and interaction states.</li>
        </ul>
      `,
      chips: ['Brand Strategy', 'Visual Identity', 'Digital Direction', 'Design Systems']
    },
    creative: {
      title: 'Creative Collaboration',
      subtitle: 'Work with businesses and creators to develop ideas and bring projects to completion.',
      badge: 'Collaboration',
      date: '2026',
      link: 'https://www.instagram.com/kggills',
      linkText: 'Connect on Instagram ↗',
      body: `
        <p><strong>Overview:</strong> Work with businesses and creators to develop ideas and bring projects to completion.</p>
        <p><strong>Approach:</strong> Understand the purpose. Shape the experience. Build with care. Combining design, technology, and business thinking to create digital experiences that serve a purpose.</p>
        <p><strong>Collaboration Areas:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>UI/UX Design: Plan user journeys and create intuitive interfaces, from wireframes to final designs.</li>
          <li>Frontend Development: Build responsive websites with clean layouts, smooth interactions, and attention to detail.</li>
          <li>End-to-end execution from initial concept to live production launch.</li>
        </ul>
      `,
      chips: ['UI/UX Design', 'Frontend Development', 'Brand Direction', 'Creative Collaboration']
    }
  };

  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBadge = document.getElementById('modal-badge');
  const modalDate = document.getElementById('modal-date');
  const modalBody = document.getElementById('modal-body');
  const modalChips = document.getElementById('modal-chips');
  const modalLinkBtn = document.getElementById('modal-link-btn');

  const openModal = (projectKey) => {
    const data = projectDetails[projectKey];
    if (!data || !modal) return;

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalBadge.textContent = data.badge;
    modalDate.textContent = data.date;
    modalBody.innerHTML = data.body;

    modalChips.innerHTML = '';
    data.chips.forEach(chip => {
      const span = document.createElement('span');
      span.className = 'px-2.5 py-1 rounded-full text-xs font-mono bg-white/10 text-white border border-white/10';
      span.textContent = chip;
      modalChips.appendChild(span);
    });

    modalLinkBtn.href = data.link;
    modalLinkBtn.innerHTML = `<span>${data.linkText}</span>`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };

  document.querySelectorAll('[data-open-case-study]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectKey = btn.getAttribute('data-open-case-study');
      openModal(projectKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }


  // ==========================================
  // 6. 1-CLICK EMAIL COPY WITH TOAST
  // ==========================================
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  document.querySelectorAll('[data-copy-email]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'kgill3662@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Copied kgill3662@gmail.com to clipboard!');
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  });


  // ==========================================
  // 6. CONTACT FORM HANDLER (REAL EMAIL DELIVERY)
  // Powered by FormSubmit.co -> kgill3662@gmail.com
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const firstName = document.getElementById('firstName')?.value || '';
      const lastName = document.getElementById('lastName')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const subject = document.getElementById('subject')?.value || 'New Portfolio Inquiry';
      const message = document.getElementById('message')?.value || '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Message...</span>';
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/kgill3662@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Portfolio Inquiry: ${subject} (${firstName} ${lastName})`,
            _captcha: 'false',
            _template: 'table',
            _replyto: email,
            name: `${firstName} ${lastName}`.trim(),
            email: email,
            subject: subject,
            message: message
          })
        });

        const data = await response.json();

        if (response.ok && (data.success === 'true' || data.success === true)) {
          if (formSuccess) {
            formSuccess.textContent = '✓ Message dispatched successfully. Khushman will be in touch soon.';
            formSuccess.classList.remove('hidden', 'text-amber-600', 'text-red-500');
            formSuccess.classList.add('text-emerald-600');
          }
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Message Sent Successfully ✓</span>';
          }
        } else if (data.message && data.message.includes('Activation')) {
          if (formSuccess) {
            formSuccess.textContent = '✓ Form submitted! Please click "Activate Form" in your email (kgill3662@gmail.com) to complete setup.';
            formSuccess.classList.remove('hidden', 'text-emerald-600', 'text-red-500');
            formSuccess.classList.add('text-amber-600');
          }
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Form Activation Sent ✓</span>';
          }
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        console.warn('Form submission fallback:', err);
        if (formSuccess) {
          formSuccess.textContent = 'Notice: opening your email client to send message directly...';
          formSuccess.classList.remove('hidden', 'text-emerald-600');
          formSuccess.classList.add('text-amber-600');
        }
        const mailtoUrl = `mailto:kgill3662@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${firstName} ${lastName} (${email})\n\n${message}`)}`;
        window.location.href = mailtoUrl;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Message →</span>';
        }
      }

      setTimeout(() => {
        if (submitBtn) submitBtn.innerHTML = '<span>Send Message →</span>';
        if (formSuccess) formSuccess.classList.add('hidden');
      }, 7000);
    });
  }

  // ==========================================
  // 7. HERO AMBIENT PORTAL FIELD (THREE.JS DIRECT WEBGL)
  // Deep dark ambient shader rendered directly on transparent canvas over #000000 black
  // ==========================================
  function initPortalField() {
    const canvas = document.getElementById('portal-field-canvas');
    const hero = document.getElementById('hero');
    if (!canvas || !hero || typeof THREE === 'undefined') return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.PlaneGeometry(2, 2);

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec3 u_colorCore;
        uniform vec3 u_colorFringe;
        varying vec2 vUv;

        vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(in vec2 p) {
          const float K1 = 0.366025404;
          const float K2 = 0.211324865;
          vec2 i = floor(p + (p.x + p.y) * K1);
          vec2 a = p - i + (i.x + i.y) * K2;
          vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec2 b = a - o + K2;
          vec2 c = a - 1.0 + 2.0 * K2;
          vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
          vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
          return dot(n, vec3(70.0));
        }

        float sdArc(vec2 p, vec2 center, float radius, float width, float warp) {
          p.y += sin(p.x * 2.0 + u_time * 0.3) * warp;
          p.x += noise(p * 1.5 + u_time * 0.1) * (warp * 0.8);
          float d = length(p - center) - radius;
          return abs(d) - width;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 st = uv;
          float aspect = u_resolution.x / u_resolution.y;
          st.x *= aspect;

          vec2 mouseOffset = (u_mouse - 0.5) * 0.05;
          st += mouseOffset;

          vec2 center = vec2(0.5 * aspect, 0.5);

          float d1 = sdArc(st, center, 0.52, 0.020, 0.15);
          float d2 = sdArc(st, center, 0.57, 0.060, 0.20);

          float coreGlow = exp(-d1 * 26.0);
          float fringeGlow = exp(-d2 * 8.5);
          float dist = length(st - center);
          float wash = smoothstep(0.9, 0.25, dist) * 0.07;

          vec3 finalColor = vec3(0.0);
          finalColor += u_colorCore * coreGlow;
          finalColor += u_colorFringe * fringeGlow;
          finalColor += u_colorFringe * wash * (sin(u_time * 0.5) * 0.2 + 0.8);

          float alpha = clamp(coreGlow + fringeGlow + wash, 0.0, 1.0);
          finalColor = vec3(1.0) - exp(-finalColor * 1.5);

          gl_FragColor = vec4(finalColor, alpha * 0.75);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_time: { value: 0.0 },
          u_resolution: { value: new THREE.Vector2(hero.clientWidth, hero.clientHeight) },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_colorCore: { value: new THREE.Color('#FFFFFF') },
          u_colorFringe: { value: new THREE.Color('#38bdf8') }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      function handleResize() {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h, false);
          material.uniforms.u_resolution.value.set(w, h);
        }
      }
      handleResize();
      window.addEventListener('resize', handleResize, { passive: true });

      let targetMouse = new THREE.Vector2(0.5, 0.5);
      window.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          targetMouse.x = (e.clientX - rect.left) / rect.width;
          targetMouse.y = 1.0 - ((e.clientY - rect.top) / rect.height);
        }
      }, { passive: true });

      const clock = new THREE.Clock();
      function renderLoop() {
        requestAnimationFrame(renderLoop);
        material.uniforms.u_time.value = clock.getElapsedTime() * 0.85;
        material.uniforms.u_mouse.value.lerp(targetMouse, 0.035);
        renderer.render(scene, camera);
      }
      renderLoop();
    } catch (err) {
      console.warn('Portal WebGL initialization skipped:', err);
    }
  }
  initPortalField();

  // ==========================================
  // 8. FOOTER HEAD-TO-TOE ANIMATION (KHUSHMAN)
  // Exact Framer Motion Replica from mananrajkhowa.vercel.app:
  // - Outer wrapper scroll progress (["start end", "end end"])
  // - footerY: translateY("-50%" -> "0%")
  // - footerScale: 0.8 -> 1.0
  // - footerOpacity: 0.0 -> 1.0
  // ==========================================
  const footerRevealWrapper = document.getElementById('footer-reveal-wrapper');
  const footerParallax = document.getElementById('footer-parallax');
  const footerBigNameBox = document.getElementById('footer-big-name-box');
  const footerMetaGrid = document.getElementById('footer-meta-grid');

  let updateFooterTransform = null;
  if (footerRevealWrapper && footerParallax && footerBigNameBox) {
    updateFooterTransform = (m) => {
      const rect = footerRevealWrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = footerRevealWrapper.offsetHeight || windowHeight;
      const current = windowHeight - rect.top;
      const progress = Math.min(Math.max(current / total, 0), 1);

      // Parallax translation: -50% to 0%
      const translateY = -50 + (progress * 50);
      footerParallax.style.transform = `translate3d(0, ${translateY.toFixed(3)}%, 0)`;

      // Scale: 0.8 to 1.0, Opacity: 0 to 1.0
      const scale = 0.8 + (progress * 0.2);
      const opacity = progress;

      footerBigNameBox.style.transform = `scale(${scale.toFixed(4)})`;
      footerBigNameBox.style.opacity = `${opacity.toFixed(4)}`;

      // Top metadata grid staggered entrance
      if (footerMetaGrid) {
        if (progress > 0.15) {
          footerMetaGrid.style.opacity = '1';
          footerMetaGrid.style.transform = 'translate3d(0, 0px, 0)';
          footerMetaGrid.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        } else {
          footerMetaGrid.style.opacity = '0';
          footerMetaGrid.style.transform = 'translate3d(0, 15px, 0)';
        }
      }
    };

    window.addEventListener('resize', () => {
      const sy = (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
      updateFooterTransform(sy);
    }, { passive: true });
    updateFooterTransform(0);
  }

  // ==========================================
  // 9. SCROLL STACK & 3D VOID PERSPECTIVE ANIMATION
  // Head-to-toe physical card stacking + 3D perspective fly-away
  // Exact Replica from mananrajkhowa.vercel.app:
  // - Pinning offset: $ = (L - j) / 2
  // - Top tab stack distance: 18px per card
  // - Base scale: 0.92, scale step: 0.015 per card
  // - Scroll travel: K = L * 1.2
  // - 3D Perspective on voidContainer:
  //   perspectiveOrigin: 50% (m + L/2 - k)px
  //   perspective: 1500px
  //   transformOrigin: 50% (m + L/2 - k)px
  //   translate3d(0, 0, -Math.pow(I, 1.5) * 3000px) scale(1 - Math.pow(I, 1.5))
  //   opacity: 1 - Math.pow(I, 2.5)
  // - Kinetic Wheel:
  //   rotate(180 * (1 - I)deg) around 50% 100%
  // ==========================================
  const scrollCards = Array.from(document.querySelectorAll('.scroll-stack-card'));
  const perspectiveContainer = document.getElementById('scroll-stack-inner');
  const voidContainer = document.getElementById('void-container');
  const stackEnd = document.getElementById('scroll-stack-end');
  const kineticWheel = document.getElementById('kinetic-wheel');

  if (scrollCards.length > 0 && voidContainer) {
    const sr = {
      itemDistance: 100,
      itemScale: 0.015,
      itemStackDistance: 18,
      stackPosition: 0.08,
      scaleEndPosition: 0.05,
      baseScale: 0.92
    };

    let cardTops = [];
    let endTop = 0;
    let perspectiveTop = 0;
    let isCalculating = false;

    // Set initial card styles
    scrollCards.forEach((c, idx) => {
      if (idx < scrollCards.length - 1) {
        c.style.marginBottom = `${sr.itemDistance}px`;
      } else {
        c.style.marginBottom = '0px';
      }
      c.style.willChange = 'transform';
      c.style.transformOrigin = 'top center';
    });

    const updateCardStack = (currentScrollY) => {
      if (isCalculating || !cardTops.length) return;
      const m = typeof currentScrollY === 'number' ? currentScrollY : window.scrollY;
      const E = scrollCards;
      const P = cardTops;
      const C = endTop;
      const k = perspectiveTop;
      if (!E.length || !P.length) return;

      const L = window.innerHeight;
      const isMobile = window.innerWidth < 1024;
      const j = E[0].offsetHeight;
      const $ = (L - j) / 2;
      const U = $ - (sr.stackPosition - sr.scaleEndPosition) * L;
      const ne = P[E.length - 1] - U;
      const K = L * 1.2;

      let I = 0;
      if (m > ne) {
        I = (m - ne) / K;
        I = Math.min(Math.max(I, 0), 1);
      }

      // 1. CARDS PINNING & ACCELERATED SCALING
      for (let X = 0; X < E.length; X++) {
        const Q = E[X];
        const ae = P[X];
        const me = ae - $ - (sr.itemStackDistance * X);
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

        const Ze = sr.baseScale + (X * sr.itemScale);
        const Ge = Number((1 - Fe * (1 - Ze)).toFixed(4));

        let Je = 0;
        if (m >= xe && m <= ee) {
          Je = m - ae + $ + (sr.itemStackDistance * X);
        } else if (m > ee) {
          Je = ee - ae + $ + (sr.itemStackDistance * X);
        }

        Q.style.transform = `translate3d(0, ${Je.toFixed(2)}px, 0) scale(${Ge})`;
      }

      // 2. 3D PERSPECTIVE ON VOID CONTAINER (EXACT MANAN REPLICA)
      const A = voidContainer;
      const M = perspectiveContainer;
      if (A && M) {
        const X = m + L / 2 - k;
        M.style.perspectiveOrigin = `50% ${X.toFixed(1)}px`;
        M.style.perspective = '1500px';

        if (I > 0) {
          if (isMobile) {
            const Q = Math.min(I / 0.25, 1);
            const ae = 1 - Q;
            A.style.transformOrigin = `50% ${X.toFixed(1)}px`;
            A.style.transform = 'translate3d(0, 0, 0) scale(1)';
            A.style.opacity = Math.max(0, ae).toFixed(3);
            if (Q >= 1 || I >= 1) {
              A.style.visibility = 'hidden';
              A.style.opacity = '0';
              A.style.pointerEvents = 'none';
            } else {
              A.style.visibility = 'visible';
              A.style.pointerEvents = 'auto';
            }
          } else {
            // Desktop 3D Scroll Perspective Fly-Away into the void!
            const Q = Math.pow(I, 1.5);
            const ae = -Q * 3000;
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
          A.style.transform = '';
          A.style.opacity = '1';
          A.style.visibility = 'visible';
          A.style.pointerEvents = 'auto';
        }
      }

      // 3. KINETIC ARC WHEEL (EXACT MANAN REPLICA & STRICT LIFECYCLE)
      const W = kineticWheel;
      if (W) {
        // If before start of 3D void (I <= 0) or after completion of 3D void (I >= 1),
        // or if past stack end, hide the wheel completely so it never overlaps other sections
        if (I <= 0 || I >= 1 || (C > 0 && m > C + L * 1.2)) {
          W.style.display = 'none';
          W.style.visibility = 'hidden';
          W.style.opacity = '0';
          if (!isMobile) {
            W.style.transform = I <= 0 ? 'rotate(180deg)' : 'rotate(0deg)';
          }
        } else {
          // 0 < I < 1: Active 3D void perspective flight!
          W.style.display = 'block';
          W.style.visibility = 'visible';
          if (isMobile) {
            let X = 0;
            if (I <= 0.25) X = 0.5 * (I / 0.25);
            else if (I <= 0.5) X = 0.5 + 0.5 * ((I - 0.25) / 0.25);
            else if (I <= 0.8) X = 1;
            else X = Math.max(0, 1 - (I - 0.8) / 0.2);
            W.style.opacity = X.toFixed(3);
            W.style.transform = 'translate3d(0, 0, 0)';
          } else {
            // Desktop:
            // Smooth entrance fade from 0 to 0.15
            // Full solid opacity from 0.15 to 0.85
            // Graceful exit fade from 0.85 to 1.0 as cards vanish into the deep void
            let alpha = 1;
            if (I < 0.15) {
              alpha = I / 0.15;
            } else if (I > 0.85) {
              alpha = Math.max(0, (1 - I) / 0.15);
            }
            W.style.opacity = alpha.toFixed(3);

            // Rotates 180deg -> 0deg:
            // Sweeps up from right horizon (180deg), arches through framing the shrunken cards,
            // and finishes down to the right bottom (0deg)
            const rot = 180 * (1 - I);
            W.style.transformOrigin = '50% 100%';
            W.style.transform = `rotate(${rot.toFixed(2)}deg)`;
          }
        }
      }
    };

    const measureCardPositions = () => {
      isCalculating = true;
      scrollCards.forEach(c => {
        c.style.transform = '';
      });
      if (voidContainer) {
        voidContainer.style.transform = '';
        voidContainer.style.transformOrigin = '';
        voidContainer.style.opacity = '1';
        voidContainer.style.visibility = 'visible';
      }
      if (kineticWheel) {
        kineticWheel.style.transform = '';
      }

      const currentScroll = (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
      cardTops = scrollCards.map(c => c.getBoundingClientRect().top + currentScroll);
      endTop = stackEnd ? (stackEnd.getBoundingClientRect().top + currentScroll) : 0;
      perspectiveTop = perspectiveContainer ? (perspectiveContainer.getBoundingClientRect().top + currentScroll) : 0;
      isCalculating = false;

      // Synchronously restore card transforms immediately so no unpinned frame paints
      updateCardStack(currentScroll);
    };

    measureCardPositions();

    // Unified single-driver scroll loop: Lenis takes full priority when active
    if (lenis) {
      lenis.on('scroll', (e) => {
        const sy = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
        updateCardStack(sy);
        if (typeof updateFooterTransform === 'function') updateFooterTransform(sy);
      });
    } else {
      let scrollTicking = false;
      window.addEventListener('scroll', () => {
        if (!scrollTicking) {
          requestAnimationFrame(() => {
            const sy = window.scrollY;
            updateCardStack(sy);
            if (typeof updateFooterTransform === 'function') updateFooterTransform(sy);
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      measureCardPositions();
    }, { passive: true });

    window.addEventListener('load', () => {
      measureCardPositions();
    });

    if (document.fonts) {
      document.fonts.ready.then(() => {
        measureCardPositions();
      });
    }

    // Interactive card modal triggers
    const projectKeys = ['supreme', 'branding', 'ai', 'creative'];
    scrollCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        openModal(projectKeys[idx]);
      });
    });

    const initScroll = (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
    updateCardStack(initScroll);
  }

});
