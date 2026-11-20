/**
 * Khushman Gill — Portfolio Interactive Controller (Editorial Edition)
 * Inspired by brutalist-luxury typography, interactive star-border physics,
 * fullscreen curtain navigation, and dynamic case study views.
 */

document.addEventListener('DOMContentLoaded', () => {

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
      playClickSound(950);
    }
  };

  const closeMenu = () => {
    if (fullscreenMenu) {
      fullscreenMenu.classList.remove('open');
      document.body.style.overflow = '';
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
    playClickSound(880);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
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
  // 8. 3D FLOW ART / ROTATIONAL SCROLL ANIMATION (GSAP)
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        const isMobile = window.innerWidth < 768;
        const rotationAngle = isMobile ? 5 : 8;
        const translateYDist = isMobile ? 30 : 60;
        const scrubRate = isMobile ? 0.35 : 0.6;

        const flowSections = Array.from(
          document.querySelectorAll('[data-flow-section]')
        );

        flowSections.forEach((section, i) => {
          section.style.zIndex = i + 1;
          const inner = section.querySelector('.flow-art-container');
          if (!inner) return;

          if (i > 0) {
            gsap.set(inner, {
              rotation: rotationAngle,
              y: translateYDist,
              transformOrigin: 'bottom left'
            });

            gsap.to(inner, {
              rotation: 0,
              y: 0,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: isMobile ? 'top 12%' : 'top 18%',
                scrub: scrubRate,
              },
            });
          }
        });

        // 3D Perspective Card Tilt on Mouse Move
        document.querySelectorAll('.star-border-container').forEach(card => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const tiltX = (y / (rect.height / 2)) * -4;
            const tiltY = (x / (rect.width / 2)) * 4;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
          });
        });

        ScrollTrigger.refresh();
        window.addEventListener('load', () => ScrollTrigger.refresh());
        window.addEventListener('resize', () => ScrollTrigger.refresh());
      }
    } catch (err) {
      console.warn('3D ScrollTrigger suppressed:', err);
    }
  }

});
