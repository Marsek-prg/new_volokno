# ВОЛОКНО

Vanilla HTML/CSS/JS сайт с небольшой CMS-панелью. Контент хранится в PostgreSQL, API работает на FastAPI, reverse proxy и раздача статики — Caddy. Supabase и frontend-фреймворки не используются.

## Локальный запуск

Нужны Docker и Docker Compose.

    copy .env.example .env
    docker compose up --build

Откройте http://localhost и панель http://localhost/admin.html.

Создайте первого администратора:

    docker compose exec api python -m app.create_admin

Команда интерактивно запросит логин и пароль. Пароль не записывается в репозиторий.
Пароль должен содержать минимум 5 символов; параметра --password у команды нет намеренно.

Остановить проект:

    docker compose down

Полностью очистить локальные данные (удалит PostgreSQL, загруженные изображения и данные Caddy):

    docker compose down -v

## Production на Ubuntu VPS

1. Установите Docker Engine и Compose plugin.
2. Выполните git clone репозитория и перейдите в каталог проекта.
3. Скопируйте .env.example в .env.
4. Создайте .env и задайте длинные случайные POSTGRES_PASSWORD и SESSION_SECRET, а в DOMAIN укажите домен.
5. Направьте DNS A-запись домена на IP VPS.
6. Запустите:

    docker compose up -d --build

Caddy автоматически запросит HTTPS-сертификат для настоящего домена. PostgreSQL наружу не публикуется. Для локальной разработки оставляйте DOMAIN=http://localhost и ENVIRONMENT=development; для production используйте DOMAIN=example.ru и ENVIRONMENT=production. В production cookie авторизации получает флаг Secure.

Обновление:

    git pull
    docker compose up -d --build

## Backup PostgreSQL

    docker compose exec -T db pg_dump -U volokno -d volokno > backup.sql

    type backup.sql | docker compose exec -T db psql -U volokno -d volokno

Volume uploads_data также следует регулярно копировать отдельно: в нём находятся загруженные изображения.

## Архитектура и безопасность

- GET /api/content публичен, PUT /api/content требует серверную HttpOnly-сессию.
- Сессии хранятся в PostgreSQL только в виде HMAC-хеша и имеют срок действия.
- Вход ограничен пятью неудачными попытками за пять минут с временной блокировкой.
- Auth-запросы проверяют Origin, а production-сессия использует Secure cookie.
- Контент проходит Pydantic-валидацию: ограничены длины, количество услуг/контактов, URL и HTML не принимается.
- Пользовательский контент выводится через textContent и DOM API, без innerHTML.
- Изображения принимаются только как JPEG/PNG/WebP до 5 МБ с проверкой Pillow и безопасным UUID-именем.
- При недоступном API основной сайт использует VOLOKNO_DEFAULTS.
- Alembic применяет initial migration при старте API.
- Caddy добавляет CSP, HSTS, защиту от MIME-sniffing, iframe и ограничение Permissions Policy.

## Шрифты

В frontend/public/fonts/README.md описаны ожидаемые лицензированные WOFF2-файлы для self-hosted Manrope и Space Mono. Бинарные файлы в проекте отсутствуют и не скачивались. CSS использует локальные @font-face с системным fallback: положите лицензированные файлы в эту папку, после чего шрифты начнут работать без внешних запросов.

## Структура

- frontend/ — существующий vanilla-интерфейс и админка.
- backend/app/ — FastAPI, модели, схемы, авторизация и uploads.
- backend/migrations/ — Alembic.
- docker-compose.yml — caddy, api, db и persistent volumes.
- Caddyfile — маршрутизация API/uploads/frontend и security headers.
