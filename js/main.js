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
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      playClickSound(950);
    }
  };

  const closeMenu = () => {
    if (fullscreenMenu) {
      fullscreenMenu.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      playClickSound(600);
    }
  };

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
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
  // 2. WEB AUDIO HAPTIC SOUND SYNTHESIZER
  // ==========================================
  let audioCtx = null;
  let soundEnabled = true;

  const initAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playClickSound = (freq = 800, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundToggle.classList.toggle('text-white', soundEnabled);
      soundToggle.classList.toggle('text-zinc-500', !soundEnabled);
      showToast(soundEnabled ? 'Haptic UI Audio: Enabled' : 'Haptic UI Audio: Muted');
      if (soundEnabled) playClickSound(1000);
    });
  }

  // Bind subtle sounds to interactive elements
  document.querySelectorAll('a, button, .star-border-container').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playClickSound(1200, 'triangle');
    });
  });


  // ==========================================
  // 3. STATS COUNT-UP ANIMATION
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
      subtitle: 'Commercial Computer Retail & Hardware Platform',
      badge: '● Live Production',
      date: '2026 — Present',
      link: 'https://lallycomputers.vercel.app/',
      linkText: 'Visit Live Platform ↗',
      body: `
        <p><strong>Executive Summary:</strong> Architected, built, and launched an end-to-end commercial website for Supreme Infosys, a technology and computing retail enterprise in Punjab, India.</p>
        <p><strong>The Strategic Objective:</strong> Create a polished, responsive digital storefront that organizes hundreds of technical hardware specifications, custom gaming rigs, laptops, and components into an effortless customer browsing experience.</p>
        <p><strong>Key Engineering Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Engineered sleek, responsive UI layouts optimized for mobile, tablet, and desktop customer journeys.</li>
          <li>Structured intuitive hardware categories (Laptops, Desktops, Components, Accessories) to drive direct customer inquiries.</li>
          <li>Deployed to Vercel with automated CI/CD pipeline, achieving near-instant global edge load speeds and 99.9% uptime.</li>
          <li>Streamlined customer communications and reduced showroom sales friction.</li>
        </ul>
      `,
      chips: ['Next.js / React', 'Tailwind CSS', 'Vercel Cloud Deployment', 'E-Commerce Architecture', 'Product Presentation', 'Responsive UX']
    },
    branding: {
      title: 'Brand Strategy & E-Commerce Venture Hub',
      subtitle: 'Commercial Brand Identity, Go-To-Market & Scalable Systems',
      badge: 'Commercial Venture',
      date: '2026',
      link: 'https://github.com/khush-debug',
      linkText: 'View GitHub Repos ↗',
      body: `
        <p><strong>Executive Summary:</strong> Conceptualized and engineered commercial systems for high-growth digital brands, connecting aesthetic positioning with high-converting digital storefronts.</p>
        <p><strong>Strategic Approach:</strong> Designed modular visual identities, typography hierarchies, and scalable layout components that boost brand prestige and customer conversion.</p>
        <p><strong>Key Impact:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Formulated end-to-end brand identity books including typography and component tokens.</li>
          <li>Engineered fast-loading landing pages optimized for e-commerce performance.</li>
          <li>Constructed unit economics and margin models for digital product offerings.</li>
        </ul>
      `,
      chips: ['Brand Strategy', 'E-Commerce Systems', 'Design Systems', 'Financial Modeling', 'GTM Planning']
    },
    ai: {
      title: 'Applied AI & Workflow Automations',
      subtitle: 'Generative AI Pipelines & Intelligent Business Workflows',
      badge: 'Applied AI Solutions',
      date: '2026',
      link: 'https://github.com/khush-debug',
      linkText: 'Explore Repos ↗',
      body: `
        <p><strong>Executive Summary:</strong> Researched and deployed prompt pipelines and autonomous agent automations to eliminate administrative friction in day-to-day business operations.</p>
        <p><strong>Core Capabilities:</strong> Context-window curation, structured LLM JSON outputs, and smart pipeline scripting to accelerate decision-making.</p>
        <p><strong>Key Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Designed structured prompt frameworks that convert messy business inputs into clean JSON outputs.</li>
          <li>Automated operational drafting, client intake, and data categorization routines.</li>
          <li>Integrated state-of-the-art LLMs into rapid internal prototype applications.</li>
        </ul>
      `,
      chips: ['LLM Workflows', 'Prompt Engineering', 'Workflow Automation', 'Rapid Prototyping', 'Autonomous Systems']
    },
    creative: {
      title: 'Creative Direction & Visual Systems',
      subtitle: 'Fine Arts, Sketching & High-Caliber Digital Polish',
      badge: 'Creative Mastery',
      date: '2026',
      link: 'https://www.instagram.com/kggills',
      linkText: 'View Studio Work ↗',
      body: `
        <p><strong>Executive Summary:</strong> Grounded in rigorous traditional fine arts, sketching, and painting, translated into sharp digital design systems and compelling visual assets.</p>
        <p><strong>Philosophy:</strong> True digital distinction comes from an artist's eye for proportion, negative space, lighting, and visceral emotion—qualities that boilerplate templates cannot replicate.</p>
        <p><strong>Artistic Disciplines:</strong></p>
        <ul class="list-disc pl-5 space-y-2 text-zinc-300">
          <li>Traditional fine-art sketching, observational anatomy, and ink drawings.</li>
          <li>Design direction for modern digital editorial layouts and high-fashion aesthetics.</li>
          <li>Brand aesthetic curation with meticulous visual balance.</li>
        </ul>
      `,
      chips: ['Fine Arts', 'Traditional Sketching', 'Digital Layouts', 'Visual Hierarchy', 'Editorial Polish']
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
    playClickSound(880);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    playClickSound(500);
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
      const email = 'khushmangill18@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        playClickSound(1050);
        showToast('Copied khushmangill18@gmail.com to clipboard!');
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  });


  // ==========================================
  // 7. CONTACT FORM HANDLER
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Message...</span>';
      }

      setTimeout(() => {
        playClickSound(900);
        if (formSuccess) formSuccess.classList.remove('hidden');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Message Sent Successfully ✓</span>';
        }
        setTimeout(() => {
          if (submitBtn) submitBtn.innerHTML = '<span>Send Message →</span>';
          if (formSuccess) formSuccess.classList.add('hidden');
        }, 5000);
      }, 700);
    });
  }

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

  if (footerRevealWrapper && footerParallax && footerBigNameBox) {
    let ticking = false;

    const updateFooterTransform = (m) => {
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

      ticking = false;
    };

    const requestFooterUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateFooterTransform);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestFooterUpdate, { passive: true });
    window.addEventListener('resize', requestFooterUpdate);
    updateFooterTransform();
  }

  // ==========================================
  // 9. SCROLL STACK & 3D SINK ANIMATION
  // Head-to-toe physical card stacking + 3D perspective fly-away
  // Inspired by mananrajkhowa.vercel.app:
  // - Pinning offset: $ = Math.max((windowHeight - cardHeight) / 2, 60)
  // - Top tab stack distance: 18px per card
  // - Base scale: 0.92, scale step: 0.015 per card
  // - When stacked (m > ne): 3D perspective fly-away (translateZ: 0 -> -3000px, scale: 1 -> 0, opacity: 1 -> 0)
  // - Strict clamping so cards NEVER bleed or overlap the white #about section
  // ==========================================
  const scrollCards = Array.from(document.querySelectorAll('.scroll-stack-card'));
  const perspectiveContainer = document.getElementById('scroll-stack-inner');
  const voidContainer = document.getElementById('void-container');
  const stackEnd = document.getElementById('scroll-stack-end');
  const kineticWheel = document.getElementById('kinetic-wheel');
  const aboutSection = document.getElementById('about');

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

    // Set initial layout properties
    scrollCards.forEach((c, idx) => {
      if (idx < scrollCards.length - 1) {
        c.style.marginBottom = `${sr.itemDistance}px`;
      } else {
        c.style.marginBottom = '0px';
      }
      c.style.willChange = 'transform';
      c.style.transformOrigin = 'top center';
    });

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
      const scrollY = window.scrollY;
      cardTops = scrollCards.map(c => c.getBoundingClientRect().top + scrollY);
      endTop = stackEnd ? (stackEnd.getBoundingClientRect().top + scrollY) : 0;
      perspectiveTop = perspectiveContainer ? (perspectiveContainer.getBoundingClientRect().top + scrollY) : 0;
      isCalculating = false;
    };

    measureCardPositions();

    const updateCardStack = (currentScrollY) => {
      if (isCalculating || !cardTops.length) return;
      const m = typeof currentScrollY === 'number' ? currentScrollY : window.scrollY;
      const L = window.innerHeight;
      const isMobile = window.innerWidth < 1024;
      const j = scrollCards[0].offsetHeight;
      const $ = Math.max((L - j) / 2, 60);
      const U = -(sr.stackPosition - sr.scaleEndPosition) * L;
      const ne = cardTops[scrollCards.length - 1] - U;
      const K = L * 3.0;

      // Position of #about relative to viewport
      const aboutRectTop = aboutSection ? aboutSection.getBoundingClientRect().top : 99999;

      let I = 0;
      if (m > ne) {
        I = (m - ne) / K;
        I = Math.min(Math.max(I, 0), 1);
      }

      // 1. Individual card translation & progressive scale (subpixel smooth)
      for (let X = 0; X < scrollCards.length; X++) {
        const card = scrollCards[X];
        const cardTop = cardTops[X];
        const me = cardTop - $ - (sr.itemStackDistance * X);
        const Z = cardTop - U;
        const xe = me;
        const ee = Math.max(endTop - L * 0.5, ne + K);

        let Fe = 0;
        if (m >= Z) {
          Fe = 1;
        } else if (m > me) {
          Fe = (m - me) / (Z - me);
        }
        Fe = Math.min(Math.max(Fe, 0), 1);

        const targetScale = sr.baseScale + (X * sr.itemScale);
        const scale = Number((1 - Fe * (1 - targetScale)).toFixed(4));

        let translateY = 0;
        if (m >= xe && m <= ee) {
          translateY = m - cardTop + $ + (sr.itemStackDistance * X);
        } else if (m > ee) {
          translateY = ee - cardTop + $ + (sr.itemStackDistance * X);
        }

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale})`;
      }

      // 2. 3D Scroll Perspective Animation on Void Container
      if (voidContainer && perspectiveContainer) {
        const X = m + L / 2 - perspectiveTop;
        perspectiveContainer.style.perspectiveOrigin = `50% ${X.toFixed(1)}px`;
        perspectiveContainer.style.perspective = '1500px';

        if (I > 0) {
          if (isMobile) {
            const Q = Math.min(I / 0.25, 1);
            const ae = 1 - Q;
            voidContainer.style.transformOrigin = `50% ${X.toFixed(1)}px`;
            voidContainer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            voidContainer.style.opacity = Math.max(0, ae).toFixed(3);
            if (Q >= 1 || aboutRectTop <= L * 0.85) {
              voidContainer.style.visibility = 'hidden';
              voidContainer.style.opacity = '0';
              voidContainer.style.pointerEvents = 'none';
            } else {
              voidContainer.style.visibility = 'visible';
              voidContainer.style.pointerEvents = 'auto';
            }
          } else {
            // Desktop 3D fly-away sink into the void
            const Q = Math.pow(I, 1.4);
            const ae = -Q * 3200;
            const me = 1 - (Q * 0.85);
            const Z = 1 - Math.pow(I, 2.0);
            voidContainer.style.transformOrigin = `50% ${X.toFixed(1)}px`;
            voidContainer.style.transform = `translate3d(0, 0, ${ae.toFixed(2)}px) scale(${Math.max(0, me).toFixed(4)})`;
            voidContainer.style.opacity = Math.max(0, Z).toFixed(3);
            if (I >= 0.98 || aboutRectTop <= L * 0.85) {
              voidContainer.style.visibility = 'hidden';
              voidContainer.style.opacity = '0';
              voidContainer.style.pointerEvents = 'none';
            } else {
              voidContainer.style.visibility = 'visible';
              voidContainer.style.pointerEvents = 'auto';
            }
          }
        } else {
          voidContainer.style.transformOrigin = '';
          voidContainer.style.transform = '';
          voidContainer.style.opacity = '1';
          voidContainer.style.visibility = 'visible';
          voidContainer.style.pointerEvents = 'auto';
        }
      }

      // 3. Kinetic Arc Wheel (Bigger 140vw Radius & Lasting Long)
      if (kineticWheel) {
        if (m > endTop + L * 3.0 + L * 0.2 || aboutRectTop <= 0) {
          kineticWheel.style.display = 'none';
          kineticWheel.style.visibility = 'hidden';
        } else if (I > 0) {
          kineticWheel.style.display = 'block';
          kineticWheel.style.visibility = 'visible';
          if (isMobile) {
            let wheelOpacity = 0;
            if (I <= 0.2) wheelOpacity = I / 0.2;
            else if (I <= 0.85) wheelOpacity = 1;
            else wheelOpacity = Math.max(0, 1 - (I - 0.85) / 0.15);
            kineticWheel.style.opacity = wheelOpacity.toFixed(3);
            kineticWheel.style.transform = 'translate3d(0, 0, 0)';
          } else {
            // Bright white letters lasting solidly throughout the scroll travel
            let wheelOpacity = 1;
            if (I < 0.15) {
              wheelOpacity = I / 0.15;
            } else if (I > 0.85) {
              wheelOpacity = Math.max(0, 1 - (I - 0.85) / 0.15);
            }
            kineticWheel.style.opacity = wheelOpacity.toFixed(3);
            const rot = 180 * (1 - I);
            kineticWheel.style.transformOrigin = '50% 100%';
            kineticWheel.style.transform = `rotate(${rot.toFixed(2)}deg)`;
          }
        } else {
          kineticWheel.style.display = 'block';
          kineticWheel.style.opacity = '0';
          kineticWheel.style.visibility = 'hidden';
          if (isMobile) {
            kineticWheel.style.transform = 'translate3d(0, 0, 0)';
          } else {
            kineticWheel.style.transform = 'rotate(180deg)';
          }
        }
      }
    };

    let stackTicking = false;
    const requestStackUpdate = () => {
      if (!stackTicking) {
        requestAnimationFrame(() => {
          updateCardStack();
          stackTicking = false;
        });
        stackTicking = true;
      }
    };

    // Synchronize both Lenis smooth scrolling and native window scroll
    if (lenis) {
      lenis.on('scroll', (e) => {
        const sy = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
        updateCardStack(sy);
        if (typeof updateFooterTransform === 'function') updateFooterTransform(sy);
      });
    }

    window.addEventListener('scroll', requestStackUpdate, { passive: true });
    window.addEventListener('resize', () => {
      measureCardPositions();
      requestStackUpdate();
    });
    window.addEventListener('load', () => {
      measureCardPositions();
      requestStackUpdate();
    });

    const resizeObserver = new ResizeObserver(() => {
      measureCardPositions();
      requestStackUpdate();
    });
    scrollCards.forEach(c => resizeObserver.observe(c));

    // Interactive card modal triggers
    const projectKeys = ['supreme', 'branding', 'ai', 'creative'];
    scrollCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        openModal(projectKeys[idx]);
      });
    });

    updateCardStack();
  }

});
