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
  let lenisRafId = null;
  try {
    if (typeof Lenis !== 'undefined') {
      window.lenis = lenis = new Lenis({
        duration: 1.2,
        wheelMultiplier: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: true,
        syncTouchLerp: 0.15,
        touchMultiplier: 1.2,
        touchInertiaExponent: 1.55,
        autoRaf: false
      });

      const raf = (time) => {
        if (document.hidden) {
          lenisRafId = null;
          return;
        }
        lenis.raf(time);
        lenisRafId = requestAnimationFrame(raf);
      };

      const startLenisRaf = () => {
        if (lenisRafId === null && !document.hidden) {
          lenisRafId = requestAnimationFrame(raf);
        }
      };

      const stopLenisRaf = () => {
        if (lenisRafId !== null) {
          cancelAnimationFrame(lenisRafId);
          lenisRafId = null;
        }
      };

      startLenisRaf();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopLenisRaf();
        } else {
          startLenisRaf();
        }
      });
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
      title: 'Supreme Infosys',
      subtitle: 'A website helping customers explore computer products and services.',
      badge: '● Live Website',
      date: '2026',
      link: 'https://lallycomputers.vercel.app/',
      linkText: 'Visit Live Website ↗',
      body: `
        <p><strong>Overview:</strong> A website helping customers explore computer products and services.</p>
        <p class="pt-2"><strong>Design &amp; Development:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Designed clear pages and organized product listings.</li>
          <li>Built layouts that adapt to different screen sizes.</li>
        </ul>
        <p class="pt-2"><strong>Key Highlights:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Easy-to-browse product categories.</li>
          <li>Clear hardware specifications.</li>
          <li>Simple navigation and contact options.</li>
          <li>Works across mobile, tablet, and desktop.</li>
        </ul>
      `,
      chips: ['Next.js', 'React', 'Tailwind CSS', 'Vercel']
    },
    branding: {
      title: 'Personal Portfolio',
      subtitle: 'A personal website presenting my work, skills, and interests.',
      badge: '● Personal Project',
      date: '2026',
      link: 'https://github.com/khush-debug/khushgill',
      linkText: 'View Portfolio Source ↗',
      body: `
        <p><strong>Overview:</strong> A personal website presenting my work, skills, and interests.</p>
        <p class="pt-2"><strong>Design Direction:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Clean layouts with bold headings.</li>
          <li>Consistent colours and subtle movement.</li>
        </ul>
        <p class="pt-2"><strong>Key Features:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Selected projects with short case studies.</li>
          <li>Interactive project cards and scrolling effects.</li>
          <li>Layouts that adapt to different devices.</li>
          <li>Easy access to my work and contact details.</li>
        </ul>
      `,
      chips: ['Website Design & Development', 'Branding', 'Interactive Animations']
    },
    ai: {
      title: 'Slyphe — Brand Identity & Strategy',
      subtitle: 'Help businesses build a clear and recognizable identity.',
      badge: '● Brand Strategy',
      date: '2026',
      link: 'https://slyphe.vercel.app/',
      linkText: 'Visit Slyphe Live ↗',
      body: `
        <p><strong>Overview:</strong> Help businesses build a clear and recognizable identity.</p>
        <p class="pt-2"><strong>Strategic Approach:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Understand the business and its audience.</li>
          <li>Create a visual style that supports its goals.</li>
          <li>Keep the brand consistent across its online presence.</li>
        </ul>
        <p class="pt-2"><strong>Key Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Brand colours and fonts.</li>
          <li>A consistent visual style.</li>
          <li>Clear design guidelines.</li>
          <li>Direction for website design and presentation.</li>
        </ul>
      `,
      chips: ['Brand Planning', 'Visual Design', 'Website Direction', 'Design Guidelines']
    },
    graphic: {
      title: 'Graphic Designing',
      subtitle: 'Creative visual design, marketing collateral, social media assets, and digital artwork.',
      badge: '● Visual Arts',
      date: '2026',
      link: 'https://www.instagram.com/kggills',
      linkText: 'View Visuals on Instagram ↗',
      body: `
        <p><strong>Overview:</strong> Creative visual design, marketing collateral, social media assets, and digital artwork crafted with strong attention to typography, layout, and visual hierarchy.</p>
        <p class="pt-2"><strong>Design Approach:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Strong composition, contrast, and typographic hierarchy.</li>
          <li>Custom visual assets tailored to brand voice and audience.</li>
          <li>Consistent colour harmony across print and digital formats.</li>
          <li>Export-ready production files for web, social, and print.</li>
        </ul>
        <p class="pt-2"><strong>Key Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-[#595F5B]">
          <li>Digital artwork and bespoke illustrations.</li>
          <li>Promotional posters, banners, and campaign collateral.</li>
          <li>Social media visuals and content templates.</li>
          <li>Typography-led editorial layouts and art direction.</li>
        </ul>
      `,
      chips: ['Digital Art', 'Marketing Collateral', 'Typography', 'Visual Hierarchy']
    }
  };

  // Alias folder keys (`portfolio`, `brand`, `collab`) to match HTML `data-open-case-study` attributes
  projectDetails.portfolio = projectDetails.branding;
  projectDetails.brand = projectDetails.ai;
  projectDetails.collab = projectDetails.graphic;

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
      span.className = 'px-2.5 py-1 rounded-full text-xs font-mono bg-[#F0EFEB] text-[#202522] border border-[#DADDD7]';
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

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-case-study]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const projectKey = btn.getAttribute('data-open-case-study');
    if (projectKey) openModal(projectKey);
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

      let isHeroVisible = true;
      let isPageVisible = !document.hidden;
      let portalRafId = null;
      let elapsed = 0;
      let lastFrameTime = performance.now();

      function handleResize() {
        if (!isHeroVisible) return;
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
        if (!isHeroVisible || !isPageVisible) return;
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          targetMouse.x = (e.clientX - rect.left) / rect.width;
          targetMouse.y = 1.0 - ((e.clientY - rect.top) / rect.height);
        }
      }, { passive: true });

      function renderLoop(now) {
        if (!isHeroVisible || !isPageVisible) {
          portalRafId = null;
          return;
        }
        const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;
        elapsed += dt;

        material.uniforms.u_time.value = elapsed * 0.85;
        material.uniforms.u_mouse.value.lerp(targetMouse, 0.035);
        renderer.render(scene, camera);
        portalRafId = requestAnimationFrame(renderLoop);
      }

      function syncPortalPlayback() {
        if (isHeroVisible && isPageVisible) {
          if (portalRafId === null) {
            handleResize();
            lastFrameTime = performance.now();
            portalRafId = requestAnimationFrame(renderLoop);
          }
        } else if (portalRafId !== null) {
          cancelAnimationFrame(portalRafId);
          portalRafId = null;
        }
      }

      if (typeof IntersectionObserver !== 'undefined') {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            syncPortalPlayback();
          });
        }, { rootMargin: '80px 0px', threshold: 0 });
        heroObserver.observe(hero);
      }

      document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        syncPortalPlayback();
      });

      // Render initial frame and start only if visible
      renderer.render(scene, camera);
      syncPortalPlayback();
    } catch (err) {
      console.warn('Portal WebGL initialization skipped:', err);
    }
  }
  initPortalField();

  // ==========================================
  // 7B. VIEWPORT ANIMATION PAUSE CONTROLLER
  // Pauses CSS keyframe animations and frees GPU layers when sections scroll off-screen or tab is hidden
  // ==========================================
  function initViewportAnimationManager() {
    const syncPageVisibility = () => {
      document.documentElement.classList.toggle('is-page-hidden', document.hidden);
    };
    syncPageVisibility();
    document.addEventListener('visibilitychange', syncPageVisibility);

    if (typeof IntersectionObserver === 'undefined') return;

    const targets = document.querySelectorAll('section, footer, .marquee-selected-works, .cta-stamp-btn, [class*="animate-"]');
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      });
    }, { rootMargin: '80px 0px', threshold: 0 });

    targets.forEach((el) => animObserver.observe(el));
  }
  initViewportAnimationManager();

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
  let isFooterVisible = false;
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

    if (typeof IntersectionObserver !== 'undefined') {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isFooterVisible = entry.isIntersecting;
          if (isFooterVisible) {
            const sy = (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
            updateFooterTransform(sy);
          }
        });
      }, { rootMargin: '120px 0px', threshold: 0 });
      footerObserver.observe(footerRevealWrapper);
    } else {
      isFooterVisible = true;
    }

    window.addEventListener('resize', () => {
      if (!isFooterVisible) return;
      const sy = (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
      updateFooterTransform(sy);
    }, { passive: true });
    updateFooterTransform(0);
  }

  // ==========================================
  // 9. MODULAR CASE STUDY MODAL TRIGGERS & FOOTER SCROLL
  // Note: 3D Scroll Stacking and Kinetic Wheel are now modularized
  // into components/scroll-stack/ and components/kinetic-wheel/
  // ==========================================
  const projectKeys = ['supreme', 'branding', 'ai', 'creative'];
  document.querySelectorAll('.scroll-stack-card').forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      openModal(projectKeys[idx]);
    });
  });

  // Footer animation scroll driver (runs only when footer is in view)
  if (typeof updateFooterTransform === 'function') {
    let footerTicking = false;
    const handleFooterScroll = (customY) => {
      if (!isFooterVisible || document.hidden) return;
      if (!footerTicking) {
        requestAnimationFrame(() => {
          const sy = typeof customY === 'number' ? customY : window.scrollY;
          updateFooterTransform(sy);
          footerTicking = false;
        });
        footerTicking = true;
      }
    };
    window.addEventListener('scroll', () => handleFooterScroll(window.scrollY), { passive: true });
    if (lenis) {
      lenis.on('scroll', (e) => {
        const sy = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
        handleFooterScroll(sy);
      });
    }
  }

});
