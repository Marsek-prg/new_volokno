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
    document.querySelector('#service-fields').innerHTML = draft.services.items.map((item, index) => `
      <div class="service-editor">
        <div class="card-index">УСЛУГА ${String(index + 1).padStart(2, '0')}</div>
        <h3>${item.name || 'Новая услуга'}</h3>
        <label>Название<input data-service-field="${index}.name" value="${escapeHtml(item.name)}" /></label>
        <label>Описание<textarea data-service-field="${index}.description" rows="3">${escapeHtml(item.description)}</textarea></label>
        <label>Цена или условие<input data-service-field="${index}.price" value="${escapeHtml(item.price)}" /></label>
      </div>`).join('');
    document.querySelectorAll('[data-field], [data-service-field]').forEach((field) => field.addEventListener('input', onInput));
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

  const onInput = (event) => {
    const field = event.currentTarget;
    if (field.dataset.field) set(field.dataset.field, field.value);
    if (field.dataset.serviceField) {
      const [index, key] = field.dataset.serviceField.split('.');
      draft.services.items[Number(index)][key] = field.value;
      const heading = field.closest('.service-editor')?.querySelector('h3');
      if (heading && key === 'name') heading.textContent = field.value || 'Новая услуга';
    }
    markChanged();
  };

  const showPanel = (name) => {
    panels.forEach((panel) => panel.classList.toggle('is-visible', panel.dataset.panel === name));
    document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === name));
    title.textContent = ({ overview: 'Обзор сайта', hero: 'Главный экран', services: 'Услуги и цены', contacts: 'Контакты' })[name];
  };

  document.querySelectorAll('[data-tab], [data-tab-jump]').forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.tab || button.dataset.tabJump)));
  document.querySelector('#save-button').addEventListener('click', () => {
    localStorage.setItem(window.VOLOKNO_STORAGE_KEY, JSON.stringify(draft));
    status.textContent = 'Изменения опубликованы на этом устройстве';
    status.style.color = '#318e77';
  });
  document.querySelector('#image-upload').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { status.textContent = 'Файл больше 2 МБ — выберите изображение легче'; status.style.color = '#b34a3c'; event.target.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => { draft.hero.image = reader.result; preview.src = reader.result; markChanged(); });
    reader.readAsDataURL(file);
  });
  render();
})();

