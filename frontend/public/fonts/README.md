# Self-hosted fonts

Сейчас страницы временно используют Google Fonts, чтобы сохранить текущий визуальный вид.
Для production можно положить сюда лицензированные файлы:

- Manrope-Regular.woff2
- Manrope-Medium.woff2
- Manrope-SemiBold.woff2
- Manrope-Bold.woff2
- Manrope-ExtraBold.woff2
- SpaceMono-Regular.woff2
- SpaceMono-Bold.woff2

После этого добавьте соответствующие @font-face в frontend/styles.css и frontend/admin.css, а ссылки на Google Fonts удалите из HTML. Бинарные шрифты намеренно не включены в репозиторий.
