(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hlavička: pozadie po zrolovaní, schovanie pri rolovaní dole
  const hd = $('#hd'), nav = $('#nav'), burger = $('#burger');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-s', y > innerHeight * .6);
    hd.classList.toggle('is-h', y > lastY && y > innerHeight && !nav.classList.contains('is-o'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = (o) => { nav.classList.toggle('is-o', o); hd.classList.toggle('is-m', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => menu(!nav.classList.contains('is-o')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => menu(false)));

  // video v úvode: pustí sa, až keď je pripravené (poster je pod ním)
  const vid = $('.hero__vid');
  if (vid) {
    if (still) vid.remove();
    else {
      const on = () => vid.classList.add('is-on');
      vid.addEventListener('playing', on, { once: true });
      vid.play?.().catch(() => {});
    }
  }

  // odhalenie pri rolovaní
  // .clip sa sleduje cez rodiča: clip-path inset(100%) by z neho urobil pre IntersectionObserver prázdnu plochu
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { (e.target._rv || e.target).classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv').forEach(el => io.observe(el));
  $$('.clip').forEach(el => { const w = el.parentElement; w._rv = el; io.observe(w); });
  $$('.svcs .svc, .logos li, .nums li, .inz__l li').forEach((el, i, a) => el.style.setProperty('--rd', `${(i % 4) * .07}s`));

  // služby: náhľad fotky pri kurzore
  const pv = $('#pv');
  if (fine && pv) {
    const img = $('img', pv);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * .16; y += (ty - y) * .16;
      pv.style.transform = `translate3d(${x + 30}px, ${y - 110}px, 0) rotate(${Math.max(-6, Math.min(6, (tx - x) * .05))}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(loop) : 0;
    };
    $$('.svc').forEach(li => {
      new Image().src = li.dataset.img;
      li.addEventListener('mouseenter', () => { img.src = li.dataset.img; pv.classList.add('is-on'); });
      li.addEventListener('mouseleave', () => pv.classList.remove('is-on'));
    });
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  }

  // služby → predvyplnenie dopytu
  const typMap = { 'Podvŕtavanie spevnených plôch': 'Podvŕtavanie', 'Inžinierska činnosť': 'Inžinierska činnosť', 'Búracie a demolačné práce': 'Búranie',
    'Rezanie betónu a asfaltu': 'Rezanie betónu / asfaltu', 'Terénne úpravy a planírovanie': 'Terénne úpravy', 'Výkopové a zemné práce': 'Výkop / prípojka',
    'Prípojky, žumpy, bazény': 'Výkop / prípojka', 'Líniové stavby': 'Výkop / prípojka', 'Zhutnenie a povrchy': 'Terénne úpravy' };
  const check = (v) => { const c = $(`.chip input[value="${v}"]`); if (c) c.checked = true; };
  $$('.svc__a').forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === '#kontakt') check(typMap[a.dataset.typ]); }));

  // rez pod cestou: krok podľa rolovania
  const g = $('#rezg'), fig = $('#rezfig'), cap = $('#rezcap'), steps = $$('.step');
  if (g && steps.length) {
    const set = (k) => {
      for (let i = 1; i <= 5; i++) fig.classList.toggle('s' + i, i <= k);
      steps.forEach(s => s.classList.toggle('is-a', +s.dataset.k === k));
      cap.textContent = `0${k} / 05`;
    };
    const mob = matchMedia('(max-width: 900px)').matches;
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.k); }),
      { rootMargin: mob ? '-62% 0px -30% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => so.observe(s));
    set(1);
    if (still) set(5);
  }

  // ktorá metóda
  const rl = $('#r-len'), rd = $('#r-dia'), ol = $('#o-len'), od = $('#o-dia'), ma = $('#m-a'), mb = $('#m-b'), res = $('#calc-res');
  let veta = '';
  const calc = () => {
    const L = +rl.value, d = +rd.value;
    ol.textContent = `${L} m`; od.textContent = `Ø ${d} mm`;
    [rl, rd].forEach(r => r.style.setProperty('--p', `${(r.value - r.min) / (r.max - r.min) * 100}%`));
    const a = d >= 50 && d <= 160 && L <= 20, b = d >= 110 && d <= 250 && L <= 400;
    ma.classList.toggle('is-ok', a); mb.classList.toggle('is-ok', b);
    if (a && b) res.textContent = `Na ${L} m s chráničkou Ø ${d} mm sa dá použiť neriadené pretláčanie aj riadené mikrotunelovanie. Vhodnejšiu metódu Vám odporučíme podľa miesta.`;
    else if (a) res.textContent = `Na ${L} m s chráničkou Ø ${d} mm stačí neriadené pretláčanie.`;
    else if (b) res.textContent = `Na ${L} m s chráničkou Ø ${d} mm je vhodné riadené mikrotunelovanie.`;
    else res.textContent = `Prechod ${L} m s priemerom Ø ${d} mm je mimo našich bežných rozsahov. Napíšte nám, posúdime ho.`;
    veta = `Podvŕtanie: dĺžka približne ${L} m, chránička Ø ${d} mm.`;
  };
  if (rl) { [rl, rd].forEach(r => r.addEventListener('input', calc)); calc(); }
  $('#calc-btn')?.addEventListener('click', () => {
    check('Podvŕtavanie');
    const t = $('#sprava');
    if (t && !t.value.includes('Podvŕtanie:')) t.value = (veta + (t.value ? '\n' + t.value : ''));
  });

  // certifikát
  const lb = $('#lb');
  $('#cert')?.addEventListener('click', () => lb.showModal?.());
  $('#lbx')?.addEventListener('click', () => lb.close());
  lb?.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  // formulár (náhľad neodosiela)
  const f = $('#dopyt'), note = $('#fnote');
  f?.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(i => { const bad = i.type === 'checkbox' ? !i.checked : !i.value.trim(); i.classList.toggle('is-err', bad); if (bad) ok = false; });
    note.classList.toggle('is-ok', ok);
    note.textContent = ok ? 'Ďakujeme. V hotovej verzii príde dopyt priamo na office@prestel.sk.' : 'Vyplňte prosím meno, kontakt a súhlas.';
  });

  // magnetické tlačidlo
  if (fine && !still) $$('.mag').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });

  $('#yr').textContent = new Date().getFullYear();
})();
