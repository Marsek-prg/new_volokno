(async function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('#site-nav');
  const render = (content) => {
    const get = (path) => path.split('.').reduce((value, key) => value?.[key], content);
    document.querySelectorAll('[data-content]').forEach((element) => { const value = get(element.dataset.content); if (typeof value === 'string') element.textContent = value; });
    document.querySelectorAll('[data-content-image]').forEach((element) => { const value = get(element.dataset.contentImage); if (typeof value === 'string') element.src = value; if (content.hero.imageAlt) element.alt = content.hero.imageAlt; });
    const servicesList = document.querySelector('#services-list');
    if (servicesList) servicesList.replaceChildren(...content.services.items.map((item, index) => {
      const row = document.createElement('article'); row.className = 'service-row';
      const number = document.createElement('span'); number.className = 'service-index'; number.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('div'); const name = document.createElement('h3'); name.textContent = item.name; const description = document.createElement('p'); description.textContent = item.description; copy.append(name, description);
      const price = document.createElement('span'); price.className = 'service-time'; price.textContent = item.price; row.append(number, copy, price); return row;
    }));
    const contactLinks = document.querySelector('#contact-links');
    if (contactLinks) contactLinks.replaceChildren(...content.contact.items.map((item) => {
      const link = document.createElement('a'); link.href = window.VOLOKNO_SAFE_HREF(item.href);
      const label = document.createElement('span'); label.textContent = item.label; const value = document.createElement('strong'); value.textContent = item.value; link.append(label, value); return link;
    }));
    const phone = content.contact.items.find((item) => /телефон/i.test(item.label));
    document.querySelectorAll('[data-contact-phone]').forEach((link) => {
      if (phone) { link.href = window.VOLOKNO_SAFE_HREF(phone.href); link.textContent = phone.value; }
    });
  };
  try {
    const response = await fetch('/api/content', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    if (!response.ok) throw new Error('content request failed');
    render(window.normalizeVoloknoContent(await response.json()));
  } catch (error) { render(window.getVoloknoContent()); }
  menuToggle?.addEventListener('click', () => { const isOpen = siteNav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { siteNav.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); }));
})();
