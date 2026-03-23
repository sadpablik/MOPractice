# Shoe Store WebApp

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/eb8dce507ad04210a9fa15a58662bc97)](https://app.codacy.com/gh/sadpablik/MOPractice/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

Веб-приложение для управления товарами обувного магазина.

Технологии:
- Frontend: React + Vite
- Backend: FastAPI + Uvicorn
- Данные: загрузка товаров из `import/Tovar.xlsx`
- Картинки: раздаются backend по пути `/images/*`

## Что реализовано

- Авторизация по ролям: администратор, менеджер, клиент, гость
- Список товаров с ценой, скидкой, остатком и фотографией
- Подсветка товаров:
	- голубой фон, если товара нет на складе
	- зеленый фон (#2E8B57), если скидка больше 15%
	- перечёркнутая цена при наличии скидки
- Поиск по всем текстовым полям, фильтрация по поставщику
- Сортировка по остатку (↑↓) для менеджера и администратора
- Добавление / редактирование / удаление товаров (администратор)
- Блок заказов для менеджера и администратора
- Добавление / редактирование / удаление заказов (администратор)
- REST API для авторизации, товаров и заказов
- Линтер: ESLint (frontend), Flake8 (backend)

## Структура проекта

```text
webapp/
	backend/
		app/
			main.py
			schemas.py
			store.py
		requirements.txt
		.flake8
	frontend/
		src/
			components/
				LoginPanel.jsx
				ProductTable.jsx
				ProductForm.jsx
				OrdersTable.jsx
				OrderForm.jsx
			App.jsx
			api.js
			styles.css
		eslint.config.js
		package.json
	README.md
```

## Требования

- Python 3.11+
- Node.js 18+
- npm

## Установка зависимостей

Backend:
```powershell
cd PRACTICEONEEEE\webapp\backend
pip install -r requirements.txt
```

Frontend:
```powershell
cd PRACTICEONEEEE\webapp\frontend
npm install
```

## Запуск (2 отдельных терминала)

Терминал 1 (backend):
```powershell
cd PRACTICEONEEEE\webapp\backend
python -m uvicorn app.main:app --reload --port 8000
```

Терминал 2 (frontend):
```powershell
cd PRACTICEONEEEE\webapp\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Открыть:
- Frontend: http://127.0.0.1:5173
- Backend API docs: http://127.0.0.1:8000/docs

## Запуск линтеров

```powershell
# Frontend
cd PRACTICEONEEEE\webapp\frontend
npm run lint

# Backend
cd PRACTICEONEEEE\webapp\backend
flake8 app/
```

## Демо-аккаунты

| Роль | Логин | Пароль |
|---|---|---|
| Администратор | admin@shop.local | admin123 |
| Менеджер | manager@shop.local | manager123 |
| Клиент | client@shop.local | client123 |
| Гость | — | — |

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
