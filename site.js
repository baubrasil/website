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
function updatePager() {
  const frame = gallery.getBoundingClientRect();
  const visible = [...gallery.children].map((card, i) => {
    const bounds = card.getBoundingClientRect();
    return bounds.left >= frame.left - 2 && bounds.right <= frame.right + 2 ? i + 1 : 0;
  }).filter(Boolean);
  if (visible.length) pager.querySelector('.count').textContent = visible.join(' · ') + ' de ' + gallery.children.length;
  prev.disabled = gallery.scrollLeft <= 2;
  next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
}
function turn(direction) {
  const step = gallery.children[1].offsetLeft - gallery.children[0].offsetLeft;
  gallery.scrollBy({left: direction * step, behavior: reduced.matches ? 'instant' : 'smooth'});
}
prev.onclick = () => turn(-1);
next.onclick = () => turn(1);
pager.hidden = false;
gallery.addEventListener('scroll', updatePager, {passive:true});
new ResizeObserver(updatePager).observe(gallery);
updatePager();

const wide = matchMedia('(min-width:850px)');
const steps = [...document.querySelectorAll('.method-steps details')];
const pins = [...document.querySelectorAll('.method-pin')];
const loops = [...document.querySelectorAll('.method-loops ellipse')];
function syncMethod() {
  steps.forEach((step, index) => {
    pins[index].classList.toggle('selected', step.open);
    loops[index].classList.toggle('selected', step.open);
    if (step.open) pins[index].setAttribute('aria-current', 'step');
    else pins[index].removeAttribute('aria-current');
  });
}
steps.forEach((step, index) => {
  step.addEventListener('toggle', syncMethod);
  pins[index].addEventListener('click', event => {
    event.preventDefault();
    step.open = true;
    step.querySelector('summary').focus({preventScroll: wide.matches});
  });
});
syncMethod();
function adaptGallery() {
  for (const plate of gallery.children) plate.tabIndex = wide.matches ? 0 : -1;
}
adaptGallery();
wide.addEventListener('change', adaptGallery);

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
