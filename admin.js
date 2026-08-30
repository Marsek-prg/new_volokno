(function () {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  let draft = clone(window.getVoloknoContent());
  const panels = [...document.querySelectorAll('[data-panel]')];
  const title = document.querySelector('#page-title');
  const status = document.querySelector('#save-status');
  const preview = document.querySelector('#image-preview img');

  const get = (path) => path.split('.').reduce((value, key) => value?.[key], draft);
  const set = (path, value) => {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((value, key) => value[key], draft);
    target[last] = value;
  };

  const markChanged = () => {
    status.textContent = 'Есть несохранённые изменения';
    status.style.color = '#b66b32';
  };

  const render = () => {
    document.querySelectorAll('[data-field]').forEach((field) => {
      field.value = get(field.dataset.field) || '';
    });
    preview.src = draft.hero.image;
    const makeField = (label, attribute, value, type = 'text', placeholder = '') => { const wrapper = document.createElement('label'); wrapper.textContent = label; const input = document.createElement('input'); input.type = type; input.value = value || ''; input.dataset[attribute.startsWith('service') ? 'serviceField' : 'contactField'] = attribute.includes('.') ? attribute : ''; if (placeholder) input.placeholder = placeholder; wrapper.append(input); return wrapper; };
    const serviceFields = document.querySelector('#service-fields'); serviceFields.replaceChildren(...draft.services.items.map((item, index) => { const box = document.createElement('div'); box.className = 'service-editor'; const kicker = document.createElement('div'); kicker.className = 'card-index'; kicker.textContent = `УСЛУГА ${String(index + 1).padStart(2, '0')}`; const heading = document.createElement('div'); heading.className = 'service-editor-heading'; const name = document.createElement('h3'); name.textContent = item.name || 'Новая услуга'; const remove = document.createElement('button'); remove.className = 'remove-service'; remove.type = 'button'; remove.dataset.removeService = index; remove.setAttribute('aria-label', 'Удалить услугу'); remove.textContent = 'Удалить'; heading.append(name, remove); const nameField = makeField('Название', `${index}.name`, item.name); nameField.firstElementChild.dataset.serviceField = `${index}.name`; const descField = document.createElement('label'); descField.textContent = 'Описание'; const desc = document.createElement('textarea'); desc.rows = 3; desc.value = item.description || ''; desc.dataset.serviceField = `${index}.description`; descField.append(desc); const priceField = makeField('Цена или условие', `${index}.price`, item.price); priceField.firstElementChild.dataset.serviceField = `${index}.price`; box.append(kicker, heading, nameField, descField, priceField); return box; }));
    const contactFields = document.querySelector('#contact-fields'); contactFields.replaceChildren(...(draft.contact.items || []).map((item, index) => { const box = document.createElement('div'); box.className = 'service-editor contact-editor'; const heading = document.createElement('div'); heading.className = 'service-editor-heading'; const kicker = document.createElement('div'); kicker.className = 'card-index'; kicker.textContent = `КОНТАКТ ${String(index + 1).padStart(2, '0')}`; const remove = document.createElement('button'); remove.className = 'remove-service'; remove.type = 'button'; remove.dataset.removeContact = index; remove.setAttribute('aria-label', 'Удалить контакт'); remove.textContent = 'Удалить'; heading.append(kicker, remove); const label = makeField('Название поля', `${index}.label`, item.label); label.firstElementChild.dataset.contactField = `${index}.label`; const value = makeField('Значение', `${index}.value`, item.value); value.firstElementChild.dataset.contactField = `${index}.value`; const href = makeField('Ссылка или действие', `${index}.href`, item.href, 'text', 'https://... или tel:+7...'); href.firstElementChild.dataset.contactField = `${index}.href`; const hint = document.createElement('small'); hint.textContent = 'Оставьте #, если это просто текст без перехода.'; href.append(hint); box.append(heading, label, value, href); return box; }));
    document.querySelectorAll('[data-field], [data-service-field], [data-contact-field]').forEach((field) => field.addEventListener('input', onInput));
  };

  const onInput = (event) => {
    const field = event.currentTarget;
    if (field.dataset.field) set(field.dataset.field, field.value);
    if (field.dataset.serviceField) {
      const [index, key] = field.dataset.serviceField.split('.');
      draft.services.items[Number(index)][key] = field.value;
      const heading = field.closest('.service-editor')?.querySelector('h3');
      if (heading && key === 'name') heading.textContent = field.value || 'Новая услуга';
    }
    if (field.dataset.contactField) {
      const [index, key] = field.dataset.contactField.split('.');
      draft.contact.items[Number(index)][key] = field.value;
    }
    markChanged();
  };

  const showPanel = (name) => {
    panels.forEach((panel) => panel.classList.toggle('is-visible', panel.dataset.panel === name));
    document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === name));
    title.textContent = ({ overview: 'Обзор сайта', hero: 'Главный экран', services: 'Услуги и цены', contacts: 'Контакты' })[name];
  };

  document.querySelectorAll('[data-tab], [data-tab-jump]').forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.tab || button.dataset.tabJump)));
  document.querySelector('#add-service').addEventListener('click', () => {
    draft.services.items.push({ name: '', description: '', price: 'По запросу' });
    render();
    markChanged();
    document.querySelector('#service-fields .service-editor:last-child input')?.focus();
  });
  document.querySelector('#service-fields').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-service]');
    if (!button) return;
    if (draft.services.items.length === 1) { status.textContent = 'Должна остаться хотя бы одна услуга'; status.style.color = '#b34a3c'; return; }
    draft.services.items.splice(Number(button.dataset.removeService), 1);
    render();
    markChanged();
  });
  document.querySelector('#add-contact').addEventListener('click', () => {
    draft.contact.items = draft.contact.items || [];
    draft.contact.items.push({ label: '', value: '', href: '#' });
    render();
    markChanged();
    document.querySelector('#contact-fields .contact-editor:last-child input')?.focus();
  });
  document.querySelector('#contact-fields').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-contact]');
    if (!button) return;
    if (draft.contact.items.length === 1) { status.textContent = 'Должно остаться хотя бы одно контактное поле'; status.style.color = '#b34a3c'; return; }
    draft.contact.items.splice(Number(button.dataset.removeContact), 1);
    render();
    markChanged();
  });
  document.querySelector('#save-button').addEventListener('click', () => {
    draft.contact.items = (draft.contact.items || []).map((item) => ({ ...item, href: window.VOLOKNO_SAFE_HREF(item.href) }));
    localStorage.setItem(window.VOLOKNO_STORAGE_KEY, JSON.stringify(draft));
    status.textContent = 'Изменения опубликованы на этом устройстве';
    status.style.color = '#318e77';
  });
  document.querySelector('#image-upload').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (file.size > 2 * 1024 * 1024 || !allowedTypes.has(file.type)) { status.textContent = 'Выберите PNG, JPG или WebP размером до 2 МБ'; status.style.color = '#b34a3c'; event.target.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const bytes = new Uint8Array(reader.result); const isPng = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71; const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255; const isWebp = bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80;
      if (!(isPng || isJpeg || isWebp)) { status.textContent = 'Файл не похож на корректное изображение'; status.style.color = '#b34a3c'; event.target.value = ''; return; }
      const encoded = new FileReader(); encoded.addEventListener('load', () => { draft.hero.image = encoded.result; preview.src = encoded.result; markChanged(); }); encoded.readAsDataURL(file);
    });
    reader.readAsArrayBuffer(file);
  });
  render();
})();

