(function () {
  const defaults = {
    hero: {
      title: 'Связь должна работать. Мы знаем, как её восстановить.',
      lead: 'Монтаж, диагностика и ремонт волоконно-оптических линий для домов, предприятий и инфраструктурных объектов.',
      note: 'Работаем по согласованному плану, без лишних этапов',
      caption: 'Точная работа с каждой жилой',
      image: 'public/hero-fiber.png',
      imageAlt: 'Подготовка волоконно-оптического кабеля к сварке'
    },
    services: {
      title: 'От первого сигнала до готовой линии',
      summary: 'Подключаем, проверяем и возвращаем в работу оптические линии. Вы получаете понятный результат и рекомендации по дальнейшей эксплуатации.',
      items: [
        { name: 'Монтаж ВОЛС', description: 'Прокладка кабеля, подготовка трассы, монтаж муфт и коммутационных элементов.', price: 'Срок зависит от объекта' },
        { name: 'Диагностика и измерения', description: 'Поиск повреждений и потерь с помощью рефлектометра и измерительного оборудования.', price: 'Выезд по запросу' },
        { name: 'Сварка оптических волокон', description: 'Точная сварка, укладка в кассеты и проверка качества соединений.', price: 'От одного соединения' },
        { name: 'Ремонт и восстановление', description: 'Локализуем неисправность, восстанавливаем линию и фиксируем причину сбоя.', price: 'Срочный выезд возможен' }
      ]
    },
    approach: {
      title: 'Сначала понимаем объект. Потом делаем работу.',
      text: 'Оптика не любит догадок. Перед началом уточняем схему, состояние линии и ограничения площадки. После работ передаём результат и рекомендации простым языком.'
    },
    contact: {
      title: 'Опишите задачу. Мы ответим по делу.',
      text: 'Контактные данные сейчас временные. Перед публикацией заменим их на подтверждённые реквизиты компании.',
      phone: '+7 999 000-00-00',
      email: 'hello@volokno.example',
      telegram: '@volokno_example',
      items: [
        { label: 'Телефон', value: '+7 999 000-00-00', href: 'tel:+79990000000' },
        { label: 'Email', value: 'hello@volokno.example', href: 'mailto:hello@volokno.example' },
        { label: 'Telegram', value: '@volokno_example', href: 'https://t.me/volokno_example' }
      ]
    }
  };

  window.VOLOKNO_DEFAULTS = defaults;
  window.VOLOKNO_STORAGE_KEY = 'volokno-content-v1';
  const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const text = (value, fallback = '') => typeof value === 'string' ? value.slice(0, 4000) : fallback;
  const safeImage = (value) => typeof value === 'string' && (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value) || /^(public|assets)\/[a-z0-9._/-]+\.(png|jpe?g|webp)$/i.test(value));
  const safeHref = (value) => {
    if (typeof value !== 'string') return '#';
    const candidate = value.trim().slice(0, 1000);
    if (candidate === '#') return candidate;
    try {
      const url = new URL(candidate, window.location.href);
      return ['https:', 'mailto:', 'tel:', 'tg:'].includes(url.protocol) ? url.href : '#';
    } catch (error) { return '#'; }
  };
  const normalize = (raw) => {
    if (!isRecord(raw)) return defaults;
    const value = {
      hero: { ...defaults.hero, ...(isRecord(raw.hero) ? raw.hero : {}) },
      services: { ...defaults.services, ...(isRecord(raw.services) ? raw.services : {}) },
      approach: { ...defaults.approach, ...(isRecord(raw.approach) ? raw.approach : {}) },
      contact: { ...defaults.contact, ...(isRecord(raw.contact) ? raw.contact : {}) }
    };
    value.hero.title = text(value.hero.title, defaults.hero.title); value.hero.lead = text(value.hero.lead, defaults.hero.lead); value.hero.note = text(value.hero.note, defaults.hero.note); value.hero.caption = text(value.hero.caption, defaults.hero.caption); value.hero.imageAlt = text(value.hero.imageAlt, defaults.hero.imageAlt); value.hero.image = safeImage(value.hero.image) ? value.hero.image : defaults.hero.image;
    value.services.title = text(value.services.title, defaults.services.title); value.services.summary = text(value.services.summary, defaults.services.summary);
    value.services.items = Array.isArray(value.services.items) ? value.services.items.filter(isRecord).slice(0, 50).map((item) => ({ name: text(item.name, 'Новая услуга'), description: text(item.description), price: text(item.price, 'По запросу') })) : defaults.services.items;
    value.approach.title = text(value.approach.title, defaults.approach.title); value.approach.text = text(value.approach.text, defaults.approach.text);
    value.contact.title = text(value.contact.title, defaults.contact.title); value.contact.text = text(value.contact.text, defaults.contact.text);
    value.contact.items = Array.isArray(value.contact.items) ? value.contact.items.filter(isRecord).slice(0, 30).map((item) => ({ label: text(item.label, 'Контакт'), value: text(item.value), href: safeHref(item.href) })) : defaults.contact.items;
    return value;
  };
  window.VOLOKNO_SAFE_HREF = safeHref;
  window.getVoloknoContent = function () {
    try {
      const saved = localStorage.getItem(window.VOLOKNO_STORAGE_KEY);
      return normalize(saved ? JSON.parse(saved) : defaults);
    } catch (error) {
      return defaults;
    }
  };
})();

