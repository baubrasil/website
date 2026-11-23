const menu = document.querySelector('.menu');
menu.querySelector('nav').addEventListener('click', () => { menu.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
const motion = document.querySelector('.motion-control');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function setPaused(paused) {
  document.body.toggleAttribute('data-paused', paused);
  document.body.toggleAttribute('data-play', !paused);
  motion.textContent = paused ? 'Reproduzir movimento' : 'Pausar movimento';
}
motion.hidden = false;
setPaused(reduced.matches);
motion.onclick = () => setPaused(!document.body.hasAttribute('data-paused'));
reduced.addEventListener('change', () => setPaused(reduced.matches));

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
const journey = document.querySelector('.journey');
const panel = journey.querySelector('.stage-detail');
const stages = [...journey.querySelectorAll('li')];
const stageButtons = stages.map((item, index) => {
  const button = document.createElement('button');
  button.className = 'stage-switch';
  button.type = 'button';
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  button.append(number, item.querySelector('h3').textContent);
  item.prepend(button);
  button.onclick = () => selectStage(index);
  button.onfocus = () => selectStage(index);
  button.onpointerenter = event => { if (event.pointerType === 'mouse') selectStage(index); };
  return button;
});
function selectStage(index) {
  stageButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  panel.querySelector('small').textContent = 'Etapa ' + (index + 1) + ' de ' + stages.length;
  panel.querySelector('h3').textContent = stages[index].querySelector('h3').textContent;
  panel.querySelector('p').textContent = stages[index].querySelector('p').textContent;
}
function adaptSections() {
  journey.classList.toggle('enhanced', wide.matches);
  panel.hidden = !wide.matches;
  stageButtons.forEach(button => { button.hidden = !wide.matches; });
  for (const plate of gallery.children) plate.tabIndex = wide.matches ? 0 : -1;
}
selectStage(0);
adaptSections();
wide.addEventListener('change', adaptSections);

const form = document.querySelector('#lead');
form.querySelector('[type=submit]').disabled = false;
form.addEventListener('submit', event => {
  event.preventDefault();
  form.querySelector('[role=status]').textContent = 'Teste concluído. Na versão publicada, a equipe recebe o contato para combinar a reunião.';
});
