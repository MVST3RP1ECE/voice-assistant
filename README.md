# VoiceAssistantDiplom

Проект состоит из двух сервисов:

| **Backend** (`Backend/AuthMicroservice`) | Go 1.25, chi | PORT: 8080 |
| **Frontend** (`Frontend/AuthFront`) | React 19, Vite 8, TypeScript, Tailwind CSS | PORT: 5173 |

---

## Запуск через Docker

### 1. Сборка и запуск Backend

```bash
cd Backend/AuthMicroservice

docker build -t auth-service .

docker run -d -p 8080:8080 --name auth-go-service auth-service
```

Сервис доступен по адресу: `http://localhost:8080`

### 2. Сборка и запуск Frontend

```bash
cd Frontend/AuthFront

docker build -t react-front .

docker run -d -p 5173:80 --name auth-front react-front
```

Приложение доступно по адресу: `http://localhost:5173`

---

## Важно: CORS

Frontend обращается к API по адресу `http://localhost:8080/api/v1` (задано в `Frontend/AuthFront/.env`).

Backend принимает запросы только из указанных origin'ов в `Backend/AuthMicroservice/.env`:

```
API_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:8082,http://localhost:8083
```

## Полезные команды Docker

```bash
# Остановить и удалить контейнеры
docker stop auth-go-service auth-front
docker rm auth-go-service auth-front

# Просмотр логов
docker logs auth-go-service
docker logs auth-front

# Пересобрать образ без кеша
docker build --no-cache -t auth-service .
docker build --no-cache -t react-front .
