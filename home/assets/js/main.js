const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    navigation.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1120) closeMenu();
  });
}

const calculator = document.querySelector('#calculator-form');
const calculatorResult = document.querySelector('#calc-result');

calculator?.addEventListener('submit', (event) => {
  event.preventDefault();
  calculatorResult.textContent = 'Расчёт подключим после согласования формул';
});

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) status.textContent = 'Заявка отправлена';
  });
});

const slider = document.querySelector('[data-slider]');
const slide = (direction) => {
  if (!slider) return;
  slider.scrollBy({ left: slider.clientWidth * direction, behavior: 'smooth' });
};
document.querySelector('[data-slider-prev]')?.addEventListener('click', () => slide(-1));
document.querySelector('[data-slider-next]')?.addEventListener('click', () => slide(1));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Появление блоков снизу вверх: всё, что ещё не размечено .reveal в блоках после первого экрана и в подвале,
// получает класс автоматически; соседние элементы появляются лесенкой.
document.querySelectorAll('main section[id]:not(#hero):not(#header) .about-wrap > *, .ft .about-wrap > *').forEach((el) => {
  if (!el.classList.contains('reveal') && !el.querySelector('.reveal')) el.classList.add('reveal');
});
document.querySelectorAll('.ft-grid > *').forEach((el) => el.classList.add('reveal'));
document.querySelectorAll('.ft-grid').forEach((el) => el.classList.remove('reveal'));
const revealItems = document.querySelectorAll('.reveal');
revealItems.forEach((item) => {
  const siblings = [...item.parentElement.children].filter((el) => el.classList.contains('reveal'));
  const i = siblings.indexOf(item);
  if (i > 0) item.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
});

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

// Первый экран: нижняя строка заголовка заходит за крышу машины на вырезанном слое (~30 % высоты строки).
// Крыша на фото — 34,7 % высоты кадра 2560×1440. Если заголовок выше крыши — опускаем заголовок,
// если ниже — сдвигаем/увеличиваем оба слоя картинки одинаково.
(() => {
  const stage = document.querySelector('.hero-stage');
  const title = stage?.querySelector('h1');
  const layers = stage ? [...stage.querySelectorAll('.hero-photo, .hero-front')] : [];
  if (!stage || !title) return;
  const ROOF = 0.347;
  const reset = () => {
    title.style.marginTop = '';
    layers.forEach((el) => { el.style.objectPosition = ''; el.style.transform = ''; el.style.transformOrigin = ''; });
  };
  const fit = () => {
    reset();
    if (!stage.querySelector('.hero-front') || window.innerWidth <= 820) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const ih = 1440 * Math.max(w / 2560, h / 1440);
    const line = parseFloat(getComputedStyle(title).lineHeight) || title.offsetHeight / 2;
    const target = title.offsetTop + title.offsetHeight - line * 0.3; // где должна быть крыша
    let offY = (h - ih) * 0.62;
    const roof = offY + ROOF * ih;
    if (roof >= target) { title.style.marginTop = (roof - target) + 'px'; return; }
    offY = Math.min(0, target - ROOF * ih);
    const k = Math.max(1, target / (offY + ROOF * ih));
    layers.forEach((el) => {
      el.style.objectPosition = `50% ${offY}px`;
      if (k > 1) { el.style.transformOrigin = '50% 0'; el.style.transform = `scale(${k})`; }
    });
  };
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  document.fonts?.ready.then(fit);
})();

// Лента «Что входит»: стрелки, шкала с номерами, активный пункт по прокрутке
(() => {
  const track = document.querySelector('[data-inc-track]');
  if (!track) return;
  const cards = [...track.children];
  const dots = [...document.querySelectorAll('[data-inc-dot]')];
  const prev = document.querySelector('[data-inc-prev]');
  const next = document.querySelector('[data-inc-next]');
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const current = () => Math.round(track.scrollLeft / step());
  const go = (i) => track.scrollTo({ left: Math.max(0, Math.min(i, cards.length - 1)) * step(), behavior: 'smooth' });
  const sync = () => {
    const i = current();
    const max = track.scrollWidth - track.clientWidth - 2;
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
  };
  prev?.addEventListener('click', () => go(current() - 1));
  next?.addEventListener('click', () => go(current() + 1));
  dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.incDot)));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();

// Как проходит оформление: клик по этапу — меняем картинку и описание справа
(() => {
  const steps = [...document.querySelectorAll('.pr-step')];
  const media = document.querySelector('[data-step-card] .pr-media');
  const img = document.querySelector('[data-step-img]');
  const text = document.querySelector('[data-step-text]');
  if (!steps.length || !img || !text) return;
  steps.forEach((btn) => btn.addEventListener('click', () => {
    steps.forEach((b) => b.classList.toggle('is-active', b === btn));
    media.classList.add('is-fading');
    setTimeout(() => {
      img.src = btn.dataset.img;
      img.alt = btn.dataset.alt;
      media.className = 'pr-media pr-media--' + btn.dataset.kind;
      text.textContent = btn.dataset.text;
    }, 180);
  }));
})();

// Отзывы: лента по две карточки, стрелки листают парами, счётчик страниц
(() => {
  const track = document.querySelector('[data-rv-track]');
  const count = document.querySelector('[data-rv-count]');
  if (!track) return;
  const cards = [...track.children];
  const perPage = () => Math.max(1, Math.round(track.clientWidth / (cards[0].getBoundingClientRect().width + 16)));
  const pages = () => Math.ceil(cards.length / perPage());
  const page = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (n) => { const p = (n + pages()) % pages(); track.scrollTo({ left: p * (track.clientWidth + 16), behavior: 'smooth' }); };
  const sync = () => { if (count) count.textContent = Math.min(page() + 1, pages()) + ' / ' + pages(); };
  document.querySelector('[data-rv-prev]')?.addEventListener('click', () => go(page() - 1));
  document.querySelector('[data-rv-next]')?.addEventListener('click', () => go(page() + 1));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
