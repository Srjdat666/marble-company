(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // سنة التذييل تلقائياً
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ===== شريط الصور في الواجهة ===== */
  const slides  = $$('.slider > img');
  const caption = $('#slide-caption');
  const dotsBox = $('#dots');
  const media   = $('.hero-media');

  if (slides.length > 1 && dotsBox) {
    let current = 0;
    let timer = null;

    const dots = slides.map((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'عرض الصورة ' + (n + 1));
      b.addEventListener('click', () => { show(n); restart(); });
      dotsBox.appendChild(b);
      return b;
    });

    function show(n) {
      slides[current].classList.remove('active');
      dots[current].removeAttribute('aria-current');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].setAttribute('aria-current', 'true');
      if (caption) caption.textContent = slides[current].alt;
    }

    function start() {
      if (reduceMotion || timer) return;
      timer = setInterval(() => show(current + 1), 5000);
    }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    show(0);
    start();

    // توقف أثناء التمرير فوق الصورة أو التنقل بلوحة المفاتيح، وعند إخفاء التبويب
    if (media) {
      media.addEventListener('mouseenter', stop);
      media.addEventListener('mouseleave', start);
      media.addEventListener('focusin', stop);
      media.addEventListener('focusout', start);
    }
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  }

  /* ===== عارض صور المعرض ===== */
  const tiles    = $$('.gallery-grid .tile');
  const lightbox = $('#lightbox');
  const lbImg    = $('#lightbox-img');
  const lbCount  = $('#lb-count');
  const btnClose = $('#lb-close');
  const btnPrev  = $('#lb-prev');
  const btnNext  = $('#lb-next');

  if (tiles.length && lightbox) {
    let index = 0;
    let lastFocus = null;

    function render() {
      const img = $('img', tiles[index]);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = (index + 1) + ' / ' + tiles.length;
    }
    function open(n) {
      index = n;
      lastFocus = document.activeElement;
      render();
      lightbox.hidden = false;
      document.body.classList.add('lb-open');
      btnClose.focus();
    }
    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('lb-open');
      if (lastFocus) lastFocus.focus();
    }
    function go(step) {
      index = (index + step + tiles.length) % tiles.length;
      render();
    }

    tiles.forEach((t, n) => t.addEventListener('click', () => open(n)));
    btnClose.addEventListener('click', close);
    btnNext.addEventListener('click', () => go(1));
    btnPrev.addEventListener('click', () => go(-1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', e => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      // الصفحة من اليمين لليسار: السهم الأيسر = التالي
      if (e.key === 'ArrowLeft')  go(1);
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'Tab') {
        const f = [btnClose, btnPrev, btnNext];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // السحب على الجوال: سحب لليمين = التالي (اتجاه RTL)
    let x0 = null;
    lightbox.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
      x0 = null;
    });
  }
})();
