const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

const content = window.getVoloknoContent?.();

const getValue = (path) => path.split('.').reduce((value, key) => value?.[key], content);

document.querySelectorAll('[data-content]').forEach((element) => {
  const value = getValue(element.dataset.content);
  if (typeof value === 'string') element.textContent = value;
});

document.querySelectorAll('[data-content-image]').forEach((element) => {
  const value = getValue(element.dataset.contentImage);
  if (typeof value === 'string') element.src = value;
  if (content?.hero?.imageAlt) element.alt = content.hero.imageAlt;
});

document.querySelectorAll('[data-service]').forEach((row) => {
  const item = content?.services?.items?.[Number(row.dataset.service)];
  if (!item) return;
  row.querySelector('[data-service-field="name"]').textContent = item.name;
  row.querySelector('[data-service-field="description"]').textContent = item.description;
  row.querySelector('[data-service-field="price"]').textContent = item.price;
});

document.querySelectorAll('[data-contact-link]').forEach((link) => {
  const type = link.dataset.contactLink;
  const value = content?.contact?.[type];
  if (!value) return;
  link.querySelector('strong').textContent = value;
  link.href = type === 'phone' ? `tel:${value.replace(/[^+\d]/g, '')}` : type === 'email' ? `mailto:${value}` : `https://t.me/${value.replace('@', '')}`;
});

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

