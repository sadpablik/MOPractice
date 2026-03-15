# Shoe Store WebApp

Веб-приложение для управления товарами обувного магазина.

Технологии:
- Frontend: React + Vite
- Backend: FastAPI + Uvicorn
- Данные: загрузка товаров из `import/Tovar.xlsx`
- Картинки: раздаются backend по пути `/images/*`

## Что уже реализовано

- Авторизация по ролям: администратор, менеджер, клиент, гость
- Список товаров с ценой, скидкой, остатком и фотографией
- Подсветка товаров:
	- голубой фон, если товара нет на складе
	- зеленый фон, если скидка больше 15%
- Фильтрация и поиск товаров для менеджера и администратора
- Блок заказов для менеджера и администратора
- REST API для авторизации, товаров и заказов

## Структура проекта

```text
webapp/
	backend/
		app/
			main.py
			schemas.py
			store.py
		requirements.txt
	frontend/
		src/
		package.json
	README.md
```

## Требования

- Python 3.14+
- Node.js 18+
- npm

## Установка зависимостей

Backend:
```powershell
cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\backend
c:/Users/sadpa/Projects/STUDY/METODOLOGIARAZRABOTKIPO/.venv/Scripts/python.exe -m pip install -r requirements.txt
```

Frontend:
```powershell
cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\frontend
npm install
```

## Запуск (2 отдельных терминала)

Терминал 1 (backend):
```powershell
cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\backend
c:/Users/sadpa/Projects/STUDY/METODOLOGIARAZRABOTKIPO/.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

Терминал 2 (frontend):
```powershell
cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Открыть:
- Frontend: http://127.0.0.1:5173
- Backend API docs: http://127.0.0.1:8000/docs
- Backend health: http://127.0.0.1:8000/health

## Запуск одной командой (PowerShell)

Команда откроет 2 новых окна: одно для backend, второе для frontend.

```powershell
Start-Process powershell -ArgumentList '-NoExit','-Command','cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\backend; c:/Users/sadpa/Projects/STUDY/METODOLOGIARAZRABOTKIPO/.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000'; Start-Process powershell -ArgumentList '-NoExit','-Command','cd C:\Users\sadpa\Projects\STUDY\METODOLOGIARAZRABOTKIPO\PRACTICEONEEEE\webapp\frontend; npm run dev -- --host 127.0.0.1 --port 5173'
```

## Демо-аккаунты

- Администратор: admin@shop.local / admin123
- Менеджер: manager@shop.local / manager123
- Клиент: client@shop.local / client123
- Можно войти как гость без логина

## API

- POST `/auth/login`
- GET `/products`
- POST `/products`
- PUT `/products/{article}`
- DELETE `/products/{article}`
- GET `/orders`
- POST `/orders`
- PUT `/orders/{order_id}`
- DELETE `/orders/{order_id}`

## Источник данных

- Товары автоматически загружаются из `PRACTICEONEEEE/import/Tovar.xlsx` при старте backend.
- Изображения берутся из `PRACTICEONEEEE/import` и доступны по URL `http://127.0.0.1:8000/images/<filename>`.
- Если изображение отсутствует, используется `picture.png`.

## Если сайт не открывается

1. Проверь, что backend отвечает: http://127.0.0.1:8000/health
2. Проверь, что frontend запущен на 5173 порту
3. Не добавляй лишние символы перед командами (`мц`, `мцс` и т.д.)
4. Если порт занят, освободи его или смени порт в командах запуска
5. После изменений сделай жесткое обновление страницы: Ctrl+F5
