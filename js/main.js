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
  // 2. KINETIC TEXT SCRAMBLE ROTATOR (ZERO-SHAKE)
  // ==========================================
  const scrambleHeading = document.getElementById('scramble-heading');
  const titles = [
    'BUSINESS STRATEGIST',
    'CREATIVE TECHNOLOGIST',
    'COMMERCIAL BUILDER',
    'E-COMMERCE ARCHITECT'
  ];
  let titleIndex = 0;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#%&*';

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
  // 3. PHOTO 3D TILT & MINIMAL CLEAN SCROLL-UP SPIN + ZOOM-OUT PHYSICS
  // ==========================================
  const portraitCard = document.getElementById('portrait-card');
  const portraitBackglow = document.getElementById('portrait-backglow');
  
  let spinTorque = 0;
  let spinAngleY = 0;
  let photoScale = 1.0;
  let isMouseOverPortrait = false;
  let mouseTiltX = 0;
  let mouseTiltY = 0;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop;

  // Track upward scroll to trigger minimal, clean 3D spin and zoom out
  const triggerScrollUpSpin = (velocity) => {
    // Subtle, elegant velocity clamp
    const clampedVelocity = Math.min(25, Math.max(2, velocity));
    // Minimal spin torque: subtle micro-rotation (up to ~10-14 degrees max)
    spinTorque = Math.min(6, spinTorque + clampedVelocity * 0.22);
    // Minimal clean zoom out: slight scale down to ~0.95 (effortless & non-distracting)
    photoScale = Math.max(0.95, photoScale - (clampedVelocity * 0.0018));
    
    if (portraitCard) {
      portraitCard.classList.add('is-spinning-up');
    }
  };

  // Wheel detection (immediate response on trackpad / mousewheel scroll up)
  window.addEventListener('wheel', (e) => {
    if (e.deltaY < -2) {
      triggerScrollUpSpin(Math.abs(e.deltaY) * 0.25);
    }
  }, { passive: true });

  // Scroll detection (works with momentum scroll, keys, and touch swipe up)
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    const deltaY = currentScrollY - lastScrollY;
    if (deltaY < -2) {
      triggerScrollUpSpin(Math.abs(deltaY) * 0.5);
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Mobile Touch detection (swiping down to move towards top triggers minimal clean spin on mobile)
  let touchStartClientY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartClientY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const currentY = e.touches[0].clientY;
      const deltaTouch = currentY - touchStartClientY;
      // When dragging downwards (page scrolls UP):
      if (deltaTouch > 4) {
        triggerScrollUpSpin(deltaTouch * 0.35);
      }
      touchStartClientY = currentY;
    }
  }, { passive: true });

  // Physics animation loop for smooth deceleration and spring recovery
  function updatePortraitPhysics() {
    if (portraitCard) {
      if (spinTorque > 0.05 || Math.abs(photoScale - 1.0) > 0.001 || Math.abs(spinAngleY) > 0.15) {
        // Accumulate subtle spin rotation
        spinAngleY += spinTorque;
        // Smooth deceleration friction
        spinTorque *= 0.88;
        // Spring scale smoothly back to 1.0
        photoScale += (1.0 - photoScale) * 0.09;

        // Smoothly settle spin angle cleanly back to 0
        if (spinTorque < 0.1) {
          spinAngleY += (0 - spinAngleY) * 0.14;
          if (Math.abs(spinAngleY) < 0.2) {
            spinAngleY = 0;
            spinTorque = 0;
            if (portraitCard) portraitCard.classList.remove('is-spinning-up');
          }
        }

        portraitCard.style.transform = `perspective(1000px) rotateY(${spinAngleY.toFixed(1)}deg) rotateZ(${(spinAngleY * 0.03).toFixed(1)}deg) scale(${photoScale.toFixed(3)})`;

        if (portraitBackglow) {
          const glowOpacity = Math.min(0.7, 0.4 + (spinTorque * 0.03));
          portraitBackglow.style.opacity = glowOpacity.toFixed(2);
        }
      } else if (isMouseOverPortrait) {
        // Interactive 3D mouse tilt while hovering at rest
        portraitCard.style.transform = `perspective(1000px) rotateX(${mouseTiltX.toFixed(1)}deg) rotateY(${mouseTiltY.toFixed(1)}deg) scale(1.02)`;
        if (portraitBackglow) {
          portraitBackglow.style.opacity = '0.6';
        }
      } else {
        // Resting neutral state
        portraitCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        if (portraitBackglow) {
          portraitBackglow.style.opacity = '0.45';
        }
      }
    }
    requestAnimationFrame(updatePortraitPhysics);
  }
  requestAnimationFrame(updatePortraitPhysics);

  // Mouse tilt on portrait card
  if (portraitCard) {
    portraitCard.addEventListener('mousemove', (e) => {
      isMouseOverPortrait = true;
      const rect = portraitCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      mouseTiltX = ((y - centerY) / centerY) * -12;
      mouseTiltY = ((x - centerX) / centerX) * 12;
    });

    portraitCard.addEventListener('mouseleave', () => {
      isMouseOverPortrait = false;
      mouseTiltX = 0;
      mouseTiltY = 0;
    });
  }


  // ==========================================
  // 3b. CRAZY INTERACTIVE TECH STACK 3D CARDS & CHIP SOUNDS
  // ==========================================
  const stackCards = document.querySelectorAll('.stack-card');
  stackCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-8px) scale(1.03)`;
      card.style.setProperty('--sheen-x', `${((x / rect.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--sheen-y', `${((y / rect.height) * 100).toFixed(1)}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Micro-interaction sound on hovering any tech chip
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('mouseenter', () => {
      if (typeof playClickSound === 'function') {
        playClickSound(1400 + Math.random() * 400, 'triangle');
      }
    });
  });


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
  // 10. TIMELINE STATE & INTERACTIVE CONTROLLERS
  // (Declared first to eliminate any Temporal Dead Zone errors)
  // ==========================================
  const milestoneCards = document.querySelectorAll('.milestone-card');
  const timelineNodes = document.querySelectorAll('.timeline-node');
  const timelineTracer = document.getElementById('timeline-tracer');
  const timelineTracerHalo = document.getElementById('timeline-tracer-halo');
  const expTimelinePath = document.getElementById('experience-timeline-path');
  const expSection = document.getElementById('experience');

  const nodePositions = [
    { x: 50, y: 60, progress: 0.08 },
    { x: 340, y: 38, progress: 0.38 },
    { x: 600, y: 82, progress: 0.68 },
    { x: 950, y: 60, progress: 1.0 }
  ];

  let currentActiveMilestone = 0;
  let isUserInteracting = false;
  let userInteractionTimeout = null;

  function setTimelineActiveMilestone(index, sound = true) {
    if (index < 0 || index >= nodePositions.length) return;
    currentActiveMilestone = index;
    const target = nodePositions[index];

    // Move glowing tracer orb along SVG curve
    if (timelineTracer) {
      timelineTracer.setAttribute('cx', target.x);
      timelineTracer.setAttribute('cy', target.y);
      timelineTracer.classList.remove('opacity-0');
      timelineTracer.classList.add('opacity-100');
    }
    if (timelineTracerHalo) {
      timelineTracerHalo.setAttribute('cx', target.x);
      timelineTracerHalo.setAttribute('cy', target.y);
      timelineTracerHalo.classList.remove('opacity-0');
      timelineTracerHalo.classList.add('opacity-30');
    }

    // Animate glowing line progress to that node
    if (expTimelinePath) {
      try {
        const totalLength = expTimelinePath.getTotalLength ? expTimelinePath.getTotalLength() : 1000;
        const strokeOffset = totalLength * (1 - target.progress);
        expTimelinePath.style.strokeDashoffset = `${strokeOffset.toFixed(1)}`;
      } catch (err) {}
    }

    // Update active node in SVG
    timelineNodes.forEach((node, i) => {
      if (i === index) {
        node.classList.add('is-active');
      } else {
        node.classList.remove('is-active');
      }
    });

    // Update active card below
    milestoneCards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-active-milestone');
      } else {
        card.classList.remove('is-active-milestone');
      }
    });

    if (sound && typeof playClickSound === 'function') {
      playClickSound(480 + index * 120, 'triangle');
    }
  }

  // Bind hover and click interactions on milestone cards/folders below
  milestoneCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      isUserInteracting = true;
      clearTimeout(userInteractionTimeout);
      setTimelineActiveMilestone(index, true);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(userInteractionTimeout);
      userInteractionTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 1800);
    });

    card.addEventListener('click', () => {
      isUserInteracting = true;
      clearTimeout(userInteractionTimeout);
      setTimelineActiveMilestone(index, true);
      userInteractionTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 3500);
    });
  });

  // Bind hover and click interactions directly on the SVG timeline nodes
  timelineNodes.forEach((node, index) => {
    node.addEventListener('mouseenter', () => {
      isUserInteracting = true;
      clearTimeout(userInteractionTimeout);
      setTimelineActiveMilestone(index, true);
    });

    node.addEventListener('mouseleave', () => {
      clearTimeout(userInteractionTimeout);
      userInteractionTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 1800);
    });

    node.addEventListener('click', () => {
      isUserInteracting = true;
      clearTimeout(userInteractionTimeout);
      setTimelineActiveMilestone(index, true);
    });
  });

  // Default active milestone on initial load
  setTimelineActiveMilestone(0, false);


  // ==========================================
  // 11. SCROLL-DRIVEN ANIMATIONS & PHYSICS LOOP
  // ==========================================
  const scrollProgressBar = document.getElementById('scroll-progress');
  const mainHeader = document.querySelector('header');
  const parallaxCards = document.querySelectorAll('.folder-card, .stack-card, .milestone-card');
  const orb1 = document.getElementById('ambient-orb-1');
  const orb2 = document.getElementById('ambient-orb-2');
  let ticking = false;

  const onScrollFrame = () => {
    try {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const vh = window.innerHeight;
      const vCenter = vh * 0.5;

      // 1. Top Progress Bar
      if (scrollProgressBar) {
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgressBar.style.width = `${progress}%`;
      }

      // 2. Header backdrop elevation
      if (mainHeader) {
        if (scrollTop > 30) {
          mainHeader.classList.add('is-scrolled');
        } else {
          mainHeader.classList.remove('is-scrolled');
        }
      }

      // 3. Ambient Flowing Background Orbs (soft, GPU-accelerated drift)
      if (orb1) {
        orb1.style.transform = `translate3d(${scrollTop * 0.04}px, ${scrollTop * 0.08}px, 0)`;
      }
      if (orb2) {
        orb2.style.transform = `translate3d(${-scrollTop * 0.03}px, ${-scrollTop * 0.06}px, 0)`;
      }

      // 4. Subtle, buttery smooth floating depth on cards (optimized for laptop trackpads)
      parallaxCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < vh) {
          const normalized = (rect.top + rect.height * 0.5 - vCenter) / vCenter;
          const clamped = Math.max(-1, Math.min(1, normalized));
          const translateY = clamped * 6; // feather-light 6px glide
          card.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        }
      });

      // 5. Experience Section: Line animated while scrolling/viewing/selecting on the folders below
      if (expSection && !isUserInteracting) {
        const rect = expSection.getBoundingClientRect();
        const rawProgress = (vh - rect.top) / (vh + rect.height * 0.7);
        const p = Math.min(1, Math.max(0, rawProgress));

        // Continuous morphing wavy-to-normal line on scroll:
        // Starts bold (5px) and wavy; settles into clean (2.5px) trajectory curve
        if (expTimelinePath) {
          const extraWave = (1 - p) * 25; // Gentle, smooth wave to normal
          const tlStroke = 2.5 + (1 - p) * 2.5; // Smooth stroke transition
          const yC1 = 110 + extraWave;
          const yC2 = 20 - extraWave;
          const yC3 = 100 + extraWave;
          const yC4 = 20 - extraWave;
          const tlPathD = `M 50 60 C 200 ${yC1.toFixed(1)}, 300 ${yC2.toFixed(1)}, 480 60 C 660 ${yC3.toFixed(1)}, 780 ${yC4.toFixed(1)}, 950 60`;

          expTimelinePath.setAttribute('d', tlPathD);
          expTimelinePath.setAttribute('stroke-width', tlStroke.toFixed(1));
        }

        // Automatically advance active milestone (0 -> 1 -> 2 -> 3) based on which card is being viewed
        if (p > 0.08) {
          const activeIdx = Math.min(3, Math.max(0, Math.floor((p - 0.08) / 0.22)));
          if (activeIdx !== currentActiveMilestone) {
            setTimelineActiveMilestone(activeIdx, false);
          }
        }
      }
    } catch (err) {
      console.warn('Scroll frame error suppressed:', err);
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


  // ==========================================
  // 12. ROCK-SOLID REVEAL SYSTEM
  // Elements animate in quickly and STAY visible permanently
  // Zero black screens, guaranteed failsafe
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal, .node-pulse');

  function makeVisible(el) {
    el.classList.add('is-visible');
  }

  // 1. Immediately mark all elements on or near initial screen as visible
  const initialVh = window.innerHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < initialVh * 1.25) {
      makeVisible(el);
    }
  });

  // 2. IntersectionObserver for elements as they enter viewport
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          makeVisible(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '100px 0px 100px 0px',
      threshold: 0.01
    });

    revealElements.forEach(el => {
      if (!el.classList.contains('is-visible')) {
        revealObserver.observe(el);
      }
    });
  } else {
    revealElements.forEach(makeVisible);
  }

  // 3. Failsafe safety fallback: Guarantee every element is 100% visible after 1 second
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(makeVisible);
  }, 1000);


  // ==========================================
  // 13. FLOW ART / STORY SCROLL SYSTEM (GSAP ScrollTrigger)
  // Applied to all sections EXCEPT Experience (#experience)
  // Zero screen-shaking, buttery smooth rotational scroll entrance
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        const isMobile = window.innerWidth < 768;
        const rotationAngle = isMobile ? 6 : 12;
        const scrubRate = isMobile ? 0.35 : 0.6;

        const flowSections = Array.from(
          document.querySelectorAll('section[data-flow-section], footer[data-flow-section]')
        );

        flowSections.forEach((section, i) => {
          section.style.zIndex = i + 1;
          const inner = section.querySelector('.flow-art-container');
          if (!inner) return;

          if (i > 0) {
            gsap.set(inner, { rotation: rotationAngle, transformOrigin: 'bottom left' });
            gsap.to(inner, {
              rotation: 0,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: isMobile ? 'top 10%' : 'top 15%',
                scrub: scrubRate,
              },
            });
          }
        });

        ScrollTrigger.refresh();
      }
    } catch (err) {
      console.warn('FlowArt ScrollTrigger suppressed:', err);
    }
  }

});
