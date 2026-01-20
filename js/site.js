// ./js/site.js


(function () {
  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- year ----------
  function setYear() {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ---------- reveal on scroll ----------
  function initReveal() {
    const reveals = $$(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

// ---------- carousel ----------
function initCarousel() {
  const carousel = $("#carousel");
  if (!carousel) return;

  const slides = $$(".carousel-slide", carousel);
  if (!slides.length) return;

  // Scope buttons to the carousel so you never grab the wrong element
  const nextBtn = $("#nextBtn", carousel);
  const prevBtn = $("#prevBtn", carousel);
  const dots = $$(".dot", carousel);

  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === current;
      slide.style.opacity = isActive ? "1" : "0";
      slide.style.pointerEvents = isActive ? "auto" : "none";
      // Optional but helpful if you use screen readers
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    if (dots.length) {
      dots.forEach((dot, i) => {
        const isActive = i === current;
        dot.classList.toggle("active", isActive);
        dot.style.background = isActive
          ? "rgba(255, 255, 255, 0.90)"
          : "rgba(255, 255, 255, 0.40)";
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }
  }

  function next() {
    show(current + 1);
  }

  function prev() {
    show(current - 1);
  }

  function start() {
    stop();
    timer = setInterval(next, 5000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Buttons
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stop();
      next();
      start();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stop();
      prev();
      start();
    });
  }

  // Dots
  if (dots.length) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stop();
        show(i);
        start();
      });
    });
  }

  // Pause on hover (desktop)
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  // Pause when tab is hidden (prevents “fast-forward” on return)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  // Init
  show(0);
  start();
}


// ---------- case sidebar (scrollspy + click active) ----------
function initCaseToc() {
  const toc = $(".case-toc");
  if (!toc) return;

  const tocLinks = $$('a[href^="#"]', toc);
  if (!tocLinks.length) return;

  const sections = tocLinks
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    tocLinks.forEach((a) => a.classList.remove("is-active"));
    const active = toc.querySelector(`a[href="#${CSS.escape(id)}"]`);
    if (active) active.classList.add("is-active");
  }

  // Click: set active immediately + smooth scroll
  tocLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      setActive(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Scrollspy: choose the most visible intersecting section to avoid flicker
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActive(visible.target.id);
    },
    {
      threshold: [0.25, 0.45, 0.6],
      rootMargin: "-20% 0px -55% 0px",
    }
  );

  sections.forEach((s) => spy.observe(s));
}


  // ---------- run ----------
  // (Using defer in HTML means DOM is ready here)
  setYear();
  initReveal();
  initCarousel();
  initCaseToc();
})();
