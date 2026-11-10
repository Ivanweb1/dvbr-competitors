// Свои выпадающие списки в стиле сайта поверх нативных <select> калькулятора.
// Нативный select остаётся источником значения: при выборе ставим value и шлём change/input,
// поэтому логика калькулятора клиента работает без изменений.
(() => {
  const root = document.getElementById('dvbr-customs-calculator');
  if (!root) return;
  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5"/></svg>';
  const CHEV = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
  const items = [];
  let openItem = null;

  const visibleOptions = (sel) => [...sel.options].filter((o) => !o.hidden && o.style.display !== 'none');

  function close() {
    if (!openItem) return;
    openItem.wrap.classList.remove('is-open');
    openItem.btn.setAttribute('aria-expanded', 'false');
    openItem = null;
  }

  function choose(item, value) {
    const { sel } = item;
    if (sel.value !== value) {
      sel.value = value;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    sync(item);
    close();
    item.btn.focus();
  }

  function build(item) {
    const { sel, list } = item;
    list.innerHTML = '';
    visibleOptions(sel).forEach((o) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.value = o.value;
      li.className = 'cs-opt' + (o.value === sel.value ? ' is-selected' : '') + (o.disabled ? ' is-disabled' : '');
      li.setAttribute('aria-selected', o.value === sel.value ? 'true' : 'false');
      li.innerHTML = '<span></span>' + CHECK;
      li.querySelector('span').textContent = o.textContent;
      if (!o.disabled) li.addEventListener('click', () => choose(item, o.value));
      list.appendChild(li);
    });
  }

  function sync(item) {
    const { sel, btn, label } = item;
    const o = sel.options[sel.selectedIndex];
    const text = o ? o.textContent : '';
    if (label.textContent !== text) label.textContent = text;
    btn.disabled = sel.disabled;
  }

  function open(item) {
    if (openItem && openItem !== item) close();
    build(item);
    item.wrap.classList.add('is-open');
    item.btn.setAttribute('aria-expanded', 'true');
    openItem = item;
    const cur = item.list.querySelector('.is-selected') || item.list.firstElementChild;
    cur?.classList.add('is-active');
    cur?.scrollIntoView({ block: 'nearest' });
  }

  function move(item, dir) {
    const opts = [...item.list.querySelectorAll('.cs-opt:not(.is-disabled)')];
    if (!opts.length) return;
    let i = opts.findIndex((o) => o.classList.contains('is-active'));
    opts[i]?.classList.remove('is-active');
    i = Math.max(0, Math.min(opts.length - 1, i + dir));
    opts[i].classList.add('is-active');
    opts[i].scrollIntoView({ block: 'nearest' });
  }

  root.querySelectorAll('select').forEach((sel) => {
    const wrap = document.createElement('div');
    wrap.className = 'cs-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    const aria = sel.getAttribute('aria-label') || sel.closest('label')?.firstChild?.textContent?.trim();
    if (aria) btn.setAttribute('aria-label', aria);
    const label = document.createElement('span');
    label.className = 'cs-label';
    btn.appendChild(label);
    btn.insertAdjacentHTML('beforeend', CHEV);
    const list = document.createElement('ul');
    list.className = 'cs-list';
    list.setAttribute('role', 'listbox');
    sel.classList.add('cs-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.after(wrap);
    wrap.append(btn, list);
    const item = { sel, wrap, btn, list, label };
    items.push(item);
    sync(item);

    btn.addEventListener('click', (e) => { e.stopPropagation(); openItem === item ? close() : open(item); });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (openItem !== item) open(item); else move(item, e.key === 'ArrowDown' ? 1 : -1);
      } else if ((e.key === 'Enter' || e.key === ' ') && openItem === item) {
        e.preventDefault();
        const act = list.querySelector('.is-active');
        if (act) choose(item, act.dataset.value);
      } else if (e.key === 'Escape') { close(); }
    });
    sel.addEventListener('change', () => sync(item));
    new MutationObserver(() => sync(item)).observe(sel, { childList: true, subtree: true, attributes: true });
  });

  document.addEventListener('click', (e) => { if (openItem && !openItem.wrap.contains(e.target)) close(); });
  // Калькулятор иногда меняет value программно (пресеты, сброс) — подтягиваем подписи.
  root.addEventListener('click', () => requestAnimationFrame(() => items.forEach(sync)));
  setInterval(() => items.forEach(sync), 600);
})();
