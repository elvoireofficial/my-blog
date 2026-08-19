document.addEventListener('DOMContentLoaded', function () {

  console.log("main.js SUCCESSFULLY LOADED");

  var body = document.body;
  var fashionHeaderBlock = document.getElementById("fashionHeaderBlock");
  var beautyHeaderBlock = document.getElementById("beautyHeaderBlock");
  var headerSpacer = document.getElementById("headerSpacer");
  var topBar = document.querySelector(".top-bar");
  var fashionNavRow = document.getElementById("fashionNavRow");
  var beautyInner = document.querySelector(".beauty-inner");
  var fashionNormalBar = document.querySelector(".fashion-normal-bar");
  var fashionStickyBar = document.getElementById("fashionStickyBar");
  var reinitElvCarousel = null;

  // ===== HERO ELEMENTS =====
  var fashionHero = document.getElementById("fashionHero");
  var beautyHero = document.getElementById("beautyHero");
  var fashionVideo = fashionHero ? fashionHero.querySelector("video") : null;

  // =========================================================
  // MASTER SWITCH FUNCTION (header + hero + galleries)
  // =========================================================
  function switchMode(mode) {
    body.classList.remove("fashion-mode", "beauty-mode");
    body.classList.add(mode + "-mode");

    document.querySelectorAll(".mode-switch .switch-label").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-value") === mode);
    });

    closeAllMobileNavs();

    if (topBar) topBar.classList.remove("is-fixed-mobile");
    if (beautyInner) beautyInner.classList.remove("is-fixed-mobile");
    if (fashionStickyBar) fashionStickyBar.classList.remove("is-visible");
    if (fashionNormalBar) fashionNormalBar.classList.remove("is-hidden");
    if (beautyHeaderBlock) beautyHeaderBlock.classList.remove("is-fixed");
    if (headerSpacer) headerSpacer.style.height = "0px";
    updateFooterCategory(mode);

    // ===== GALLERIES + BANNER SWITCH LOGIC =====
    var fashionModeBlocks = document.querySelectorAll(".fashion-mode-content");
    var beautyModeBlocks = document.querySelectorAll(".beauty-mode-content");

    if (mode === "beauty") {
      fashionModeBlocks.forEach(function (el) { el.style.display = "none"; });
      beautyModeBlocks.forEach(function (el) { el.style.display = "block"; });

      if (typeof reinitElvCarousel === "function") {
        requestAnimationFrame(function () {
          requestAnimationFrame(reinitElvCarousel);
        });
      }
    } else {
      fashionModeBlocks.forEach(function (el) { el.style.display = "block"; });
      beautyModeBlocks.forEach(function (el) { el.style.display = "none"; });
    }

    // ===== HERO SWITCH LOGIC =====
    if (fashionHero && beautyHero) {
      if (mode === "beauty") {
        fashionHero.style.display = "none";
        beautyHero.style.display = "block";
        if (fashionVideo) fashionVideo.pause();
        startBeautyAuto();
      } else {
        beautyHero.style.display = "none";
        fashionHero.style.display = "block";
        if (fashionVideo) {
          fashionVideo.currentTime = 0;
          fashionVideo.play().catch(function () {});
        }
        clearInterval(beautyTimer);
      }
    }

    console.log("Mode switched to:", mode);
  }

  document.querySelectorAll(".mode-switch .switch-label").forEach(function (label) {
    label.addEventListener("click", function () {
      switchMode(this.getAttribute("data-value"));
    });
  });

  // ================= STICKY SCROLL =================
  window.addEventListener("scroll", function () {

    var isMobile = window.innerWidth <= 768;
    var isBeauty = body.classList.contains("beauty-mode");

    // Mobile Sticky Logic
    if (isMobile) {
      var mobileHeaderEl = isBeauty ? beautyInner : topBar;

      if (mobileHeaderEl && window.scrollY > 10) {
        mobileHeaderEl.classList.add("is-fixed-mobile");
        if (headerSpacer) headerSpacer.style.height = mobileHeaderEl.offsetHeight + "px";
      } else if (mobileHeaderEl) {
        mobileHeaderEl.classList.remove("is-fixed-mobile");
        if (headerSpacer) headerSpacer.style.height = "0px";
      }
      return;
    }

    // Desktop Sticky Logic
    if (!isBeauty) {
      var scrollThreshold = 80;

      if (window.scrollY > scrollThreshold) {
        if (fashionStickyBar) fashionStickyBar.classList.add("is-visible");
        if (fashionNormalBar) fashionNormalBar.classList.add("is-hidden");
      } else {
        if (fashionStickyBar) fashionStickyBar.classList.remove("is-visible");
        if (fashionNormalBar) fashionNormalBar.classList.remove("is-hidden");
      }
    } else {
      if (window.scrollY > 30 && beautyHeaderBlock && headerSpacer) {
        beautyHeaderBlock.classList.add("is-fixed");
        headerSpacer.style.height = beautyHeaderBlock.offsetHeight + "px";
      } else if (beautyHeaderBlock && headerSpacer) {
        beautyHeaderBlock.classList.remove("is-fixed");
        headerSpacer.style.height = "0px";
      }
    }
  });
  // ================= SEARCH TOGGLE & SUBMIT LOGIC =================
  var searchBox = document.getElementById("searchBox");
  var searchClose = document.getElementById("searchClose");
  var searchInput = document.getElementById("searchInput") || document.querySelector(".search-input");
  var searchForm = document.getElementById("searchForm");

  function handleSearchClick() {
    if (!searchBox) return;
    
    var isOpen = searchBox.classList.contains("active");
    var query = searchInput ? searchInput.value.trim() : "";

    if (!isOpen) {
      searchBox.classList.add("active");
      if (searchInput) searchInput.focus();
    } else {
      if (query !== "") {
        if (searchForm) {
          searchForm.submit();
        } else if (searchInput) {
          window.location.href = "/search?q=" + encodeURIComponent(query);
        }
      } else {
        searchBox.classList.remove("active");
      }
    }
  }

  var searchBtnFashion = document.getElementById("searchToggleFashion");
  var searchBtnBeauty = document.getElementById("searchToggleBeauty");

  if (searchBtnFashion) searchBtnFashion.addEventListener("click", handleSearchClick);
  if (searchBtnBeauty) searchBtnBeauty.addEventListener("click", handleSearchClick);

  if (searchClose && searchBox) {
    searchClose.addEventListener("click", function () {
      searchBox.classList.remove("active");
    });
  }

  // ================= MOBILE NAV TOGGLES =================
  var navToggleFashion = document.getElementById("navToggleFashion");
  var fashionNav = document.getElementById("fashionNav");

  var navToggleBeauty = document.getElementById("navToggleBeauty");
  var beautyNavWrap = document.getElementById("beautyNavWrap");

  function positionMobileNav(navEl, headerEl) {
    if (!navEl || !headerEl) return;
    var headerBottom = headerEl.getBoundingClientRect().bottom;
    navEl.style.setProperty("top", headerBottom + "px", "important");
    navEl.style.setProperty("height", (window.innerHeight - headerBottom) + "px", "important");
  }

  if (navToggleFashion && fashionNav) {
    navToggleFashion.addEventListener("click", function () {
      var willOpen = !fashionNav.classList.contains("nav-open");
      if (willOpen) positionMobileNav(fashionNav, topBar);
      fashionNav.classList.toggle("nav-open");
      navToggleFashion.classList.toggle("active");
      body.classList.toggle("menu-open");
    });
  }

  if (navToggleBeauty && beautyNavWrap) {
    navToggleBeauty.addEventListener("click", function () {
      var willOpen = !beautyNavWrap.classList.contains("nav-open");
      if (willOpen) positionMobileNav(beautyNavWrap, beautyInner);
      beautyNavWrap.classList.toggle("nav-open");
      navToggleBeauty.classList.toggle("active");
      body.classList.toggle("menu-open");
    });
  }

  function closeAllMobileNavs() {
    if (fashionNav) fashionNav.classList.remove("nav-open");
    if (navToggleFashion) navToggleFashion.classList.remove("active");
    if (beautyNavWrap) beautyNavWrap.classList.remove("nav-open");
    if (navToggleBeauty) navToggleBeauty.classList.remove("active");
    body.classList.remove("menu-open");
  }

  // ================= BEAUTY SLIDER LOGIC =================
  var slides = beautyHero ? beautyHero.querySelectorAll(".beauty-slide") : [];
  var lines = beautyHero ? beautyHero.querySelectorAll(".bp-line") : [];
  var current = 0;
  var beautyTimer;
  var DURATION = 6000;

  function setActiveLine(index) {
    lines.forEach(function (line, i) {
      var fill = line.querySelector("span");
      line.classList.remove("active");
      if (fill) {
        fill.classList.remove("run");
        fill.style.width = "0%";
      }
      if (i === index) {
        line.classList.add("active");
        if (fill) {
          void fill.offsetWidth;
          fill.classList.add("run");
        }
      }
    });
  }

  function goTo(index) {
    if (!slides.length) return;
    slides[current].classList.remove("active");
    slides[index].classList.add("active");
    current = index;
    setActiveLine(current);
  }

  function next() {
    if (!slides.length) return;
    goTo((current + 1) % slides.length);
  }

  function startBeautyAuto() {
    clearInterval(beautyTimer);
    if (slides.length) {
      beautyTimer = setInterval(next, DURATION);
    }
  }

  lines.forEach(function (line) {
    line.addEventListener("click", function () {
      var idx = parseInt(line.dataset.index);
      clearInterval(beautyTimer);
      goTo(idx);
      startBeautyAuto();
    });
  });

  if (beautyHero) {
    beautyHero.addEventListener("mouseenter", function () {
      clearInterval(beautyTimer);
    });
    beautyHero.addEventListener("mouseleave", function () {
      if (body.classList.contains("beauty-mode")) startBeautyAuto();
    });
  }

  // ================= BEAUTY HORIZONTAL SLIDER =================
  const bgSlider = document.getElementById('bgSlider');
  const bgArrowLeft = document.getElementById('bgArrowLeft');
  const bgArrowRight = document.getElementById('bgArrowRight');

  if (bgSlider && bgArrowLeft && bgArrowRight) {
    function getScrollAmount() {
      const card = bgSlider.querySelector('.bg-card-tall');
      if (!card) return 300;
      const style = window.getComputedStyle(bgSlider);
      const gap = parseInt(style.gap) || 14;
      return card.offsetWidth + gap;
    }

    bgArrowLeft.addEventListener('click', function () {
      bgSlider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    bgArrowRight.addEventListener('click', function () {
      bgSlider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
  }

  // ================= ELV CAROUSEL =================
  const track = document.getElementById('elvTrack');
  const prevBtn = document.getElementById('elvPrev');
  const nextBtn = document.getElementById('elvNext');

  if (track) {
    let autoTimer;
    let transitionEndHandler = null;

    function initCarousel() {
      track.querySelectorAll('.elv-clone').forEach(el => el.remove());

      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        track.style.transform = 'none';
        clearInterval(autoTimer);
        return;
      }

      const realSlides = Array.from(track.children);
      const realCount = realSlides.length;

      if (realCount === 0) return;

      const firstClones = realSlides.map(node => {
        const c = node.cloneNode(true);
        c.classList.add('elv-clone');
        return c;
      });
      const lastClones = realSlides.map(node => {
        const c = node.cloneNode(true);
        c.classList.add('elv-clone');
        return c;
      });

      lastClones.forEach(clone => track.insertBefore(clone, track.firstChild));
      firstClones.forEach(clone => track.appendChild(clone));

      let currentIndex = realCount;
      let cardStep = 0;
      const TRANSITION_MS = 800;
      const AUTOPLAY_MS = 3500;

      function measureStep() {
        const firstCard = track.querySelector('.elv-slide');
        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 0;

        cardStep = cardWidth + gap;
      }

      function setPosition(withTransition) {
        track.style.transition = withTransition ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)` : 'none';
        track.style.transform = `translateX(${-currentIndex * cardStep}px)`;
      }

      function goNext() {
        currentIndex++;
        setPosition(true);
      }

      function goPrev() {
        currentIndex--;
        setPosition(true);
      }

      if (transitionEndHandler) {
        track.removeEventListener('transitionend', transitionEndHandler);
      }

      transitionEndHandler = function () {
        if (currentIndex >= realCount * 2) {
          currentIndex = realCount;
          setPosition(false);
        } else if (currentIndex < realCount) {
          currentIndex = realCount * 2 - 1;
          setPosition(false);
        }
      };

      track.addEventListener('transitionend', transitionEndHandler);

      function startAutoplay() {
        clearInterval(autoTimer);
        autoTimer = setInterval(goNext, AUTOPLAY_MS);
      }

      if (nextBtn) {
        nextBtn.onclick = function (e) {
          if (e) e.preventDefault();
          goNext();
          startAutoplay();
        };
      }

      if (prevBtn) {
        prevBtn.onclick = function (e) {
          if (e) e.preventDefault();
          goPrev();
          startAutoplay();
        };
      }

      requestAnimationFrame(() => {
        measureStep();
        setPosition(false);
        startAutoplay();
      });
    }

    reinitElvCarousel = initCarousel;
    initCarousel();

    let resizeTimeout;
    const elvWrap = track.closest('.elv-carousel-wrap');

    if (elvWrap && window.ResizeObserver) {
      const elvResizeObserver = new ResizeObserver(function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCarousel, 150);
      });
      elvResizeObserver.observe(elvWrap);
    } else {
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCarousel, 150);
      });
    }
  }
  switchMode("fashion");

});
// ================= SHOP THE LOOK / RITUAL EDIT CAROUSEL (Reusable) =================
function createShopCarousel(trackEl, prevEl, nextEl) {
  if (!trackEl) return;

  let autoTimer;
  let transitionEndHandler = null;
  let startAutoplayFn = function () {};

  function init() {
    trackEl.querySelectorAll('.stl-clone').forEach(el => el.remove());

    const realSlides = Array.from(trackEl.children);
    const realCount = realSlides.length;
    if (realCount === 0) return;

    const firstClones = realSlides.map(node => { const c = node.cloneNode(true); c.classList.add('stl-clone'); return c; });
    const lastClones = realSlides.map(node => { const c = node.cloneNode(true); c.classList.add('stl-clone'); return c; });

    lastClones.forEach(clone => trackEl.insertBefore(clone, trackEl.firstChild));
    firstClones.forEach(clone => trackEl.appendChild(clone));

    let currentIndex = realCount;
    let cardStep = 0;
    const TRANSITION_MS = 800;
    const AUTOPLAY_MS = 3500;

    function measureStep() {
      const firstCard = trackEl.querySelector('.stl-slide');
      if (!firstCard) return;
      const cardWidth = firstCard.getBoundingClientRect().width;
      const style = window.getComputedStyle(trackEl);
      const gap = parseFloat(style.gap) || 0;
      cardStep = cardWidth + gap;
    }

    function setPosition(withTransition) {
      trackEl.style.transition = withTransition ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)` : 'none';
      trackEl.style.transform = `translateX(${-currentIndex * cardStep}px)`;
    }

    function goNext() { currentIndex++; setPosition(true); }
    function goPrev() { currentIndex--; setPosition(true); }

    if (transitionEndHandler) trackEl.removeEventListener('transitionend', transitionEndHandler);
    transitionEndHandler = function () {
      if (currentIndex >= realCount * 2) { currentIndex = realCount; setPosition(false); }
      else if (currentIndex < realCount) { currentIndex = realCount * 2 - 1; setPosition(false); }
    };
    trackEl.addEventListener('transitionend', transitionEndHandler);

    function startAutoplay() {
      clearInterval(autoTimer);
      autoTimer = setInterval(goNext, AUTOPLAY_MS);
    }
    startAutoplayFn = startAutoplay;

    if (nextEl) nextEl.onclick = function (e) { if (e) e.preventDefault(); goNext(); startAutoplay(); };
    if (prevEl) prevEl.onclick = function (e) { if (e) e.preventDefault(); goPrev(); startAutoplay(); };

    requestAnimationFrame(() => { measureStep(); setPosition(false); startAutoplay(); });
  }

  init();

  let resizeTimeout;
  const wrapEl = trackEl.closest('.stl-carousel-wrap');

  if (wrapEl && window.ResizeObserver) {
    const ro = new ResizeObserver(function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(init, 150);
    });
    ro.observe(wrapEl);
  } else {
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(init, 150);
    });
  }

  if (wrapEl) {
    wrapEl.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    wrapEl.addEventListener('mouseleave', function () { startAutoplayFn(); });
  }
}

createShopCarousel(document.getElementById('stlTrack'), document.getElementById('stlPrev'), document.getElementById('stlNext'));
createShopCarousel(document.getElementById('gtlTrack'), document.getElementById('gtlPrev'), document.getElementById('gtlNext'));

function updateFooterCategory(activeCategory) {
  const fashionBlock = document.getElementById('footer-fashion-content');
  const beautyBlock = document.getElementById('footer-beauty-content');

  if (activeCategory === 'beauty') {
    fashionBlock.style.display = 'none';
    beautyBlock.style.display = 'block';
  } else {
    fashionBlock.style.display = 'block';
    beautyBlock.style.display = 'none';
  }
}