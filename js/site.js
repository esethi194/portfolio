/* ./js/site.js
   Safe "site-wide" JS that only activates features if the page has them.
*/

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

    const nextBtn = $("#nextBtn") || $("#nextBtn", carousel);
    const prevBtn = $("#prevBtn") || $("#prevBtn", carousel);
    const dots = $$(".dot", carousel);

    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.style.opacity = i === current ? "1" : "0";
        slide.style.pointerEvents = i === current ? "auto" : "none";
      });

      if (dots.length) {
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === current);
          dot.style.background =
            i === current ? "rgba(255, 255, 255, 0.90)" : "rgba(255, 255, 255, 0.40)";
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

    // Pause on hover
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

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

    // Sections = the ids referenced by the TOC links
    const sections = tocLinks
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

    // Set active class
    function setActive(id) {
      tocLinks.forEach((a) => a.classList.remove("is-active"));
      const active = toc.querySelector(`a[href="#${id}"]`);
      if (active) active.classList.add("is-active");
    }

    // Click: active immediately + smooth scroll
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

    // Scrollspy
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      {
        threshold: 0.45,
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
