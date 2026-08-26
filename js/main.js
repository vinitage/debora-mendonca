/* main.js — Débora Mendonça */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs fn when the browser is idle (falls back to a short timeout on Safari,
// which lacks requestIdleCallback) — used to keep heavy below-the-fold setup
// off the main thread during initial load.
function onIdle(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 200);
  }
}

// Navbar: transparent → solid on scroll
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mobile menu toggle
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', function () {
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isOpen));
    isOpen ? mobileMenu.setAttribute('hidden', '') : mobileMenu.removeAttribute('hidden');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('hidden', '');
    });
  });
})();

// Smooth anchor scroll (offset for fixed navbar)
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();

// Scroll reveal via IntersectionObserver
(function () {
  if (!('IntersectionObserver' in window) || prefersReducedMotion) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();

// Testimonials carousel — infinite seamless loop
// Deferred to idle time: clones 10 slides + reads offsetWidth (forced reflow),
// which showed up as a long main-thread task during initial load.
onIdle(function () {
  var track = document.getElementById('carouselTrack');
  var dotsNav = document.getElementById('carouselDots');
  if (!track || !dotsNav) return;

  var originals = Array.from(track.querySelectorAll('.carousel-slide'));
  var N = originals.length;
  var btnPrev = document.querySelector('.carousel-btn--prev');
  var btnNext = document.querySelector('.carousel-btn--next');
  var timer = null;
  var idx = 0;
  var jumping = false;
  var GAP = 20;

  // Clone all slides and append — enables seamless forward loop
  originals.forEach(function (s) {
    var c = s.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('a, button').forEach(function (el) {
      el.setAttribute('tabindex', '-1');
    });
    track.appendChild(c);
  });

  function perView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function slideW() {
    var pv = perView();
    return (track.parentElement.offsetWidth - GAP * (pv - 1)) / pv;
  }

  function applySlideWidths() {
    var w = slideW();
    track.querySelectorAll('.carousel-slide').forEach(function (s) {
      s.style.width = w + 'px';
      s.style.flexShrink = '0';
      s.style.flexGrow = '0';
      s.style.flexBasis = w + 'px';
    });
  }

  function setPos(i, animate) {
    var w = slideW();
    track.style.transition = animate ? '' : 'none';
    track.style.transform = 'translateX(-' + (i * (w + GAP)) + 'px)';
  }

  function dotCount() { return Math.ceil(N / perView()); }
  function dotIdx() { return Math.floor((idx % N) / perView()); }

  function buildDots() {
    dotsNav.innerHTML = '';
    for (var i = 0; i < dotCount(); i++) {
      (function (n) {
        var b = document.createElement('button');
        b.className = 'carousel-dot';
        b.setAttribute('aria-label', 'Página ' + (n + 1));
        b.addEventListener('click', function () {
          goTo(n * perView());
          resetTimer();
        });
        dotsNav.appendChild(b);
      })(i);
    }
    updateDots();
  }

  function updateDots() {
    var di = dotIdx();
    dotsNav.querySelectorAll('.carousel-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === di);
    });
  }

  function goTo(newIdx, animate) {
    if (jumping) return;
    idx = newIdx;
    setPos(idx, animate !== false);
    updateDots();

    // Reached cloned zone — silently reset to real slides after animation
    if (idx >= N) {
      jumping = true;
      setTimeout(function () {
        idx = idx - N;
        setPos(idx, false);
        jumping = false;
      }, 530);
    }
  }

  function next() { goTo(idx + 1); }

  function prev() {
    if (jumping) return;
    if (idx > 0) {
      goTo(idx - 1);
    } else {
      // Jump to end of originals via clone, then animate backward
      jumping = true;
      setPos(N, false);
      setTimeout(function () {
        idx = N - 1;
        setPos(idx, true);
        updateDots();
        jumping = false;
      }, 20);
    }
  }

  function startTimer() { timer = setInterval(next, 5000); }
  function stopTimer() { clearInterval(timer); }
  function resetTimer() { stopTimer(); startTimer(); }

  if (btnPrev) btnPrev.addEventListener('click', function () { prev(); resetTimer(); });
  if (btnNext) btnNext.addEventListener('click', function () { next(); resetTimer(); });

  // Prev/Next buttons never disabled in infinite mode
  if (btnPrev) btnPrev.disabled = false;
  if (btnNext) btnNext.disabled = false;

  // Pause on hover
  var wrapper = track.parentElement;
  wrapper.addEventListener('mouseenter', stopTimer);
  wrapper.addEventListener('mouseleave', startTimer);

  // Touch / swipe
  var sx = 0;
  track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
  }, { passive: true });

  // Resize: reset and rebuild
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      idx = 0;
      jumping = false;
      applySlideWidths();
      buildDots();
      setPos(0, false);
    }, 200);
  });

  applySlideWidths();
  buildDots();
  setPos(0, false);
  startTimer();
});

// FAQ Accordion
(function () {
  var btns = document.querySelectorAll('.faq-question');
  if (!btns.length) return;

  // Remove HTML hidden — CSS + aria-expanded control visibility
  document.querySelectorAll('.faq-answer').forEach(function (ans) {
    ans.removeAttribute('hidden');
  });

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      // Close all
      btns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      // Toggle current
      this.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });
})();

// Footer year
(function () {
  var el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

// Animated number counter
(function () {
  if (!('IntersectionObserver' in window) || prefersReducedMotion) return;

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1600;
    const start = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutCubic(progress) * target);
      el.textContent = prefix + value;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    observer.observe(el);
  });
})();

// GA4 — Track WhatsApp clicks by section
(function () {
  if (typeof gtag !== 'function') return;

  var waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var section = this.closest('section');
      var sectionId = section ? section.id : (this.classList.contains('whatsapp-float') ? 'floating_button' : 'unknown');

      gtag('event', 'whatsapp_click', {
        section: sectionId,
        button_text: this.textContent.trim().substring(0, 50)
      });
    });
  });
})();

// GA4 — Track FAQ opens
(function () {
  if (typeof gtag !== 'function') return;

  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpening = this.getAttribute('aria-expanded') !== 'true';
      if (isOpening) {
        var questionText = this.querySelector('span') ? this.querySelector('span').textContent.trim() : '';
        gtag('event', 'faq_open', {
          question: questionText.substring(0, 80)
        });
      }
    });
  });
})();

// GA4 — Track carousel interaction (first interaction only per session)
(function () {
  if (typeof gtag !== 'function') return;

  var tracked = false;
  function trackOnce(action) {
    if (tracked) return;
    tracked = true;
    gtag('event', 'carousel_interact', { action: action });
  }

  var btnPrev = document.querySelector('.carousel-btn--prev');
  var btnNext = document.querySelector('.carousel-btn--next');
  if (btnPrev) btnPrev.addEventListener('click', function () { trackOnce('prev_button'); });
  if (btnNext) btnNext.addEventListener('click', function () { trackOnce('next_button'); });

  var dotsNav = document.getElementById('carouselDots');
  if (dotsNav) {
    dotsNav.addEventListener('click', function (e) {
      if (e.target.classList.contains('carousel-dot')) trackOnce('dot_navigation');
    });
  }
})();

// Lightbox for gallery images
(function () {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  if (!lightbox || !lightboxImg) return;

  var lastTrigger = null;

  function openLightbox(src, caption, trigger) {
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lastTrigger = trigger;
    lightbox.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLightbox(
        btn.getAttribute('data-lightbox-src'),
        btn.getAttribute('data-lightbox-caption'),
        btn
      );
    });
  });

  document.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();
