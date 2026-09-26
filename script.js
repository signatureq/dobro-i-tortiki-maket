const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen) return closeMenu();
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Закрыть меню');
  menu.classList.add('is-open');
  document.body.classList.add('menu-open');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

document.querySelectorAll('.faq-list details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

const mockForm = document.querySelector('#mock-form');
mockForm?.addEventListener('submit', event => {
  event.preventDefault();
  mockForm.querySelector('.form-result').textContent = 'Это макет: заявка не отправлена. После согласования подключим запись.';
});

const selectedProgram = new URLSearchParams(window.location.search).get('program');
if (mockForm && selectedProgram) {
  const select = mockForm.elements.program;
  if ([...select.options].some(option => option.value === selectedProgram)) select.value = selectedProgram;
}

const demoToast = document.querySelector('.demo-toast');
let toastTimeout;
document.querySelectorAll('[data-demo-contact]').forEach(button => {
  button.addEventListener('click', () => {
    demoToast.textContent = `Это макет: ссылку на ${button.dataset.demoContact} добавим, когда школа пришлёт контакты.`;
    demoToast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { demoToast.hidden = true; }, 5500);
  });
});

// Content is visible by default. Motion is enabled only when the browser can observe it.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const plan = [
    ['.hero h1','left',0], ['.hero-lead','left',110], ['.hero-facts','left',210], ['.hero-actions','left',320],
    ['.benefits .section-title','up',0], ['.process .section-title','up',0],
    ['.schedule .section-title','up',0], ['.formats .section-title','up',0], ['.atmosphere .section-title','up',0],
    ['.gallery .section-title','up',0], ['.reviews .section-title','up',0],
    ['.questions .section-title','up',0], ['.contact-copy','left',0], ['.contact-form','right',120]
  ];
  for (const [selector,direction,delay] of plan) {
    const element = document.querySelector(selector);
    if (!element) continue;
    element.dataset.reveal = direction;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
  }
  const groups = [
    ['.mosaic-photo','image',85], ['.benefit-grid > *','up',65], ['.schedule-grid > *','up',70], ['.school-photos figure','image',80], ['.teacher-photo','image',0], ['.teacher-copy','up',80], ['.gallery-grid figure','image',60], ['.service-heading','left',0], ['.service-hero-photo','image',110], ['.service-photos figure','image',80],
    ['.process-step','up',75], ['.format-card','up',90],
    ['.atmo-tile','image',55], ['.gallery-strip img','image',60],
    ['.review-card','up',90], ['.faq-list details','up',55]
  ];
  for (const [selector,direction,step] of groups) {
    document.querySelectorAll(selector).forEach((element,index) => {
      element.dataset.reveal = direction;
      element.style.setProperty('--reveal-delay', `${Math.min(index * step,320)}ms`);
    });
  }
  const mosaicNote = document.querySelector('.mosaic-note');
  if (mosaicNote) {
    mosaicNote.dataset.reveal = 'up';
    mosaicNote.style.setProperty('--reveal-delay','380ms');
  }

  const observer = new IntersectionObserver((entries,current) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      current.unobserve(entry.target);
    }
  }, {threshold:.06,rootMargin:'0px 0px -6% 0px'});
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
}

// The form is already the booking destination; keep its controls unobstructed.
const contactSection = document.querySelector('.contact');
const floatingBooking = document.querySelector('.floating-booking');
if (contactSection && floatingBooking && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    floatingBooking.hidden = entry.isIntersecting;
  }, {threshold: 0.05}).observe(contactSection);
}
