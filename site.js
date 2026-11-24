const menu = document.querySelector('.menu');
menu.querySelector('nav').addEventListener('click', () => { menu.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const gallery = document.querySelector('.gallery');
const pager = document.querySelector('.pager');
const [prev, next] = pager.querySelectorAll('button');
const plates = [...gallery.children];
const galleryDesktop = matchMedia('(min-width:850px)');
let activePlate = 0;
let galleryTimer;
let galleryVisible = false;
let galleryInteracted = false;

function showPlate(index) {
  activePlate = (index + plates.length) % plates.length;
  const middle = Math.floor(plates.length / 2);
  plates.forEach((plate, i) => {
    const slot = (i - activePlate + middle + plates.length) % plates.length - middle;
    plate.style.setProperty('--slot', slot);
    plate.classList.toggle('in-frame', slot === 0);
    plate.classList.toggle('distant', Math.abs(slot) > 1);
    plate.setAttribute('aria-hidden', String(!galleryDesktop.matches && slot !== 0));
  });
  pager.querySelector('.count').textContent = (activePlate + 1) + ' de ' + plates.length;
}
function scheduleGallery() {
  clearInterval(galleryTimer);
  if (galleryVisible && (galleryDesktop.matches || !galleryInteracted) && !document.hidden && !reduced.matches) {
    galleryTimer = setInterval(() => showPlate(activePlate + 1), 8000);
  }
}
function stopGalleryTimer() {
  galleryInteracted = true;
  clearInterval(galleryTimer);
}
function movePlate(direction) {
  stopGalleryTimer();
  showPlate(activePlate + direction);
  scheduleGallery();
}
prev.onclick = () => movePlate(-1);
next.onclick = () => movePlate(1);
gallery.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  movePlate(event.key === 'ArrowRight' ? 1 : -1);
});
let galleryTouch;
gallery.addEventListener('touchstart', event => {
  if (galleryDesktop.matches) return;
  galleryTouch = event.touches[0];
  stopGalleryTimer();
}, {passive:true});
gallery.addEventListener('touchcancel', () => { galleryTouch = null; });
gallery.addEventListener('touchend', event => {
  if (!galleryTouch) return;
  const dx = event.changedTouches[0].clientX - galleryTouch.clientX;
  const dy = event.changedTouches[0].clientY - galleryTouch.clientY;
  galleryTouch = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    event.preventDefault();
    movePlate(dx < 0 ? 1 : -1);
  }
}, {passive:false});
gallery.addEventListener('click', event => {
  const index = plates.indexOf(event.target.closest('.plate'));
  if (index >= 0) {
    stopGalleryTimer();
    showPlate(index);
    scheduleGallery();
  }
});
gallery.addEventListener('focusin', event => {
  stopGalleryTimer();
  const index = plates.indexOf(event.target);
  if (galleryDesktop.matches && index >= 0) showPlate(index);
  scheduleGallery();
});
pager.addEventListener('focusin', stopGalleryTimer);
document.addEventListener('visibilitychange', scheduleGallery);
reduced.addEventListener('change', scheduleGallery);
new IntersectionObserver(([entry]) => {
  galleryVisible = entry.isIntersecting;
  scheduleGallery();
}, {threshold:.5}).observe(gallery);
function adaptPlateLayout() {
  gallery.classList.toggle('circular', !galleryDesktop.matches);
  plates.forEach(plate => { plate.tabIndex = galleryDesktop.matches ? 0 : -1; });
  showPlate(activePlate);
  scheduleGallery();
}
galleryDesktop.addEventListener('change', adaptPlateLayout);
adaptPlateLayout();
pager.hidden = false;

const drawingPointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
for (const card of gallery.children) {
  card.addEventListener('pointerenter', event => {
    if (!galleryDesktop.matches || event.pointerType !== 'mouse') return;
    showPlate(plates.indexOf(card));
    scheduleGallery();
  });
  const art = card.querySelector('.plate-art');
  card.addEventListener('pointermove', event => {
    if (!drawingPointer.matches || event.pointerType !== 'mouse') return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    art.style.setProperty('--turn', (16 * x) + 'deg');
    art.style.setProperty('--pitch', (-16 * y) + 'deg');
    art.style.setProperty('--drift', (18 * x) + 'px');
  });
  card.addEventListener('pointerleave', () => {
    for (const key of ['--turn', '--pitch', '--drift']) art.style.removeProperty(key);
  });
}
const enterSection = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('entered');
    enterSection.unobserve(entry.target);
  }
}, {threshold:0.16});
for (const element of document.querySelectorAll('#possibilidades .section-head, #sobre .team-print, #servicos .section-head')) {
  enterSection.observe(element);
}

const wide = matchMedia('(min-width:850px)');
const teamTrack = document.querySelector('.team-track');
const teamScene = teamTrack.querySelector('.team-scene');
const profiles = teamScene.querySelector('.team-profiles');
const teamMobile = matchMedia('(max-width:759px)');
function updateTeamStack() {
  teamTrack.classList.toggle('stacked', teamMobile.matches);
  if (!teamMobile.matches) return;
  const travel = teamTrack.offsetHeight - teamScene.offsetHeight;
  if (travel <= 0) return;
  const freeSpace = innerHeight - teamScene.offsetHeight - 16;
  const stickyTop = Math.min(freeSpace / 2, freeSpace);
  teamScene.style.setProperty('--scene-top', stickyTop + 'px');
  const distance = stickyTop - teamTrack.getBoundingClientRect().top;
  const progress = Math.max(0, Math.min(1, (distance / travel - .12) / .52));
  profiles.style.setProperty('--swap', progress);
  profiles.style.setProperty('--lift', Math.sin(progress * Math.PI));
  teamTrack.classList.toggle('show-victor', progress >= .5);
}
teamMobile.addEventListener('change', updateTeamStack);
window.addEventListener('scroll', () => { if (teamMobile.matches) updateTeamStack(); }, {passive:true});
window.addEventListener('resize', updateTeamStack);
updateTeamStack();
const methodSteps = [...document.querySelectorAll('.method-path li')];
const methodDetail = document.querySelector('#method-detail');
const methodButtons = methodSteps.map((step, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-controls', 'method-detail');
  button.textContent = step.querySelector('h3 span:last-child').textContent;
  button.onclick = () => selectMethod(index);
  button.onfocus = () => selectMethod(index);
  button.onpointermove = event => { if (event.pointerType === 'mouse') selectMethod(index); };
  step.append(button);
  return button;
});
function selectMethod(index) {
  if (methodButtons[index].getAttribute('aria-pressed') === 'true') return;
  methodButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
  methodDetail.querySelector('h3').textContent = methodSteps[index].querySelector('h3 span:last-child').textContent;
  methodDetail.querySelector('p').textContent = methodSteps[index].querySelector('p').textContent;
}
let methodFrame = 0;
function syncMethodToScroll() {
  if (!wide.matches || methodFrame) return;
  methodFrame = requestAnimationFrame(() => {
    methodFrame = 0;
    if (!wide.matches) return;
    const readingLine = window.innerHeight * 0.4;
    const next = methodSteps.findIndex(step => step.getBoundingClientRect().top > readingLine);
    selectMethod(next < 0 ? methodSteps.length - 1 : Math.max(0, next - 1));
  });
}
function adaptMethod() {
  document.querySelector('.method-layout').classList.toggle('interactive', wide.matches);
  methodDetail.hidden = !wide.matches;
  methodButtons.forEach(button => { button.hidden = !wide.matches; });
  syncMethodToScroll();
}
selectMethod(0);
adaptMethod();
wide.addEventListener('change', adaptMethod);
window.addEventListener('scroll', syncMethodToScroll, {passive:true});
window.addEventListener('resize', syncMethodToScroll);
if ('IntersectionObserver' in window) {
  const visibleSteps = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleSteps.add(entry.target);
      else visibleSteps.delete(entry.target);
    }
    const first = methodSteps.find(step => visibleSteps.has(step));
    methodSteps.forEach(step => step.classList.toggle('current', step === first && !wide.matches));
  }, {rootMargin: '-25% 0px -43% 0px'});
  methodSteps.forEach(step => observer.observe(step));
}
const showcase = document.querySelector('.service-showcase');
const deck = showcase.querySelector('.service-deck');
const cards = [...deck.children];
const controls = showcase.querySelector('.service-nav');
const [back, forward] = controls.querySelectorAll('button');
let activeService = 0;
let rotating = !reduced.matches;
let inView = false;
let interval;

function showService(index) {
  activeService = (index + cards.length) % cards.length;
  cards.forEach((card, i) => {
    const offset = (i - activeService + cards.length) % cards.length;
    card.dataset.position = ['center', 'right', 'left'][offset];
    card.setAttribute('aria-hidden', String(offset !== 0));
  });
  controls.querySelector('span').textContent = (activeService + 1) + ' de ' + cards.length;
}
function scheduleService() {
  clearInterval(interval);
  controls.querySelector('span').setAttribute('aria-live', rotating ? 'off' : 'polite');
  if (rotating && inView && !document.hidden && !showcase.matches(':hover')) {
    interval = setInterval(() => showService(activeService + 1), 8000);
  }
}
function chooseService(index) {
  rotating = false;
  showService(index);
  scheduleService();
}
back.onclick = () => chooseService(activeService - 1);
forward.onclick = () => chooseService(activeService + 1);
showcase.addEventListener('focusin', event => {
  if (event.target.matches(':focus-visible')) { rotating = false; scheduleService(); }
});
showcase.addEventListener('pointerenter', scheduleService);
showcase.addEventListener('pointerleave', scheduleService);
let startTouch;
deck.addEventListener('touchstart', event => { startTouch = event.touches[0]; }, {passive:true});
deck.addEventListener('touchcancel', () => { startTouch = null; });
deck.addEventListener('touchend', event => {
  if (!startTouch) return;
  const dx = event.changedTouches[0].clientX - startTouch.clientX;
  const dy = event.changedTouches[0].clientY - startTouch.clientY;
  startTouch = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    event.preventDefault();
    chooseService(activeService + (dx < 0 ? 1 : -1));
  }
}, {passive:false});
deck.addEventListener('click', event => {
  const card = event.target.closest('article');
  if (card && card !== cards[activeService]) chooseService(cards.indexOf(card));
});
document.addEventListener('visibilitychange', scheduleService);
reduced.addEventListener('change', () => {
  if (reduced.matches) { rotating = false; scheduleService(); }
});
showService(0);
deck.classList.add('ready');
controls.hidden = false;
scheduleService();
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  scheduleService();
}, {threshold:0.4}).observe(deck);

const form = document.querySelector('#lead');
const email = form.querySelector('[type=email]');
const offers = form.querySelector('#offers');
function updateEmailRequirement() {
  email.required = offers.checked;
  form.querySelector('#email-hint').textContent = offers.checked ? '(obrigatório para ofertas)' : '(opcional)';
}
offers.addEventListener('change', updateEmailRequirement);
window.addEventListener('pageshow', updateEmailRequirement);
form.addEventListener('submit', event => {
  event.preventDefault();
  form.reset();
  updateEmailRequirement();
  form.querySelector('[role=status]').textContent = 'Teste concluído. Os campos foram apagados. Nenhum contato foi enviado.';
});
form.querySelector('[type=submit]').disabled = false;

const choices = document.querySelector('#ad-choices');
const cookieBanner = document.querySelector('.cookie-banner');
const adStatus = document.querySelector('#ad-status');
const preferenceKey = 'bau.demo.publicidade.v1';
function showPreference(value) {
  cookieBanner.hidden = value === 'allow' || value === 'deny';
  for (const button of choices.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.value === value));
  }
  adStatus.textContent = value === 'allow' ? 'Você aceitou nesta demonstração.' :
    value === 'deny' ? 'Você recusou nesta demonstração.' : 'Nenhuma escolha registrada.';
}
try {
  showPreference(sessionStorage.getItem(preferenceKey));
} catch {
  showPreference(null);
}
function choosePreference(event) {
  const button = event.target.closest('button');
  if (!button) return;
  showPreference(button.value);
  try {
    sessionStorage.setItem(preferenceKey, button.value);
  } catch {
    adStatus.textContent += ' A escolha vale apenas enquanto esta página estiver aberta.';
  }
}
choices.addEventListener('click', choosePreference);
cookieBanner.addEventListener('click', choosePreference);
choices.hidden = false;
