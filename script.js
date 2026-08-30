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
  servicesList.replaceChildren(...content.services.items.map((item, index) => {
    const row = document.createElement('article'); row.className = 'service-row';
    const number = document.createElement('span'); number.className = 'service-index'; number.textContent = String(index + 1).padStart(2, '0');
    const copy = document.createElement('div'); const name = document.createElement('h3'); name.textContent = item.name; const description = document.createElement('p'); description.textContent = item.description; copy.append(name, description);
    const price = document.createElement('span'); price.className = 'service-time'; price.textContent = item.price; row.append(number, copy, price); return row;
  }));
}

const contactLinks = document.querySelector('#contact-links');
if (contactLinks) {
  const contacts = content?.contact?.items || [];
  contactLinks.replaceChildren(...contacts.map((item) => {
    const link = document.createElement('a'); link.href = window.VOLOKNO_SAFE_HREF(item.href);
    const label = document.createElement('span'); label.textContent = item.label; const value = document.createElement('strong'); value.textContent = item.value; link.append(label, value); return link;
  }));
}

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

