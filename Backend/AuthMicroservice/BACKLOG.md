# 13.09.26
    - Добавил nginx.conf в AuthService
    - Добавлен прототип docker-compose.yml
    - Доработал методы JWT-based авториации (генерируется access_token в методах /login, /register, /validate)
    - Добавлен endpoint /allUsers для получения всех созданных (зарегистрированных) пользователей 

[Docker]

# Запуск через Docker
    - Создание образа: docker build -t auth-service .
    - Запуск контейнера: docker run --env-file .env -d -p 8080:8080 --name auth-go-service auth-service
