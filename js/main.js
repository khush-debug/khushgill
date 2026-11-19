/**
 * Khushman Gill — Portfolio Interactive Controller
 * Features:
 * - Kinetic Text Scramble Rotator (< BUSINESS STRATEGIST />, etc.)
 * - 3D Perspective Card Tilt
 * - Interactive macOS Folder Case Study Modal
 * - Web Audio Haptic Clicks
 * - Dynamic Headshot Customizer with localStorage persistence
 * - 1-Click Clipboard Email Copy with Toast
 * - Ambient Spotlight Tracking & ScrollSpy
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. WEB AUDIO SYNTHESIZER (Haptic UI Sounds)
  // ==========================================
  let audioCtx = null;
  let soundEnabled = false;

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

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio fallback silent
    }
  };

  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        initAudio();
        soundIconOn.classList.remove('hidden');
        soundIconOff.classList.add('hidden');
        showToast('Sound effects enabled');
        playClickSound(1000);
      } else {
        soundIconOn.classList.add('hidden');
        soundIconOff.classList.remove('hidden');
        showToast('Sound effects muted');
      }
    });
  }

  // Bind subtle click to all buttons and links
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => playClickSound(1200, 'triangle'));
    el.addEventListener('click', () => playClickSound(600, 'sine'));
  });


  // ==========================================
  // 2. KINETIC TEXT SCRAMBLE ROTATOR
  // ==========================================
  const scrambleHeading = document.getElementById('scramble-heading');
  const titles = [
    'BUSINESS STRATEGIST',
    'CREATIVE TECHNOLOGIST',
    'COMMERCIAL BUILDER',
    'E-COMMERCE ARCHITECT'
  ];
  let titleIndex = 0;
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  function scrambleText(targetText, callback) {
    if (!scrambleHeading) return;
    let iteration = 0;
    const interval = setInterval(() => {
      scrambleHeading.innerText = targetText
        .split('')
        .map((letter, idx) => {
          if (idx < iteration) {
            return targetText[idx];
          }
          if (letter === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= targetText.length) {
        clearInterval(interval);
        if (callback) callback();
      }
      iteration += 1 / 2;
    }, 30);
  }

  // Rotate every 4 seconds
  setInterval(() => {
    titleIndex = (titleIndex + 1) % titles.length;
    scrambleText(titles[titleIndex]);
  }, 4200);


  // ==========================================
  // 3. 3D PERSPECTIVE CARD TILT
  // ==========================================
  const portraitCard = document.getElementById('portrait-card');
  if (portraitCard) {
    const handleTilt = (e) => {
      const rect = portraitCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      portraitCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const resetTilt = () => {
      portraitCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    portraitCard.addEventListener('mousemove', handleTilt);
    portraitCard.addEventListener('mouseleave', resetTilt);
  }


  // ==========================================
  // 4. PHOTO SWAP & LOCALSTORAGE PERSISTENCE
  // ==========================================
  const userHeadshot = document.getElementById('user-headshot');
  const photoUploadInput = document.getElementById('photo-upload-input');

  // Load saved custom photo if explicitly uploaded by user
  const savedPhoto = localStorage.getItem('khushman_avatar_custom');
  if (savedPhoto && userHeadshot) {
    userHeadshot.src = savedPhoto;
  }

  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (userHeadshot) {
            userHeadshot.src = dataUrl;
            try {
              localStorage.setItem('khushman_avatar_custom', dataUrl);
              showToast('Photo customized & saved!');
            } catch (err) {
              showToast('Photo updated!');
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }


  // ==========================================
  // 5. CASE STUDY DATA & MODAL CONTROLLER
  // ==========================================
  const projectDetails = {
    lally: {
      title: 'Lally Computers',
      subtitle: 'Full-Stack Computer Hardware & Retail Web Platform',
      badge: '● Live Production',
      date: '2024 — Present',
      link: 'https://lallycomputers.vercel.app/',
      linkText: 'Visit Live Website ↗',
      body: `
        <p><strong>Executive Summary:</strong> Architected, built, and deployed an end-to-end commercial website for Lally Computers, a technology and computing retail enterprise.</p>
        <p><strong>The Objective:</strong> Create a polished, responsive digital storefront that organizes hundreds of technical hardware specifications, laptops, custom gaming rigs, and components into an effortless customer browsing experience.</p>
        <p><strong>Key Engineering & Strategic Deliverables:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Engineered clean, responsive UI layouts optimized for mobile, tablet, and desktop shoppers.</li>
          <li>Structured intuitive hardware categories (Laptops, Desktops, Components, Accessories) to drive customer inquiry volume.</li>
          <li>Deployed to Vercel with automated CI/CD pipeline, achieving near-instant load speeds and 99.9% uptime.</li>
          <li>Significantly streamlined direct customer communication and reduced showroom friction.</li>
        </ul>
      `,
      chips: ['Next.js / React', 'Tailwind CSS', 'Vercel Cloud Deployment', 'E-Commerce Architecture', 'Product Presentation', 'Responsive UX']
    },
    branding: {
      title: 'Brand Strategy & E-Commerce Venture Hub',
      subtitle: 'Commercial Brand Identity, Go-To-Market & Scalable Systems',
      badge: 'Commercial Venture',
      date: '2024',
      link: 'https://github.com/khush-debug',
      linkText: 'View GitHub Repos ↗',
      body: `
        <p><strong>Executive Summary:</strong> Comprehensive brand design system, commercial positioning models, and digital go-to-market architecture developed for scalable consumer ventures.</p>
        <p><strong>Strategy & Methodology:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Formulated unified brand visual identity guidelines including typography hierarchies, color psychology tokens, and logo geometry.</li>
          <li>Modeled digital storefront conversion funnels tailored to maximize customer retention and basket value.</li>
          <li>Analyzed commercial unit economics, customer acquisition cost (CAC) drivers, and positioning against market incumbents.</li>
        </ul>
      `,
      chips: ['Brand Identity Systems', 'Commercial Sales Strategy', 'Unit Economics', 'Digital Marketing', 'Creative Direction']
    },
    ai: {
      title: 'Applied AI & Operations Automation Hub',
      subtitle: 'Generative AI Pipelines & Intelligent Business Workflows',
      badge: 'Applied AI Solutions',
      date: '2024',
      link: 'https://github.com/khush-debug',
      linkText: 'Explore Repos ↗',
      body: `
        <p><strong>Executive Summary:</strong> Designed and deployed intelligent automation routines utilizing modern Large Language Models (LLMs) and generative tooling to eliminate redundant administrative drag.</p>
        <p><strong>Implementation Highlights:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Developed structured multi-turn prompt architectures for customer inquiry triage and automated proposal generation.</li>
          <li>Implemented automated market data summarization pipelines for rapid competitive intelligence gathering.</li>
          <li>Integrated AI image and visual composition tools into rapid prototyping workflows.</li>
        </ul>
      `,
      chips: ['Prompt Engineering', 'Generative AI Tooling', 'Workflow Automation', 'Operational Efficiency', 'AI Product Strategy']
    },
    arts: {
      title: 'Creative Arts & Visual Disciplines Studio',
      subtitle: 'Traditional Sketching, Canvas Painting & Visual Precision',
      badge: 'Fine Arts Portfolio',
      date: 'Continuous Mastery',
      link: '#contact',
      linkText: 'Inquire on Creative Work ↗',
      body: `
        <p><strong>Discipline & Foundation:</strong> Rigorous background in traditional sketching, charcoal work, and painting. This artistic discipline underpins Khushman's sharp intuition for digital aesthetics, spatial balance, and visual hierarchy.</p>
        <p><strong>Creative Core:</strong></p>
        <ul class="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>Extensive portfolio of fine hand sketches, portraiture studies, and expressive paintings.</li>
          <li>Application of traditional fine art principles (chiaroscuro, proportion, negative space) to modern digital interfaces and software design systems.</li>
          <li>Passionate exploration of digital artwork and multimedia visual storytelling.</li>
        </ul>
      `,
      chips: ['Traditional Sketching', 'Acrylic & Canvas Painting', 'Visual Hierarchy', 'Color Theory', 'Aesthetic Direction']
    }
  };

  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBadge = document.getElementById('modal-badge');
  const modalDate = document.getElementById('modal-date');
  const modalBody = document.getElementById('modal-body');
  const modalChips = document.getElementById('modal-chips');
  const modalLinkBtn = document.getElementById('modal-link-btn');

  function openProjectModal(projectId) {
    const data = projectDetails[projectId];
    if (!data || !projectModal) return;

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalBadge.textContent = data.badge;
    modalDate.textContent = data.date;
    modalBody.innerHTML = data.body;

    modalChips.innerHTML = '';
    data.chips.forEach(chipText => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = chipText;
      modalChips.appendChild(chip);
    });

    modalLinkBtn.href = data.link;
    modalLinkBtn.innerHTML = `<span>${data.linkText}</span>`;

    projectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    playClickSound(900);
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.add('hidden');
    document.body.style.overflow = '';
    playClickSound(400);
  }

  // Attach modal trigger to folder cards
  document.querySelectorAll('.folder-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't intercept direct live link click
      if (e.target.closest('a[target="_blank"]')) return;
      const projectId = card.dataset.project;
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && !projectModal.classList.contains('hidden')) {
      closeProjectModal();
    }
  });


  // ==========================================
  // 6. CLIPBOARD COPY EMAIL & TOAST
  // ==========================================
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailAddressEl = document.getElementById('email-address');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimeout = null;

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 2800);
  }

  if (copyEmailBtn && emailAddressEl) {
    copyEmailBtn.addEventListener('click', () => {
      const email = emailAddressEl.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard!');
        playClickSound(1000);
      }).catch(() => {
        showToast(`Copied: ${email}`);
      });
    });
  }


  // ==========================================
  // 7. AMBIENT MOUSE SPOTLIGHT FOLLOWER
  // ==========================================
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });


  // ==========================================
  // 8. SCROLLSPY & FLOATING NAV ACTIVE STATE
  // ==========================================
  const sections = document.querySelectorAll('section, footer');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });


  // ==========================================
  // 9. MOBILE MENU CONTROLLER
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      playClickSound(800);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }


  // ==========================================
  // 10. SCROLL-DRIVEN ANIMATIONS & BI-DIRECTIONAL REVEAL SYSTEM
  // Inspired by perspective-tunnel-hero: continuous motion responding
  // both when scrolling DOWN and scrolling back UP
  // ==========================================
  const scrollProgressBar = document.getElementById('scroll-progress');
  const mainHeader = document.querySelector('header');
  const parallaxCards = document.querySelectorAll('.folder-card, .stack-card, .milestone-card');
  const expSection = document.getElementById('experience');
  const timelinePath = document.querySelector('.timeline-path-draw');
  let ticking = false;

  // Real-time continuous scroll physics loop
  const onScrollFrame = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const vh = window.innerHeight;
    const vCenter = vh / 2;

    // 1. Top Progress Bar
    if (scrollProgressBar) {
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgressBar.style.width = `${progress}%`;
    }

    // 2. Header backdrop elevation
    if (mainHeader) {
      if (scrollTop > 40) {
        mainHeader.classList.add('is-scrolled');
      } else {
        mainHeader.classList.remove('is-scrolled');
      }
    }

    // 3. 3D Spatial Parallax on cards (reacts smoothly scrolling down AND scrolling up)
    parallaxCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < vh + 100) {
        const cardCenter = rect.top + rect.height / 2;
        const normalized = (cardCenter - vCenter) / vCenter; // -1 to +1
        const clamped = Math.max(-1, Math.min(1, normalized));
        const rotateX = clamped * -4; // Subtle 3D tilt
        const translateY = clamped * 10; // Depth parallax
        card.style.setProperty('--scroll-rx', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--scroll-ty', `${translateY.toFixed(1)}px`);
      }
    });

    // 4. Bi-directional Bezier timeline scrub (draws down, undraws up)
    if (expSection && timelinePath) {
      const rect = expSection.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.6)));
      const strokeOffset = 1200 * (1 - progress);
      timelinePath.style.strokeDashoffset = `${strokeOffset.toFixed(1)}`;
    }

    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  onScrollFrame();

  // Bi-directional IntersectionObserver (triggers enter when in view, resets when out)
  const revealElements = document.querySelectorAll('.reveal, .node-pulse');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Reset when element leaves the viewport so scrolling back re-triggers fluidly
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '20px 0px 20px 0px',
      threshold: 0.08
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Graceful fallback for older environments
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

});
