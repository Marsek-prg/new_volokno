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

const servicesList = document.querySelector('#services-list');
if (servicesList && content?.services?.items) {
  servicesList.innerHTML = content.services.items.map((item, index) => `
    <article class="service-row" data-service="${index}">
      <span class="service-index">${String(index + 1).padStart(2, '0')}</span>
      <div><h3 data-service-field="name"></h3><p data-service-field="description"></p></div>
      <span class="service-time" data-service-field="price"></span>
    </article>`).join('');
  servicesList.querySelectorAll('[data-service]').forEach((row) => {
    const item = content.services.items[Number(row.dataset.service)];
    row.querySelector('[data-service-field="name"]').textContent = item.name;
    row.querySelector('[data-service-field="description"]').textContent = item.description;
    row.querySelector('[data-service-field="price"]').textContent = item.price;
  });
}

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

