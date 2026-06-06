/**
 * SHRUTI AGARWAL — PORTFOLIO SCRIPT
 * Handles: Theme toggle, Navbar scroll, Mobile menu,
 *          Active nav link, Intersection Observer animations,
 *          Back-to-top, Contact form, Smooth scroll
 * Scroll-snap container: body (CSS scroll-snap-type: y mandatory)
 * Hover-reveal animations: pure CSS :hover only (no JS class toggling)
 */
'use strict';
/* ----------------------------------------------------------------
   CONFIGURATION
   ---------------------------------------------------------------- */
const CONFIG = {
  navScrollThreshold: 50,
  backTopThreshold: 400,
  toastDuration: 4000,
  sectionOffset: 80,          // navbar height
  animationThreshold: 0.15,
};
/**
 * getScrollY — returns the current vertical scroll position.
 */
function getScrollY() {
  return window.scrollY || 0;
}
/* ----------------------------------------------------------------
   DOM CACHE
   ---------------------------------------------------------------- */
const DOM = {
  html: document.documentElement,
  navbar: document.getElementById('navbar'),
  themeToggle: document.getElementById('theme-toggle'),
  hamburger: document.getElementById('hamburger'),
  navLinks: document.getElementById('nav-links'),
  navLinkItems: document.querySelectorAll('.nav-link'),
  backToTop: document.getElementById('back-to-top'),
  contactForm: document.getElementById('contact-form'),
  formStatus: document.getElementById('form-status'),
  sections: document.querySelectorAll('section[id]'),
};
/* ================================================================
   1. THEME MANAGEMENT
   ================================================================ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'shruti-portfolio-theme';
  const DEFAULT_THEME = 'dark';
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return 'dark';
    // return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    DOM.html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    DOM.themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
  function toggle() {
    const current = DOM.html.getAttribute('data-theme') || DEFAULT_THEME;
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }
  function init() {
    applyTheme(getPreferredTheme());
    DOM.themeToggle.addEventListener('click', toggle);
  }
  return { init, toggle };
})();
/* ================================================================
   2. NAVBAR SCROLL EFFECT
   ================================================================ */
const NavbarManager = (() => {
  let lastScrollY = 0;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = getScrollY();
        DOM.navbar.classList.toggle('scrolled', scrollY > CONFIG.navScrollThreshold);
        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }
  return { init };
})();
/* ================================================================
   3. MOBILE MENU
   ================================================================ */
const MobileMenu = (() => {
  let isOpen = false;
  function open() {
    isOpen = true;
    DOM.navLinks.classList.add('open');
    DOM.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    isOpen = false;
    DOM.navLinks.classList.remove('open');
    DOM.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggle() {
    isOpen ? close() : open();
  }
  function init() {
    DOM.hamburger.addEventListener('click', toggle);
    // Close on nav link click
    DOM.navLinkItems.forEach(link => {
      link.addEventListener('click', close);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !DOM.navbar.contains(e.target)) close();
    });
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });
    // Close on resize to desktop
    const mq = window.matchMedia('(min-width: 769px)');
    mq.addEventListener('change', (e) => { if (e.matches && isOpen) close(); });
  }
  return { init, close };
})();
/* ================================================================
   4. ACTIVE NAV LINK (Scroll Spy)
   ================================================================ */
const ScrollSpy = (() => {
  function setActive(id) {
    DOM.navLinkItems.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${id}`);
    });
  }
  function onScroll() {
    const scrollY = getScrollY() + CONFIG.sectionOffset + 10;
    let current = '';
    DOM.sections.forEach(section => {
      const top = section.offsetTop;
      if (scrollY >= top) current = section.id;
    });
    if (current) setActive(current);
  }
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  return { init };
})();
/* ================================================================
   5. BACK TO TOP BUTTON
   ================================================================ */
const BackToTop = (() => {
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        DOM.backToTop.classList.toggle('visible', getScrollY() > CONFIG.backTopThreshold);
        ticking = false;
      });
      ticking = true;
    }
  }
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    DOM.backToTop.addEventListener('click', scrollToTop);
    onScroll();
  }
  return { init };
})();
/* ================================================================
   6. INTERSECTION OBSERVER — REVEAL ANIMATIONS
   ================================================================ */
const AnimationObserver = (() => {
  const ANIMATION_CLASSES = {
    'skills-grid .skill-category': 'fade-in-up',
    'projects-grid .project-card': 'fade-in-up',
    'certs-grid .cert-card': 'fade-in-up',
    'experience-grid .exp-card': 'fade-in-up',
    '.timeline-item': 'fade-in-left',
    '.about-bio': 'fade-in-up',
    '.about-card': 'fade-in-up',
    '.section-title': 'fade-in-up',
    '.section-subtitle': 'fade-in-up',
    '.contact-info': 'fade-in-up',
    '.contact-form': 'fade-in-up',
  };
  function observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.animationThreshold, rootMargin: '0px 0px -50px 0px' });
    Object.entries(ANIMATION_CLASSES).forEach(([selector, animClass]) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add(animClass);
        // stagger delay via inline style for more precise control
        el.style.transitionDelay = `${i * 0.1}s`;
        observer.observe(el);
      });
    });
  }
  function init() {
    if ('IntersectionObserver' in window) {
      // Slight delay to let layout settle
      requestAnimationFrame(() => observeElements());
    } else {
      // Fallback: show everything
      document.querySelectorAll('.fade-in-up, .fade-in-left').forEach(el => {
        el.classList.add('visible');
      });
    }
  }
  return { init };
})();
/* ================================================================
   7. CONTACT FORM
   ================================================================ */
const ContactForm = (() => {
  let submitTimeout = null;
  function showStatus(message, type) {
    if (!DOM.formStatus) return;
    DOM.formStatus.textContent = message;
    DOM.formStatus.className = `form-status ${type}`;
    clearTimeout(submitTimeout);
    submitTimeout = setTimeout(() => {
      DOM.formStatus.textContent = '';
      DOM.formStatus.className = 'form-status';
    }, CONFIG.toastDuration);
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  function validateForm(data) {
    if (!data.name.trim()) return 'Please enter your name.';
    if (!data.email.trim() || !validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.subject.trim()) return 'Please enter a subject.';
    if (!data.message.trim() || data.message.trim().length < 10) return 'Message must be at least 10 characters.';
    return null;
  }
  function handleSubmit(e) {
    e.preventDefault();
    const formData = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      subject: document.getElementById('contact-subject').value,
      message: document.getElementById('contact-message').value,
    };
    const error = validateForm(formData);
    if (error) {
      showStatus(error, 'error');
      return;
    }
    const submitBtn = document.getElementById('contact-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>&nbsp; Sending…';
    // Simulate form submission (replace with actual endpoint / EmailJS / Netlify forms)
    fetch('https://formspree.io/f/mykakvvv', {
  method: 'POST',
  body: new FormData(DOM.contactForm),
  headers: { 'Accept': 'application/json' }
})
.then(response => {
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i>&nbsp; Send Message';
  if (response.ok) {
    DOM.contactForm.reset();
    showStatus('✓ Message sent! Thank you — I\'ll get back to you soon.', 'success');
  } else {
    showStatus('❌ Something went wrong. Please try again.', 'error');
  }
})
.catch(() => {
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i>&nbsp; Send Message';
  showStatus('❌ Network error. Please try again.', 'error');
});
  }
  function init() {
    if (!DOM.contactForm) return;
    DOM.contactForm.addEventListener('submit', handleSubmit);
  }
  return { init };
})();
/* ================================================================
   8. SMOOTH SCROLL FOR ANCHOR LINKS
   ================================================================ */
const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.sectionOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
  return { init };
})();
/* ================================================================
   9. SKILL PILL HOVER RIPPLE (micro-interaction)
   ================================================================ */
const SkillRipple = (() => {
  function createRipple(e) {
    const pill = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = pill.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(108,71,255,0.25);
      transform:scale(0); pointer-events:none;
      animation:rippleOut 0.5s ease forwards;
    `;
    pill.style.position = 'relative';
    pill.style.overflow = 'hidden';
    pill.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }
  function init() {
    // Add ripple keyframe dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rippleOut {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', createRipple);
    });
  }
  return { init };
})();
/* ================================================================
   10. CURSOR GLOW (Desktop Only)
   ================================================================ */
const CursorGlow = (() => {
  let glowEl = null;
  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    glowEl = document.createElement('div');
    glowEl.id = 'cursor-glow';
    glowEl.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:400px; height:400px; border-radius:50%;
      background:radial-gradient(circle, rgba(108,71,255,0.06) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:left 0.12s ease, top 0.12s ease;
      will-change:left,top;
    `;
    document.body.appendChild(glowEl);
    document.addEventListener('mousemove', (e) => {
      if (!glowEl) return;
      glowEl.style.left = e.clientX + 'px';
      glowEl.style.top = e.clientY + 'px';
    });
  }
  return { init };
})();
/* ================================================================
   11. TYPED TEXT EFFECT (Hero Tagline Shimmer)
   ================================================================ */
const HeroShimmer = (() => {
  function init() {
    const heroBadge = document.getElementById('hero-badge');
    if (!heroBadge) return;
    // Periodically re-animate the pulsing dot
    setInterval(() => {
      const dot = heroBadge.querySelector('.badge-dot');
      if (dot) {
        dot.style.animation = 'none';
        void dot.offsetHeight; // force reflow
        dot.style.animation = '';
      }
    }, 5000);
  }
  return { init };
})();
/* ================================================================
   12. NAVBAR: Hide/Show on scroll direction (mobile)
   ================================================================ */
const NavAutoHide = (() => {
  let lastY = 0;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = getScrollY();
        const isMobile = window.innerWidth < 769;
        if (isMobile && currentY > 100) {
          // Scrolling down: hide; scrolling up: show
          DOM.navbar.style.transform = currentY > lastY
            ? 'translateY(-100%)'
            : 'translateY(0)';
        } else {
          DOM.navbar.style.transform = 'translateY(0)';
        }
        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }
  function init() {
    DOM.navbar.style.transition = [
      DOM.navbar.style.transition,
      'transform 0.3s ease'
    ].filter(Boolean).join(', ');
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  return { init };
})();
/* ================================================================
   INIT — Run all modules on DOMContentLoaded
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavbarManager.init();
  MobileMenu.init();
  ScrollSpy.init();
  BackToTop.init();
  AnimationObserver.init();
  ContactForm.init();
  SmoothScroll.init();
  SkillRipple.init();
  CursorGlow.init();
  HeroShimmer.init();
  NavAutoHide.init();
  // CardTouchHover removed: hover animations are CSS-only (:hover state)
  // Console signature
  console.log(
    '%c✨ Shruti Agarwal Portfolio%c\nBuilt with ❤️ using HTML5, CSS3 & Vanilla JS',
    'color:#6c47ff; font-size:1.2rem; font-weight:800;',
    'color:#9a9ab0; font-size:0.85rem;'
  );
});
/* ================================================================
   NETLIFY FORMS INTEGRATION NOTE
   ================================================================
   To use Netlify's built-in form handling:
   1. Add `netlify` attribute to <form>: <form ... netlify>
   2. Add a hidden input: <input type="hidden" name="form-name" value="contact">
   3. The form submission handler in ContactForm.handleSubmit()
      will need to use fetch() to POST to '/' with FormData.
   See: https://docs.netlify.com/forms/setup/
   ================================================================ */
