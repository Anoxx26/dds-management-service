# dds-management-service

## Инструкция по запуску через Docker

### 1. Предварительные требования

Убедитесь, что у вас установлены:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Подготовка

Клонируйте репозиторий и перейдите в папку проекта:

```bash
git clone <ссылка-на-ваш-репозиторий>
cd <название-папки-проекта>
```

### 3. Запуск проекта

Для сборки образов и запуска всех сервисов (Django + БД) выполните одну команду:

```bash
docker-compose -f docker/docker-compose.yml up --build
```

### 4. Запуск и настройка базы данных

При первом запуске проект автоматически выполнит следующие действия внутри контейнера `web`:

- **Ожидание готовности базы данных.**
- **Применение всех миграций.**
- **Загрузка начальных данных (фикстур)** из `apps/dictionaries/fixtures/initial_data.json`.
- **Запуск сервера разработки.**

Если вам нужно выполнить действия вручную (например, обновить фикстуры или создать суперпользователя), используйте следующие команды:

**Применить миграции вручную:**

```bash
docker-compose exec web python manage.py migrate
```

**Загрузить фикстуры вручную:**

```bash
docker-compose exec web python manage.py loaddata apps/dictionaries/fixtures/initial_data.json
```

**Создать суперпользователя:**

```bash
docker-compose exec web python manage.py createsuperuser
```

## Альтернативный способ запуска (без Docker)

Этот способ не рекомендуется для продуктовой среды, так как требует ручной настройки окружения и системных зависимостей (PostgreSQL).

### 1. Подготовка окружения

Убедитесь, что у вас установлен Python 3.12.10 и PostgreSQL. Создайте виртуальное окружение:

```bash
python -m venv venv
# Активация (Windows)
venv\Scripts\activate
# Активация (Linux/macOS)
source venv/bin/activate
```

### 2. Установка зависимостей

Установите необходимые библиотеки:

```bash
pip install -r requirements.txt
```

### 3. Настройка базы данных

- **Создайте базу данных в PostgreSQL (назовите её dds_finance или укажите свою).**
- **Настройте переменные окружения (создайте файл .env в корне проекта или экспортируйте их в терминале):**

```bash
export DB_NAME=dds_finance
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password
export DB_HOST=localhost
export DB_PORT=5432
```

### 4. Запуск приложения

Выполните миграции и запустите сервер:

```bash
# Применение миграций
python manage.py migrate

# Загрузка фикстур
python manage.py loaddata apps/dictionaries/fixtures/initial_data.json

# Запуск сервера
python manage.py runserver
```
